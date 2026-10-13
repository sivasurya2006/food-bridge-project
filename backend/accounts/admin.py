from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OrganizationProfile, VolunteerProfile, AuditLog

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'donor_type', 'phone', 'city', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('FoodBridge Role & Profile', {
            'fields': ('role', 'donor_type', 'phone', 'address', 'city', 'pincode')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('FoodBridge Role & Profile', {
            'fields': ('role', 'donor_type', 'phone', 'address', 'city', 'pincode')
        }),
    )

@admin.register(OrganizationProfile)
class OrganizationProfileAdmin(admin.ModelAdmin):
    list_display = ['organisation_name', 'user', 'reg_number', 'city', 'verification_status', 'created_at']
    list_filter = ['verification_status', 'city']
    search_fields = ['organisation_name', 'reg_number', 'user__username']

@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'vehicle_type', 'availability', 'service_area', 'deliveries_completed', 'verification_status']
    list_filter = ['verification_status', 'vehicle_type']
    search_fields = ['user__username', 'service_area']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'actor', 'action', 'target']
    list_filter = ['action']
    search_fields = ['action', 'target', 'details']
