from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsEmployee, IsSupportStaff, IsAdmin, IsSupportOrAdmin
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, Ticket
from .serializers import TicketSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        department = request.data.get("department", "")

        # Required fields
        if not username or not email or not password:
            return Response(
                {
                    "error": "Username, email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check username
        if User.objects.filter(username=username).exists():
            return Response(
                {
                    "error": "Username already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check email
        if User.objects.filter(email=email).exists():
            return Response(
                {
                    "error": "Email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Public registration is always EMPLOYEE
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
            password=password,
        )

        if user is None:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={"role": "EMPLOYEE"},
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
                    "department": profile.department,
                },
            },
            status=status.HTTP_200_OK,
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
            tickets = Ticket.objects.filter(
                employee=user
            ).select_related("employee", "assigned_to")

        elif role in ["SUPPORT", "ADMIN"]:
            tickets = Ticket.objects.all().select_related(
                "employee", "assigned_to"
            )

        else:
            return Response(
                {"error": "Access denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

        serializer = TicketSerializer(data=request.data)

        if serializer.is_valid():
            ticket = serializer.save(employee=request.user)
            return Response(
                TicketSerializer(ticket).data,
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
                "employee", "assigned_to"
            ).get(pk=pk)
        except Ticket.DoesNotExist:
            return None

        user = request.user

        if not hasattr(user, "profile"):
            return None

        role = user.profile.role

        # Employees can access only their own tickets
        if role == "EMPLOYEE":
            if ticket.employee != user:
                return None

        # Only support staff and admins can access other tickets
        elif role not in ["SUPPORT", "ADMIN"]:
            return None

        return ticket

    def get(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if ticket is None:
            return Response(
                {"error": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            TicketSerializer(ticket).data,
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

        # Only support staff and admins can update tickets
        if role not in ["SUPPORT", "ADMIN"]:
            return Response(
                {"error": "Only support staff and admins can update tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TicketSerializer(
            ticket,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
