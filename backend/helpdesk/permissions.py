
from rest_framework.permissions import BasePermission


class IsEmployee(BasePermission):
    """Allow access only to employees."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "EMPLOYEE"
        )


class IsSupportStaff(BasePermission):
    """Allow access only to support staff."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "SUPPORT"
        )


class IsAdmin(BasePermission):
    """Allow access only to administrators."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "ADMIN"
        )


class IsSupportOrAdmin(BasePermission):
    """Allow access to support staff and administrators."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not hasattr(request.user, "profile"):
            return False

        return request.user.profile.role in ["SUPPORT", "ADMIN"]
