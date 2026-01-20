from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    message = "Customer access required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "CUSTOMER")


class IsRider(BasePermission):
    message = "Rider access required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "RIDER")


class IsMerchant(BasePermission):
    message = "Merchant access required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "MERCHANT")


class IsAdmin(BasePermission):
    message = "Admin access required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "ADMIN")
