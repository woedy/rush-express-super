from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshView,
    RegisterView,
    VerifyEmailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("refresh/", RefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="token_logout"),
    path("me/", MeView.as_view(), name="auth_me"),
    path("verify-email/", VerifyEmailView.as_view(), name="auth_verify_email"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth_password_reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="auth_password_reset_confirm"),
]
