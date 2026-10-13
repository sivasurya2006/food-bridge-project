import random
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

def generate_otp():
    return str(random.randint(100000, 999999))

class Pickup(models.Model):
    STATUS_CHOICES = [
        ('AWAITING_VOLUNTEER', 'Awaiting Volunteer'),
        ('ASSIGNED', 'Volunteer Assigned'),
        ('IN_TRANSIT', 'In Transit / Picked Up'),
        ('DELIVERED', 'Delivered & Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    donation_request = models.OneToOneField('donations.DonationRequest', on_delete=models.CASCADE, related_name='pickup')
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_pickups')
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='AWAITING_VOLUNTEER')
    otp_code = models.CharField(max_length=10, default=generate_otp)
    otp_expires_at = models.DateTimeField(blank=True, null=True)
    otp_attempts = models.PositiveIntegerField(default=0)
    pickup_time = models.DateTimeField(blank=True, null=True)
    delivery_time = models.DateTimeField(blank=True, null=True)
    volunteer_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.otp_expires_at:
            self.otp_expires_at = timezone.now() + timedelta(days=2)
        super().save(*args, **kwargs)

    def verify_otp(self, code_attempt):
        if self.status != 'ASSIGNED':
            return False, "Pickup is not in an assigned state."
        if timezone.now() > self.otp_expires_at:
            return False, "OTP has expired."
        if self.otp_attempts >= 5:
            return False, "Maximum verification attempts exceeded."
        
        self.otp_attempts += 1
        if self.otp_code.strip() == str(code_attempt).strip():
            self.status = 'IN_TRANSIT'
            self.pickup_time = timezone.now()
            self.save()
            return True, "OTP verified successfully. Food collected and in transit!"
        else:
            self.save()
            return False, f"Invalid OTP. {5 - self.otp_attempts} attempts remaining."

    def __str__(self):
        return f"Pickup #{self.id} for Req #{self.donation_request.id} [{self.status}]"
