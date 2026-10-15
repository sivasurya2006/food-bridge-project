from rest_framework import status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from .models import OrganizationProfile, VolunteerProfile, AuditLog
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, OrganizationProfileSerializer

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

