from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        RIDER = "RIDER", "Rider"
        MERCHANT = "MERCHANT", "Merchant"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)
    is_suspended = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
