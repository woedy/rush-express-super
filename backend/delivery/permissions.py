from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    message = "Customer access required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "CUSTOMER")

