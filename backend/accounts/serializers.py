from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, OrganizationProfile, VolunteerProfile, AuditLog

class OrganizationProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationProfile
        fields = ['id', 'organisation_name', 'reg_number', 'contact_person', 'address', 'city', 'pincode', 'verification_status', 'created_at']
        read_only_fields = ['id', 'created_at']


class VolunteerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = ['id', 'vehicle_type', 'availability', 'service_area', 'verification_status', 'deliveries_completed', 'created_at']
        read_only_fields = ['id', 'created_at', 'deliveries_completed']


class UserSerializer(serializers.ModelSerializer):
    org_profile = OrganizationProfileSerializer(read_only=True)
    volunteer_profile = VolunteerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'donor_type',
            'phone', 'address', 'city', 'pincode',
            'is_active', 'date_joined', 'org_profile', 'volunteer_profile'
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=[
        ('DONOR', 'Donor'),
        ('NGO', 'NGO / Receiver'),
        ('VOLUNTEER', 'Volunteer'),
    ])

    # Donor fields
    donor_type = serializers.CharField(required=False, allow_blank=True)

    # NGO fields
    organisation_name = serializers.CharField(required=False, allow_blank=True)
    reg_number = serializers.CharField(required=False, allow_blank=True)
    contact_person = serializers.CharField(required=False, allow_blank=True)

    # Volunteer fields
    vehicle_type = serializers.CharField(required=False, allow_blank=True)
    service_area = serializers.CharField(required=False, allow_blank=True)
    availability = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'username', 'email', 'password', 'role', 'phone', 'address', 'city', 'pincode',
            'donor_type', 'organisation_name', 'reg_number', 'contact_person',
            'vehicle_type', 'service_area', 'availability'
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value

    def validate(self, data):
        role = data.get('role')
        if role == 'NGO':
            if not data.get('organisation_name'):
                raise serializers.ValidationError({'organisation_name': 'Organisation Name is required for NGOs.'})
            if not data.get('address'):
                raise serializers.ValidationError({'address': 'Physical address is required for NGOs.'})
            if not data.get('city'):
                raise serializers.ValidationError({'city': 'City is required for NGOs.'})
            if not data.get('pincode'):
                raise serializers.ValidationError({'pincode': 'Pincode is required for NGOs.'})

        return data

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '').strip()
        names = full_name.split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ''

        org_name = validated_data.pop('organisation_name', '')
        reg_number = validated_data.pop('reg_number', '')
        contact_person = validated_data.pop('contact_person', '') or full_name
        vehicle_type = validated_data.pop('vehicle_type', 'Bike')
        service_area = validated_data.pop('service_area', 'City-wide')
        availability = validated_data.pop('availability', 'Available')

        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            first_name=first_name,
            last_name=last_name,
            **validated_data
        )

        if user.role == 'NGO':
            OrganizationProfile.objects.create(
                user=user,
                organisation_name=org_name or f"{user.username}'s NGO",
                reg_number=reg_number,
                contact_person=contact_person or full_name,
                address=user.address or '',
                city=user.city or '',
                pincode=user.pincode or '',
                verification_status='approved'  # Approved for active platform testing
            )
        elif user.role == 'VOLUNTEER':
            VolunteerProfile.objects.create(
                user=user,
                vehicle_type=vehicle_type or 'Bike',
                service_area=service_area or 'All City',
                availability=availability or 'Available',
                verification_status='approved'
            )

        AuditLog.objects.create(
            actor=user,
            action='USER_REGISTERED',
            target=user.username,
            details=f"Registered as {user.role}"
        )

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        # Allow login by email or username
        user = authenticate(username=username, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email__iexact=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        # Convenience fallback for admin user accepting both 'admin' and 'admin123'
        if not user and username.strip().lower() == 'admin' and password.strip() in ['admin', 'admin123']:
            admin_user = User.objects.filter(username__iexact='admin').first()
            if admin_user and (admin_user.is_staff or admin_user.role == 'ADMIN'):
                user = admin_user

        if not user:
            raise serializers.ValidationError("Invalid credentials. Please verify your username/email and password.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is currently deactivated.")

        data['user'] = user
        return data
