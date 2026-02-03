from django.contrib import admin
from .models import (
    CustomerProfile, RiderProfile, MerchantProfile, MerchantBranch,
    InventoryItem, Address, Order, OrderItem, OrderTrackingEvent,
    RiderAvailability, RiderLocation, RiderEarnings, Payment,
    PaymentTransaction, Notification, ChatMessage
)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class PaymentTransactionInline(admin.TabularInline):
    model = PaymentTransaction
    extra = 0

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone_number")
    search_fields = ("user__username", "user__email", "phone_number")

@admin.register(RiderProfile)
class RiderProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "vehicle_type", "kyc_status", "license_number")
    list_filter = ("vehicle_type", "kyc_status")
    search_fields = ("user__username", "user__email", "license_number")

@admin.register(MerchantProfile)
class MerchantProfileAdmin(admin.ModelAdmin):
    list_display = ("business_name", "user", "support_email")
    search_fields = ("business_name", "user__username", "support_email")

@admin.register(MerchantBranch)
class MerchantBranchAdmin(admin.ModelAdmin):
    list_display = ("name", "merchant", "city", "country")
    list_filter = ("city", "country")
    search_fields = ("name", "merchant__business_name", "address_line1")

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("name", "branch", "price", "stock", "is_active")
    list_filter = ("is_active", "branch")
    search_fields = ("name", "description")

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("label", "customer", "city", "country")
    list_filter = ("city", "country")
    search_fields = ("label", "address_line1", "customer__user__username")

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "merchant_branch", "rider", "status", "total", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("id", "customer__user__username", "merchant_branch__name")
    inlines = [OrderItemInline]
    readonly_fields = ("created_at", "updated_at")

@admin.register(OrderTrackingEvent)
class OrderTrackingEventAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "created_at")
    list_filter = ("status", "created_at")
    readonly_fields = ("created_at",)

@admin.register(RiderAvailability)
class RiderAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("rider", "is_online", "updated_at")
    list_filter = ("is_online",)
    readonly_fields = ("updated_at",)

@admin.register(RiderLocation)
class RiderLocationAdmin(admin.ModelAdmin):
    list_display = ("rider", "latitude", "longitude", "updated_at")
    readonly_fields = ("updated_at",)

@admin.register(RiderEarnings)
class RiderEarningsAdmin(admin.ModelAdmin):
    list_display = ("rider", "period_start", "period_end", "total_earnings")
    list_filter = ("period_start", "period_end")

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "provider", "status", "amount", "created_at")
    list_filter = ("provider", "status", "created_at")
    inlines = [PaymentTransactionInline]
    readonly_fields = ("created_at",)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "notification_type", "is_read", "created_at")
    list_filter = ("notification_type", "is_read", "created_at")
    readonly_fields = ("created_at",)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("order", "sender", "recipient", "created_at")
    list_filter = ("created_at",)
    search_fields = ("message",)
    readonly_fields = ("created_at",)
