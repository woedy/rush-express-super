from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from delivery.models import CustomerProfile, MerchantProfile, RiderProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "is_suspended")


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ("phone_number",)


class RiderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderProfile
        fields = ("kyc_status", "vehicle_type", "license_number")


class MerchantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantProfile
        fields = ("business_name", "support_email")


class MeSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "is_suspended", "profile")

    def get_role(self, obj):
        if obj.is_superuser or obj.is_staff:
            return User.Roles.ADMIN
        return obj.role

    def get_profile(self, obj):
        role = self.get_role(obj)
        if role == User.Roles.CUSTOMER and hasattr(obj, "customerprofile"):
            return CustomerProfileSerializer(obj.customerprofile).data
        if role == User.Roles.RIDER and hasattr(obj, "riderprofile"):
            return RiderProfileSerializer(obj.riderprofile).data
        if role == User.Roles.MERCHANT and hasattr(obj, "merchantprofile"):
            return MerchantProfileSerializer(obj.merchantprofile).data
        return None


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Roles.choices)

    phone_number = serializers.CharField(required=False, allow_blank=True)
    business_name = serializers.CharField(required=False, allow_blank=True)
    support_email = serializers.EmailField(required=False, allow_blank=True)
    vehicle_type = serializers.ChoiceField(choices=RiderProfile.VehicleType.choices, required=False)
    license_number = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already in use.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def validate(self, attrs):
        role = attrs.get("role")
        if role == User.Roles.MERCHANT and not attrs.get("business_name"):
            raise serializers.ValidationError({"business_name": "Business name is required for merchants."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data["role"]
        password = validated_data.pop("password")
        phone_number = validated_data.pop("phone_number", "")
        business_name = validated_data.pop("business_name", "")
        support_email = validated_data.pop("support_email", "")
        vehicle_type = validated_data.pop("vehicle_type", RiderProfile.VehicleType.BIKE)
        license_number = validated_data.pop("license_number", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=role,
        )

        if role == User.Roles.CUSTOMER:
            CustomerProfile.objects.create(user=user, phone_number=phone_number)
        elif role == User.Roles.RIDER:
            RiderProfile.objects.create(
                user=user,
                vehicle_type=vehicle_type,
                license_number=license_number,
            )
        elif role == User.Roles.MERCHANT:
            MerchantProfile.objects.create(
                user=user,
                business_name=business_name,
                support_email=support_email,
            )

        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        refresh = self.validated_data["refresh"]
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError as exc:
            raise serializers.ValidationError({"refresh": "Invalid token."}) from exc


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
