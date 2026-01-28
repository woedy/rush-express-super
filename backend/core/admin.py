from django.contrib import admin
from .models import AuditLog, DeliverySetting

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity", "actor", "created_at")
    list_filter = ("action", "entity", "created_at")
    search_fields = ("action", "entity", "metadata")
    readonly_fields = ("created_at",)

@admin.register(DeliverySetting)
class DeliverySettingAdmin(admin.ModelAdmin):
    list_display = ("key", "value", "updated_at")
    search_fields = ("key", "value")
    readonly_fields = ("updated_at",)
