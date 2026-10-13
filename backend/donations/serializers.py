from rest_framework import serializers
from .models import FoodDonation, DonationRequest

class FoodDonationSerializer(serializers.ModelSerializer):
    donor_username = serializers.ReadOnlyField(source='donor.username')
    donor_phone = serializers.ReadOnlyField(source='donor.phone')
    donor_name = serializers.SerializerMethodField()
    available_quantity = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = FoodDonation
        fields = [
            'id', 'donor', 'donor_username', 'donor_name', 'donor_phone',
            'title', 'description', 'category', 'quantity', 'reserved_quantity',
            'available_quantity', 'unit', 'estimated_servings', 'prepared_at',
            'pickup_deadline', 'pickup_location', 'city', 'pincode',
            'storage_instructions', 'allergen_information', 'image', 'image_url',
            'status', 'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'donor', 'reserved_quantity', 'created_at', 'updated_at']

    def get_donor_name(self, obj):
        if obj.donor.first_name:
            return f"{obj.donor.first_name} {obj.donor.last_name}".strip()
        return obj.donor.username


class DonationRequestSerializer(serializers.ModelSerializer):
    donation_title = serializers.ReadOnlyField(source='donation.title')
    donation_category = serializers.ReadOnlyField(source='donation.category')
    donation_unit = serializers.ReadOnlyField(source='donation.unit')
    donation_location = serializers.ReadOnlyField(source='donation.pickup_location')
    donor_username = serializers.ReadOnlyField(source='donation.donor.username')
    donor_phone = serializers.ReadOnlyField(source='donation.donor.phone')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')
    receiver_org_name = serializers.SerializerMethodField()
    receiver_phone = serializers.ReadOnlyField(source='receiver.phone')
    pickup_id = serializers.SerializerMethodField()
    pickup_status = serializers.SerializerMethodField()
    pickup_otp = serializers.SerializerMethodField()
    volunteer_name = serializers.SerializerMethodField()

    class Meta:
        model = DonationRequest
        fields = [
            'id', 'donation', 'donation_title', 'donation_category', 'donation_unit',
            'donation_location', 'donor_username', 'donor_phone',
            'receiver', 'receiver_username', 'receiver_org_name', 'receiver_phone',
            'requested_quantity', 'notes', 'status', 'created_at', 'updated_at',
            'reviewed_at', 'pickup_id', 'pickup_status', 'pickup_otp', 'volunteer_name'
        ]
        read_only_fields = ['id', 'donation', 'receiver', 'status', 'created_at', 'updated_at', 'reviewed_at']

    def get_receiver_org_name(self, obj):
        if hasattr(obj.receiver, 'org_profile'):
            return obj.receiver.org_profile.organisation_name
        return obj.receiver.username

    def get_pickup_id(self, obj):
        if hasattr(obj, 'pickup'):
            return obj.pickup.id
        return None

    def get_pickup_status(self, obj):
        if hasattr(obj, 'pickup'):
            return obj.pickup.status
        return None

    def get_pickup_otp(self, obj):
        # Only the Donor (or Admin) can view the OTP code to hand to the volunteer
        request = self.context.get('request')
        if hasattr(obj, 'pickup') and request and (request.user == obj.donation.donor or request.user.role == 'ADMIN'):
            return obj.pickup.otp_code
        return None

    def get_volunteer_name(self, obj):
        if hasattr(obj, 'pickup') and obj.pickup.volunteer:
            return obj.pickup.volunteer.username
        return None
