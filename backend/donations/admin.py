from django.contrib import admin
from .models import FoodDonation, DonationRequest

@admin.register(FoodDonation)
class FoodDonationAdmin(admin.ModelAdmin):
    list_display = ['title', 'donor', 'category', 'available_quantity', 'quantity', 'unit', 'status', 'pickup_deadline']
    list_filter = ['category', 'status', 'city']
    search_fields = ['title', 'donor__username', 'description', 'pickup_location']

@admin.register(DonationRequest)
class DonationRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'donation', 'receiver', 'requested_quantity', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['donation__title', 'receiver__username']
