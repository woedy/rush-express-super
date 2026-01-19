from django.conf import settings
from django.db import models


class CustomerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=32, blank=True)

    def __str__(self) -> str:
        return f"CustomerProfile({self.user_id})"


class RiderProfile(models.Model):
    class VehicleType(models.TextChoices):
        BIKE = "BIKE", "Bike"
        MOTORBIKE = "MOTORBIKE", "Motorbike"
        CAR = "CAR", "Car"
        VAN = "VAN", "Van"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    kyc_status = models.CharField(max_length=32, default="PENDING")
    vehicle_type = models.CharField(max_length=32, choices=VehicleType.choices, default=VehicleType.BIKE)
    license_number = models.CharField(max_length=64, blank=True)

    def __str__(self) -> str:
        return f"RiderProfile({self.user_id})"


class MerchantProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    support_email = models.EmailField(blank=True)

    def __str__(self) -> str:
        return f"MerchantProfile({self.business_name})"


class MerchantBranch(models.Model):
    merchant = models.ForeignKey(MerchantProfile, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=120, default="US")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["merchant"])]

    def __str__(self) -> str:
        return f"{self.name} ({self.merchant_id})"


class InventoryItem(models.Model):
    branch = models.ForeignKey(MerchantBranch, on_delete=models.CASCADE, related_name="inventory_items")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=["branch", "is_active"])]

    def __str__(self) -> str:
        return self.name


class Address(models.Model):
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=120, blank=True)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=120, default="US")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["customer"])]

    def __str__(self) -> str:
        return f"{self.label or self.address_line1}"


class Order(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        CONFIRMED = "CONFIRMED", "Confirmed"
        ASSIGNED = "ASSIGNED", "Assigned"
        PICKED_UP = "PICKED_UP", "Picked Up"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELED = "CANCELED", "Canceled"

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="orders")
    merchant_branch = models.ForeignKey(MerchantBranch, on_delete=models.CASCADE, related_name="orders")
    rider = models.ForeignKey(RiderProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)

    pickup_address_line1 = models.CharField(max_length=255)
    pickup_address_line2 = models.CharField(max_length=255, blank=True)
    pickup_city = models.CharField(max_length=120)
    pickup_state = models.CharField(max_length=120, blank=True)
    pickup_postal_code = models.CharField(max_length=40, blank=True)
    pickup_country = models.CharField(max_length=120, default="US")
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    dropoff_address_line1 = models.CharField(max_length=255)
    dropoff_address_line2 = models.CharField(max_length=255, blank=True)
    dropoff_city = models.CharField(max_length=120)
    dropoff_state = models.CharField(max_length=120, blank=True)
    dropoff_postal_code = models.CharField(max_length=40, blank=True)
    dropoff_country = models.CharField(max_length=120, default="US")
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["merchant_branch"]),
            models.Index(fields=["rider"]),
        ]

    def __str__(self) -> str:
        return f"Order({self.id})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        indexes = [models.Index(fields=["order"])]


class OrderTrackingEvent(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="tracking_events")
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["order", "created_at"]),
            models.Index(fields=["status"]),
        ]


class RiderAvailability(models.Model):
    rider = models.OneToOneField(RiderProfile, on_delete=models.CASCADE, related_name="availability")
    is_online = models.BooleanField(default=False)
    schedule = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class RiderLocation(models.Model):
    rider = models.OneToOneField(RiderProfile, on_delete=models.CASCADE, related_name="location")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["updated_at"])]


class RiderEarnings(models.Model):
    rider = models.ForeignKey(RiderProfile, on_delete=models.CASCADE, related_name="earnings")
    period_start = models.DateField()
    period_end = models.DateField()
    total_deliveries = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        indexes = [models.Index(fields=["rider", "period_start"])]


class Payment(models.Model):
    class Provider(models.TextChoices):
        STRIPE = "STRIPE", "Stripe"
        PAYPAL = "PAYPAL", "PayPal"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    provider = models.CharField(max_length=20, choices=Provider.choices)
    status = models.CharField(max_length=32, default="PENDING")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["provider", "status"])]


class PaymentTransaction(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="transactions")
    provider_reference = models.CharField(max_length=255)
    status = models.CharField(max_length=32)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["payment", "status"])]


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=64)
    payload = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "is_read"])]


class ChatMessage(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="chat_messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["order", "created_at"]),
            models.Index(fields=["sender"]),
        ]
