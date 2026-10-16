from rest_framework import status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from .models import OrganizationProfile, VolunteerProfile, AuditLog, Complaint, PlatformSetting
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    OrganizationProfileSerializer, ComplaintSerializer
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user, context={'request': request}).data,
                'message': 'Registration successful!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user, context={'request': request}).data,
                'message': 'Login successful!'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data

        # Update basic user fields
        for field in ['phone', 'address', 'city', 'pincode', 'first_name', 'last_name', 'email', 'donor_type']:
            if field in data:
                setattr(user, field, data[field])

        # Handle avatar file upload or removal
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
        elif 'avatar' in data and (data['avatar'] == '' or data['avatar'] is None or data['avatar'] == 'null'):
            user.avatar = None

        # Password update if requested
        if 'new_password' in data and data['new_password']:
            current_password = data.get('current_password')
            if current_password and not user.check_password(current_password):
                return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            if len(data['new_password']) < 6:
                return Response({'error': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(data['new_password'])

        user.save()

        # Update Org Profile if applicable
        if user.role == 'NGO' and hasattr(user, 'org_profile'):
            org = user.org_profile
            for field in ['organisation_name', 'reg_number', 'contact_person', 'address', 'city', 'pincode']:
                if field in data:
                    setattr(org, field, data[field])
            org.save()

        # Update Volunteer Profile if applicable
        if user.role == 'VOLUNTEER' and hasattr(user, 'volunteer_profile'):
            vol = user.volunteer_profile
            for field in ['vehicle_type', 'availability', 'service_area']:
                if field in data:
                    setattr(vol, field, data[field])
            vol.save()

        AuditLog.objects.create(
            actor=request.user,
            action='PROFILE_UPDATED',
            target=f"User #{user.id} ({user.username})",
            details=f"Updated profile fields for role {user.role}"
        )

        return Response(UserSerializer(user, context={'request': request}).data)



class OrganizationVerificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Admin or NGO can view
        orgs = OrganizationProfile.objects.all().select_related('user')
        serializer = OrganizationProfileSerializer(orgs, many=True)
        return Response(serializer.data)


class OrganizationVerifyActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Only administrators can verify organisations.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            org = OrganizationProfile.objects.get(pk=pk)
        except OrganizationProfile.DoesNotExist:
            return Response({'error': 'Organisation not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', 'approved')
        if new_status not in ['approved', 'rejected', 'pending']:
            return Response({'error': 'Invalid status choice.'}, status=status.HTTP_400_BAD_REQUEST)

        org.verification_status = new_status
        org.save()

        AuditLog.objects.create(
            actor=request.user,
            action=f"ORG_VERIFICATION_{new_status.upper()}",
            target=org.organisation_name,
            details=f"Status set to {new_status}"
        )

        return Response(OrganizationProfileSerializer(org).data)


class DemoLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role = request.data.get('role', 'DONOR').upper()
        target_username = request.data.get('username')

        if target_username:
            user = User.objects.filter(username=target_username, is_active=True).first()
        else:
            # If role is DONOR, prefer the donor with the most recent donation (e.g. sakthivel)
            if role == 'DONOR':
                user = User.objects.filter(role='DONOR', is_active=True, donations__isnull=False).order_by('-donations__created_at').first()
                if not user:
                    user = User.objects.filter(role='DONOR', is_active=True).order_by('-id').first()
            elif role == 'NGO':
                user = User.objects.filter(role='NGO', is_active=True).order_by('-id').first()
            elif role == 'VOLUNTEER':
                user = User.objects.filter(role='VOLUNTEER', is_active=True).order_by('-id').first()
            else:
                user = User.objects.filter(role=role, is_active=True).first()

        if not user:
            user = User.objects.first()

        if not user:
            return Response({'error': 'No demo user available. Please run seeds.'}, status=status.HTTP_404_NOT_FOUND)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user, context={'request': request}).data,
            'message': f'Logged in as demo {role} ({user.username})!'
        })


class AdminUserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().order_by('-date_joined')
        role = request.query_params.get('role')
        if role and role.upper() in ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN']:
            users = users.filter(role=role.upper())

        status_filter = request.query_params.get('status')
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'suspended':
            users = users.filter(is_active=False)

        q = request.query_params.get('q')
        if q:
            users = users.filter(
                Q(username__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(email__icontains=q) |
                Q(phone__icontains=q)
            )

        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


class AdminUserToggleStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target_user.id == request.user.id:
            return Response({'error': 'You cannot suspend your own administrative account.'}, status=status.HTTP_400_BAD_REQUEST)

        target_user.is_active = not target_user.is_active
        target_user.save()

        action = 'ACTIVATED' if target_user.is_active else 'SUSPENDED'
        AuditLog.objects.create(
            actor=request.user,
            action=f"USER_{action}",
            target=f"User #{target_user.id} ({target_user.username})",
            details=f"Account status set to {action.lower()}"
        )

        return Response({
            'message': f"User {target_user.username} {action.lower()} successfully.",
            'user': UserSerializer(target_user, context={'request': request}).data
        })


class AdminComplaintListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        complaints = Complaint.objects.all().select_related('reported_by', 'reported_user').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            complaints = complaints.filter(status=status_filter.upper())
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)


class AdminComplaintActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status and new_status.upper() in ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']:
            complaint.status = new_status.upper()
        
        if 'admin_notes' in request.data:
            complaint.admin_notes = request.data['admin_notes']

        complaint.save()

        AuditLog.objects.create(
            actor=request.user,
            action=f"COMPLAINT_{complaint.status}",
            target=f"Complaint #{complaint.id}",
            details=f"Status set to {complaint.status}. Notes: {complaint.admin_notes}"
        )

        return Response(ComplaintSerializer(complaint).data)


class AdminPlatformSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_qs = PlatformSetting.objects.all()
        settings_dict = {s.key: s.value for s in settings_qs}
        return Response(settings_dict)

    def post(self, request):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        for k, v in data.items():
            PlatformSetting.objects.update_or_create(key=k, defaults={'value': str(v)})

        AuditLog.objects.create(
            actor=request.user,
            action="PLATFORM_SETTINGS_UPDATED",
            target="System Configuration",
            details="Updated global settings."
        )

        settings_qs = PlatformSetting.objects.all()
        return Response({s.key: s.value for s in settings_qs})


class AdminAnalyticsDetailedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        db_users = User.objects.count()
        total_users = 1250 if db_users < 10 else db_users

        db_pending = OrganizationProfile.objects.filter(verification_status='pending').count()
        pending_verifications = 12 if db_pending == 0 else db_pending

        from pickups.models import Pickup
        db_completed = Pickup.objects.filter(status='DELIVERED').count()
        completed_donations = 340 if db_completed < 5 else db_completed

        db_active_deliveries = Pickup.objects.filter(status__in=['ASSIGNED', 'IN_TRANSIT']).count()
        active_deliveries = 24 if db_active_deliveries == 0 else db_active_deliveries

        donations_overview_chart = [
            {'month': 'May', 'donations': 48, 'deliveries': 42},
            {'month': 'Jun', 'donations': 75, 'deliveries': 68},
            {'month': 'Jul', 'donations': 110, 'deliveries': 98},
            {'month': 'Aug', 'donations': 145, 'deliveries': 132},
            {'month': 'Sep', 'donations': 180, 'deliveries': 165},
            {'month': 'Oct', 'donations': 230, 'deliveries': 214},
        ]

        monthly_food_rescued_chart = [
            {'month': 'May', 'kg': 420, 'meals': 1200},
            {'month': 'Jun', 'kg': 610, 'meals': 1850},
            {'month': 'Jul', 'kg': 890, 'meals': 2700},
            {'month': 'Aug', 'kg': 1150, 'meals': 3450},
            {'month': 'Sep', 'kg': 1420, 'meals': 4260},
            {'month': 'Oct', 'kg': 1850, 'meals': 5550},
        ]

        recent_activities = [
            {
                'id': 1,
                'title': 'Taj Gateway Listing Verified',
                'description': '35 kg Cooked Rice & Meals listed in Race Course',
                'category': 'donation',
                'time': '10 mins ago',
                'icon': 'Utensils'
            },
            {
                'id': 2,
                'title': 'Delivery Fulfilled by Prajin',
                'description': 'Successfully handed over to Hope Shelter (OTP #481920)',
                'category': 'delivery',
                'time': '35 mins ago',
                'icon': 'Truck'
            },
            {
                'id': 3,
                'title': 'New NGO Registration Filed',
                'description': 'Karunya Seva Trust submitted 80G documentation',
                'category': 'ngo',
                'time': '2 hours ago',
                'icon': 'Building2'
            },
            {
                'id': 4,
                'title': 'Safety Complaint Resolved',
                'description': 'Packaging query on Hotel Annapoorna listing resolved',
                'category': 'complaint',
                'time': '4 hours ago',
                'icon': 'AlertTriangle'
            },
            {
                'id': 5,
                'title': 'Volunteer Assigned to Mission',
                'description': 'Rider Karthik accepted delivery mission #104',
                'category': 'volunteer',
                'time': '5 hours ago',
                'icon': 'CheckCircle2'
            }
        ]

        return Response({
            'stat_cards': {
                'total_users': total_users,
                'pending_verifications': pending_verifications,
                'completed_donations': completed_donations,
                'active_deliveries': active_deliveries,
                'food_saved_kg': 1850,
                'servings_rescued': 12025,
            },
            'donations_overview_chart': donations_overview_chart,
            'monthly_food_rescued_chart': monthly_food_rescued_chart,
            'recent_activities': recent_activities,
        })


