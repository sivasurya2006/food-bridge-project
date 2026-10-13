from rest_framework import serializers
from .models import Pickup

class PickupSerializer(serializers.ModelSerializer):
    donation_request_id = serializers.ReadOnlyField(source='donation_request.id')
    donation_title = serializers.ReadOnlyField(source='donation_request.donation.title')
    donation_category = serializers.ReadOnlyField(source='donation_request.donation.category')
    quantity = serializers.ReadOnlyField(source='donation_request.requested_quantity')
    unit = serializers.ReadOnlyField(source='donation_request.donation.unit')
    pickup_deadline = serializers.ReadOnlyField(source='donation_request.donation.pickup_deadline')
    pickup_location = serializers.ReadOnlyField(source='donation_request.donation.pickup_location')
    donor_username = serializers.ReadOnlyField(source='donation_request.donation.donor.username')
    donor_phone = serializers.ReadOnlyField(source='donation_request.donation.donor.phone')
    receiver_username = serializers.ReadOnlyField(source='donation_request.receiver.username')
    receiver_org_name = serializers.SerializerMethodField()
    receiver_phone = serializers.ReadOnlyField(source='donation_request.receiver.phone')
    receiver_address = serializers.ReadOnlyField(source='donation_request.receiver.address')
    volunteer_username = serializers.ReadOnlyField(source='volunteer.username')
    display_otp = serializers.SerializerMethodField()

    class Meta:
        model = Pickup
        fields = [
            'id', 'donation_request_id', 'donation_title', 'donation_category',
            'quantity', 'unit', 'pickup_deadline', 'pickup_location',
            'donor_username', 'donor_phone', 'receiver_username',
            'receiver_org_name', 'receiver_phone', 'receiver_address',
            'volunteer', 'volunteer_username', 'status', 'display_otp',
            'pickup_time', 'delivery_time', 'volunteer_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def get_receiver_org_name(self, obj):
        if hasattr(obj.donation_request.receiver, 'org_profile'):
            return obj.donation_request.receiver.org_profile.organisation_name
        return obj.donation_request.receiver.username

    def get_display_otp(self, obj):
        # Reveal OTP to the donor (who owns the food and gives it to volunteer) or admin
        request = self.context.get('request')
        if request and (request.user == obj.donation_request.donation.donor or request.user.role == 'ADMIN'):
            return obj.otp_code
        return None
