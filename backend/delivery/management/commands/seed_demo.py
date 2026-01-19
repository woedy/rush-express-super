from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from delivery.models import (
    CustomerProfile,
    InventoryItem,
    MerchantBranch,
    MerchantProfile,
    RiderAvailability,
    RiderProfile,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data for RushExpress"

    def handle(self, *args, **options):
        admin_user, _ = User.objects.get_or_create(
            username="demo_admin",
            defaults={"email": "admin@rushexpress.test", "role": User.Roles.ADMIN},
        )
        admin_user.set_password("adminpass")
        admin_user.save()

        merchant_user, _ = User.objects.get_or_create(
            username="demo_merchant",
            defaults={"email": "merchant@rushexpress.test", "role": User.Roles.MERCHANT},
        )
        merchant_user.set_password("merchantpass")
        merchant_user.save()
        merchant_profile, _ = MerchantProfile.objects.get_or_create(
            user=merchant_user,
            defaults={"business_name": "RushExpress Demo Store", "support_email": "support@rushexpress.test"},
        )

        branch, _ = MerchantBranch.objects.get_or_create(
            merchant=merchant_profile,
            name="Main Branch",
            defaults={
                "address_line1": "100 Market Street",
                "city": "San Francisco",
                "state": "CA",
                "postal_code": "94105",
                "country": "US",
            },
        )

        InventoryItem.objects.get_or_create(
            branch=branch,
            name="Demo Meal",
            defaults={"description": "Signature meal", "price": 12.50, "stock": 100},
        )
        InventoryItem.objects.get_or_create(
            branch=branch,
            name="Demo Drink",
            defaults={"description": "Refreshing beverage", "price": 3.25, "stock": 250},
        )

        rider_user, _ = User.objects.get_or_create(
            username="demo_rider",
            defaults={"email": "rider@rushexpress.test", "role": User.Roles.RIDER},
        )
        rider_user.set_password("riderpass")
        rider_user.save()
        rider_profile, _ = RiderProfile.objects.get_or_create(
            user=rider_user,
            defaults={"kyc_status": "VERIFIED", "vehicle_type": RiderProfile.VehicleType.BIKE},
        )
        RiderAvailability.objects.get_or_create(rider=rider_profile, defaults={"is_online": True})

        customer_user, _ = User.objects.get_or_create(
            username="demo_customer",
            defaults={"email": "customer@rushexpress.test", "role": User.Roles.CUSTOMER},
        )
        customer_user.set_password("customerpass")
        customer_user.save()
        CustomerProfile.objects.get_or_create(user=customer_user, defaults={"phone_number": "+15555555555"})

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
