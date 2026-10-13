from django.contrib import admin
from .models import Pickup

@admin.register(Pickup)
class PickupAdmin(admin.ModelAdmin):
    list_display = ['id', 'donation_request', 'volunteer', 'status', 'otp_code', 'pickup_time', 'delivery_time']
    list_filter = ['status']
    search_fields = ['volunteer__username', 'donation_request__donation__title', 'otp_code']
