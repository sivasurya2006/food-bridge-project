from django.db import models
from django.conf import settings
from django.utils import timezone

class FoodDonation(models.Model):
    CATEGORY_CHOICES = [
        ('Cooked Meals', 'Cooked Meals'),
        ('Raw Groceries', 'Raw Groceries'),
        ('Bakery & Bread', 'Bakery & Bread'),
        ('Fresh Produce', 'Fresh Produce'),
        ('Dairy & Eggs', 'Dairy & Eggs'),
        ('Packaged Foods', 'Packaged Foods'),
        ('Beverages', 'Beverages'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('RESERVED', 'Reserved'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]

    FOOD_TYPE_CHOICES = [
        ('Morning / Breakfast', 'Morning / Breakfast'),
        ('Lunch', 'Lunch'),
        ('Evening / Snacks', 'Evening / Snacks'),
        ('Night / Dinner', 'Night / Dinner'),
    ]

    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=100, default='General Food')
    food_type = models.CharField(max_length=50, choices=FOOD_TYPE_CHOICES, default='Lunch', blank=True)
    quantity = models.PositiveIntegerField()
    reserved_quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=30, default='servings')
    estimated_servings = models.PositiveIntegerField(default=1)
    prepared_at = models.DateTimeField(blank=True, null=True)
    pickup_deadline = models.DateTimeField()
    pickup_location = models.TextField()
    city = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=20, blank=True, default='')
    storage_instructions = models.TextField(blank=True, default='')
    allergen_information = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='donations/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_quantity(self):
        avail = self.quantity - self.reserved_quantity
        return max(0, avail)

    @property
    def is_expired(self):
        return timezone.now() > self.pickup_deadline

    def update_status(self):
        if self.status in ['CANCELLED', 'COMPLETED']:
            return
        if self.is_expired and self.status != 'EXPIRED':
            self.status = 'EXPIRED'
            self.save(update_fields=['status'])
        elif self.available_quantity == 0 and self.quantity > 0:
            if self.status != 'RESERVED':
                self.status = 'RESERVED'
                self.save(update_fields=['status'])
        elif self.available_quantity > 0 and self.status == 'RESERVED':
            self.status = 'AVAILABLE'
            self.save(update_fields=['status'])

    def __str__(self):
        return f"{self.title} ({self.available_quantity}/{self.quantity} {self.unit}) by {self.donor.username}"


class DonationRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    donation = models.ForeignKey(FoodDonation, on_delete=models.CASCADE, related_name='requests')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests')
    requested_quantity = models.PositiveIntegerField()
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Req #{self.id}: {self.requested_quantity} for {self.donation.title} by {self.receiver.username} [{self.status}]"
