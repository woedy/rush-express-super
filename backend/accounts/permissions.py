from rest_framework.permissions import BasePermission


class IsNotSuspended(BasePermission):
    message = "User account is suspended."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return not getattr(user, "is_suspended", False)


class RolePermission(BasePermission):
    required_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not self.required_roles:
            return True
        return getattr(user, "role", None) in self.required_roles
