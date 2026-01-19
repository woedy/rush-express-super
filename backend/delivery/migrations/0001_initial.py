from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomerProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("phone_number", models.CharField(blank=True, max_length=32)),
                (
                    "user",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="MerchantProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("business_name", models.CharField(max_length=255)),
                ("support_email", models.EmailField(blank=True, max_length=254)),
                (
                    "user",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RiderProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "kyc_status",
                    models.CharField(default="PENDING", max_length=32),
                ),
                (
                    "vehicle_type",
                    models.CharField(
                        choices=[
                            ("BIKE", "Bike"),
                            ("MOTORBIKE", "Motorbike"),
                            ("CAR", "Car"),
                            ("VAN", "Van"),
                        ],
                        default="BIKE",
                        max_length=32,
                    ),
                ),
                ("license_number", models.CharField(blank=True, max_length=64)),
                (
                    "user",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="MerchantBranch",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("address_line1", models.CharField(max_length=255)),
                ("address_line2", models.CharField(blank=True, max_length=255)),
                ("city", models.CharField(max_length=120)),
                ("state", models.CharField(blank=True, max_length=120)),
                ("postal_code", models.CharField(blank=True, max_length=40)),
                ("country", models.CharField(default="US", max_length=120)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                (
                    "merchant",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="branches", to="delivery.merchantprofile"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["merchant"], name="delivery_branch_merchant_idx")],
            },
        ),
        migrations.CreateModel(
            name="InventoryItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("stock", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "branch",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="inventory_items", to="delivery.merchantbranch"),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["branch", "is_active"], name="delivery_inventory_active_idx")
                ],
            },
        ),
        migrations.CreateModel(
            name="Address",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(blank=True, max_length=120)),
                ("address_line1", models.CharField(max_length=255)),
                ("address_line2", models.CharField(blank=True, max_length=255)),
                ("city", models.CharField(max_length=120)),
                ("state", models.CharField(blank=True, max_length=120)),
                ("postal_code", models.CharField(blank=True, max_length=40)),
                ("country", models.CharField(default="US", max_length=120)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                (
                    "customer",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="addresses", to="delivery.customerprofile"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["customer"], name="delivery_address_customer_idx")],
            },
        ),
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("CREATED", "Created"),
                            ("CONFIRMED", "Confirmed"),
                            ("ASSIGNED", "Assigned"),
                            ("PICKED_UP", "Picked Up"),
                            ("IN_TRANSIT", "In Transit"),
                            ("DELIVERED", "Delivered"),
                            ("CANCELED", "Canceled"),
                        ],
                        default="CREATED",
                        max_length=20,
                    ),
                ),
                ("pickup_address_line1", models.CharField(max_length=255)),
                ("pickup_address_line2", models.CharField(blank=True, max_length=255)),
                ("pickup_city", models.CharField(max_length=120)),
                ("pickup_state", models.CharField(blank=True, max_length=120)),
                ("pickup_postal_code", models.CharField(blank=True, max_length=40)),
                ("pickup_country", models.CharField(default="US", max_length=120)),
                ("pickup_latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("pickup_longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("dropoff_address_line1", models.CharField(max_length=255)),
                ("dropoff_address_line2", models.CharField(blank=True, max_length=255)),
                ("dropoff_city", models.CharField(max_length=120)),
                ("dropoff_state", models.CharField(blank=True, max_length=120)),
                ("dropoff_postal_code", models.CharField(blank=True, max_length=40)),
                ("dropoff_country", models.CharField(default="US", max_length=120)),
                ("dropoff_latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("dropoff_longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("subtotal", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("delivery_fee", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("total", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "customer",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="orders", to="delivery.customerprofile"),
                ),
                (
                    "merchant_branch",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="orders", to="delivery.merchantbranch"),
                ),
                (
                    "rider",
                    models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="orders", to="delivery.riderprofile"),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["status"], name="delivery_order_status_idx"),
                    models.Index(fields=["created_at"], name="delivery_order_created_idx"),
                    models.Index(fields=["merchant_branch"], name="delivery_order_branch_idx"),
                    models.Index(fields=["rider"], name="delivery_order_rider_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="OrderItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("quantity", models.PositiveIntegerField(default=1)),
                ("unit_price", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "inventory_item",
                    models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="delivery.inventoryitem"),
                ),
                (
                    "order",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="delivery.order"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["order"], name="delivery_orderitem_order_idx")],
            },
        ),
        migrations.CreateModel(
            name="OrderTrackingEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("CREATED", "Created"),
                            ("CONFIRMED", "Confirmed"),
                            ("ASSIGNED", "Assigned"),
                            ("PICKED_UP", "Picked Up"),
                            ("IN_TRANSIT", "In Transit"),
                            ("DELIVERED", "Delivered"),
                            ("CANCELED", "Canceled"),
                        ],
                        max_length=20,
                    ),
                ),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "order",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tracking_events", to="delivery.order"),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["order", "created_at"], name="delivery_tracking_order_idx"),
                    models.Index(fields=["status"], name="delivery_tracking_status_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="RiderAvailability",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_online", models.BooleanField(default=False)),
                ("schedule", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "rider",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="availability", to="delivery.riderprofile"),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RiderLocation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "rider",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="location", to="delivery.riderprofile"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["updated_at"], name="delivery_riderlocation_updated_idx")],
            },
        ),
        migrations.CreateModel(
            name="RiderEarnings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("period_start", models.DateField()),
                ("period_end", models.DateField()),
                ("total_deliveries", models.PositiveIntegerField(default=0)),
                ("total_earnings", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                (
                    "rider",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="earnings", to="delivery.riderprofile"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["rider", "period_start"], name="delivery_riderearnings_idx")],
            },
        ),
        migrations.CreateModel(
            name="Payment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "provider",
                    models.CharField(
                        choices=[("STRIPE", "Stripe"), ("PAYPAL", "PayPal")],
                        max_length=20,
                    ),
                ),
                ("status", models.CharField(default="PENDING", max_length=32)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "order",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="payment", to="delivery.order"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["provider", "status"], name="delivery_payment_provider_idx")],
            },
        ),
        migrations.CreateModel(
            name="PaymentTransaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("provider_reference", models.CharField(max_length=255)),
                ("status", models.CharField(max_length=32)),
                ("raw_response", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "payment",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="transactions", to="delivery.payment"),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["payment", "status"], name="delivery_payment_tx_idx")],
            },
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("notification_type", models.CharField(max_length=64)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["user", "is_read"], name="delivery_notification_idx")],
            },
        ),
        migrations.CreateModel(
            name="ChatMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "order",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chat_messages", to="delivery.order"),
                ),
                (
                    "recipient",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="received_messages", to=settings.AUTH_USER_MODEL),
                ),
                (
                    "sender",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sent_messages", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["order", "created_at"], name="delivery_chat_order_idx"),
                    models.Index(fields=["sender"], name="delivery_chat_sender_idx"),
                ],
            },
        ),
    ]
