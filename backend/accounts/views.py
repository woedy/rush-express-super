from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    LogoutSerializer,
    MeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    RegisterSerializer,
    VerifyEmailSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate verification token
        token = signing.dumps({"user_id": user.id}, salt="email-verification")
        
        # In a real app, send email here. For now, we return it in the response for dev/testing.
        verification_url = f"{settings.ALLOWED_HOSTS[0]}/verify-email?token={token}"
        
        refresh = RefreshToken.for_user(user)
        payload = {
            "user": MeSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "verification_token": token, # For testing purposes
        }
        return Response(payload, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(MeSerializer(request.user).data, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        try:
            data = signing.loads(token, salt="email-verification", max_age=3600*24)
            user = User.objects.get(id=data["user_id"])
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        except (signing.SignatureExpired, signing.BadSignature, User.DoesNotExist):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
            token = signing.dumps({"user_id": user.id}, salt="password-reset")
            # In a real app, send email here.
            return Response({"message": "Password reset link sent.", "token": token}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Don't reveal if user exists
            return Response({"message": "Password reset link sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        try:
            data = signing.loads(token, salt="password-reset", max_age=3600)
            user = User.objects.get(id=data["user_id"])
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        except (signing.SignatureExpired, signing.BadSignature, User.DoesNotExist):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
