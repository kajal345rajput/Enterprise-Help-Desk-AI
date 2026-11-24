
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, Ticket, TicketMessage
from .serializers import TicketSerializer, TicketMessageSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        department = request.data.get("department", "")

        if not username or not email or not password:
            return Response(
                {"error": "Username, email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        UserProfile.objects.create(
            user=user,
            role="EMPLOYEE",
            department=department
        )

        return Response(
            {
                "message": "Account created successfully.",
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "EMPLOYEE",
                "department": department
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "This account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={"role": "EMPLOYEE"}
        )

        return Response(
            {
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": profile.role,
                    "department": profile.department
                }
            },
            status=status.HTTP_200_OK
        )


class TicketListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, "profile"):
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN
            )

        role = user.profile.role

        if role == "EMPLOYEE":
            tickets = Ticket.objects.filter(employee=user)

        elif role == "SUPPORT":
            tickets = Ticket.objects.filter(assigned_to=user)

        elif role == "ADMIN":
            tickets = Ticket.objects.all()

        else:
            return Response(
                {"error": "Access denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        tickets = tickets.select_related(
            "employee",
            "assigned_to"
        ).prefetch_related(
            "messages__sender"
        ).order_by("-created_at")

        serializer = TicketSerializer(
            tickets,
            many=True,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        if not hasattr(request.user, "profile"):
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.profile.role != "EMPLOYEE":
            return Response(
                {"error": "Only employees can create tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TicketSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            ticket = serializer.save(employee=request.user)

            return Response(
                TicketSerializer(
                    ticket,
                    context={"request": request}
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class TicketDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_ticket(self, request, pk):
        try:
            ticket = Ticket.objects.select_related(
                "employee",
                "assigned_to"
            ).prefetch_related(
                "messages__sender"
            ).get(pk=pk)

        except Ticket.DoesNotExist:
            return None

        user = request.user

        if not hasattr(user, "profile"):
            return None

        role = user.profile.role

        # Employees can access only their own tickets.
        if role == "EMPLOYEE":
            if ticket.employee_id != user.id:
                return None

        # Support staff can access only assigned tickets.
        elif role == "SUPPORT":
            if ticket.assigned_to_id != user.id:
                return None

        # Admins can access all tickets.
        elif role != "ADMIN":
            return None

        return ticket

    def get(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if ticket is None:
            return Response(
                {"error": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TicketSerializer(
            ticket,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def patch(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if ticket is None:
            return Response(
                {"error": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        role = request.user.profile.role

        if role not in ["SUPPORT", "ADMIN"]:
            return Response(
                {"error": "Only support staff and admins can update tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        update_data = request.data.copy()

        # Only admins can assign or unassign support staff.
        if "assigned_to_id" in update_data:

            if role != "ADMIN":
                return Response(
                    {"error": "Only admins can assign support staff."},
                    status=status.HTTP_403_FORBIDDEN
                )

            staff_id = update_data.get("assigned_to_id")
            update_data.pop("assigned_to_id", None)

            if staff_id in [None, "", "null"]:
                ticket.assigned_to = None

            else:
                staff = User.objects.filter(
                    id=staff_id,
                    is_active=True,
                    profile__role="SUPPORT"
                ).first()

                if not staff:
                    return Response(
                        {
                            "error": (
                                "Please select an active support staff member."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                ticket.assigned_to = staff

        old_status = ticket.status

        serializer = TicketSerializer(
            ticket,
            data=update_data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            ticket = serializer.save()

            # Track when a ticket is resolved.
            if ticket.status == "RESOLVED" and old_status != "RESOLVED":
                ticket.resolved_at = timezone.now()
                ticket.save(update_fields=["resolved_at"])

            # Clear resolution date if ticket is reopened.
            elif ticket.status != "RESOLVED" and old_status == "RESOLVED":
                ticket.resolved_at = None
                ticket.save(update_fields=["resolved_at"])

            return Response(
                TicketSerializer(
                    ticket,
                    context={"request": request}
                ).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if ticket is None:
            return Response(
                {"error": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only employees can delete their own tickets.
        if request.user.profile.role != "EMPLOYEE":
            return Response(
                {"error": "Only employees can delete their own tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.employee_id != request.user.id:
            return Response(
                {"error": "You can delete only your own tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        ticket_id = ticket.id
        ticket.delete()

        return Response(
            {
                "message": f"Ticket #{ticket_id} deleted successfully."
            },
            status=status.HTTP_200_OK
        )


class TicketMessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        ticket = TicketDetailView().get_ticket(request, pk)

        if ticket is None:
            return Response(
                {"error": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        role = request.user.profile.role

        message_serializer = TicketMessageSerializer(
            data=request.data,
            context={"request": request}
        )

        if not message_serializer.is_valid():
            return Response(
                message_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        is_internal = message_serializer.validated_data.get(
            "is_internal",
            False
        )

        # Employees cannot create internal notes.
        if role == "EMPLOYEE" and is_internal:
            return Response(
                {"error": "Employees cannot create internal notes."},
                status=status.HTTP_403_FORBIDDEN
            )

        message = message_serializer.save(
            ticket=ticket,
            sender=request.user
        )

        return Response(
            TicketMessageSerializer(
                message,
                context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED
        )


class AdminCreateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def check_admin(self, request):
        try:
            return request.user.profile.role == "ADMIN"
        except UserProfile.DoesNotExist:
            return False

    def post(self, request):
        if not self.check_admin(request):
            return Response(
                {"error": "Only administrators can create users."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        role = request.data.get("role", "").strip().upper()
        department = request.data.get("department", "").strip()
        phone = request.data.get("phone", "").strip()

        if not username or not email or not password or not role:
            return Response(
                {
                    "error": (
                        "Username, email, password and role are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if role not in ["EMPLOYEE", "SUPPORT"]:
            return Response(
                {
                    "error": (
                        "Only EMPLOYEE and SUPPORT roles can be created."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(password)
        except ValidationError as error:
            return Response(
                {"error": list(error.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )

                profile = UserProfile.objects.create(
                    user=user,
                    role=role,
                    department=department,
                    phone=phone
                )

        except Exception:
            return Response(
                {
                    "error": (
                        "Unable to create account. Please try again."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "User created successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": profile.role,
                    "department": profile.department,
                    "phone": profile.phone,
                    "is_active": user.is_active
                }
            },
            status=status.HTTP_201_CREATED
        )

    def get(self, request):
        if not self.check_admin(request):
            return Response(
                {"error": "Only administrators can view users."},
                status=status.HTTP_403_FORBIDDEN
            )

        profiles = UserProfile.objects.select_related(
            "user"
        ).order_by("-id")

        users = [
            {
                "id": profile.user.id,
                "username": profile.user.username,
                "email": profile.user.email,
                "role": profile.role,
                "department": profile.department,
                "phone": profile.phone,
                "is_active": profile.user.is_active
            }
            for profile in profiles
        ]

        return Response(
            {
                "total_users": len(users),
                "employees": sum(
                    1 for user in users
                    if user["role"] == "EMPLOYEE"
                ),
                "support_staff": sum(
                    1 for user in users
                    if user["role"] == "SUPPORT"
                ),
                "users": users
            },
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        if not self.check_admin(request):
            return Response(
                {"error": "Only administrators can update accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get("user_id")
        is_active = request.data.get("is_active")

        if user_id is None or not isinstance(is_active, bool):
            return Response(
                {"error": "Valid user_id and is_active are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_user = User.objects.select_related(
                "profile"
            ).get(id=user_id)

        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if target_user.profile.role == "ADMIN":
            return Response(
                {
                    "error": (
                        "Administrator accounts cannot be deactivated here."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        target_user.is_active = is_active
        target_user.save(update_fields=["is_active"])

        return Response(
            {
                "message": (
                    "Account activated successfully."
                    if is_active
                    else "Account deactivated successfully."
                ),
                "user_id": target_user.id,
                "is_active": target_user.is_active
            },
            status=status.HTTP_200_OK
        )

    def delete(self, request):
        if not self.check_admin(request):
            return Response(
                {"error": "Only administrators can delete users."},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"error": "User ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_user = User.objects.select_related(
                "profile"
            ).get(id=user_id)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not hasattr(target_user, "profile"):
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Protect administrator and superuser accounts.
        if target_user.profile.role == "ADMIN" or target_user.is_superuser:
            return Response(
                {"error": "Administrator accounts cannot be deleted."},
                status=status.HTTP_403_FORBIDDEN
            )

        if target_user.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own account."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = target_user.username

        with transaction.atomic():
            target_user.delete()

        return Response(
            {
                "message": f"User '{username}' deleted successfully."
            },
            status=status.HTTP_200_OK
        )
