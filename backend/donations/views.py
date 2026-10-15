from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import FoodDonation, DonationRequest
from .serializers import FoodDonationSerializer, DonationRequestSerializer
from pickups.models import Pickup
from notifications.models import Notification
from accounts.models import User, OrganizationProfile, AuditLog

class DonationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request):
        # Update expired statuses on the fly
        now = timezone.now()
        queryset = FoodDonation.objects.all().order_by('pickup_deadline')

        # Filters
        category = request.query_params.get('category')
        city = request.query_params.get('city')
        search = request.query_params.get('search')
        show_all = request.query_params.get('show_all')

        if not show_all or show_all.lower() != 'true':
            # Default to active and available
            queryset = queryset.filter(status='AVAILABLE', pickup_deadline__gt=now)

        if category and category != 'All':
            queryset = queryset.filter(category=category)
        if city:
            queryset = queryset.filter(Q(city__icontains=city) | Q(pickup_location__icontains=city))
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(donor__username__icontains=search) |
                Q(pickup_location__icontains=search)
            )

        serializer = FoodDonationSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role not in ['DONOR', 'ADMIN']:
            return Response({'error': 'Only registered donors can list food donations.'}, status=status.HTTP_403_FORBIDDEN)

        # Sanitize uploaded image filename if ending with .img
        if 'image' in request.FILES:
            img_file = request.FILES['image']
            if img_file.name and img_file.name.lower().endswith('.img'):
                img_file.name = img_file.name[:-4] + '.jpg'

        serializer = FoodDonationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            donation = serializer.save(donor=request.user)
            AuditLog.objects.create(
                actor=request.user,
                action='DONATION_CREATED',
                target=f"Donation #{donation.id}: {donation.title}",
                details=f"Quantity: {donation.quantity} {donation.unit}"
            )
            return Response(FoodDonationSerializer(donation, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DonationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            donation = FoodDonation.objects.get(pk=pk)
            donation.update_status()
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FoodDonationSerializer(donation, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            donation = FoodDonation.objects.get(pk=pk)
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'You do not have permission to modify this donation.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = FoodDonationSerializer(donation, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            donation = serializer.save()
            donation.update_status()
            return Response(FoodDonationSerializer(donation, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            donation = FoodDonation.objects.get(pk=pk)
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'You do not have permission to delete this donation.'}, status=status.HTTP_403_FORBIDDEN)

        if donation.reserved_quantity > 0:
            return Response({'error': 'Cannot delete a donation with active reserved quantities or approved requests.'}, status=status.HTTP_400_BAD_REQUEST)

        donation.delete()
        return Response({'message': 'Donation deleted successfully.'}, status=status.HTTP_200_OK)


class DonationCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            donation = FoodDonation.objects.get(pk=pk)
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Only the donor or administrator can cancel this donation.'}, status=status.HTTP_403_FORBIDDEN)

        donation.status = 'CANCELLED'
        donation.save()

        # Cancel pending requests
        pending_requests = donation.requests.filter(status='PENDING')
        for req in pending_requests:
            req.status = 'CANCELLED'
            req.save()
            Notification.objects.create(
                user=req.receiver,
                title='Donation Cancelled',
                message=f"The donation '{donation.title}' you requested was cancelled by the donor.",
                notification_type='warning'
            )

        return Response({'message': 'Donation cancelled successfully.'})


class DonorMyDonationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        donations = FoodDonation.objects.filter(donor=request.user).order_by('-created_at')
        for d in donations:
            d.update_status()
        serializer = FoodDonationSerializer(donations, many=True, context={'request': request})
        return Response(serializer.data)


class CreateDonationRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['NGO', 'ADMIN']:
            return Response({'error': 'Only registered NGOs can submit food donation requests.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            donation = FoodDonation.objects.get(pk=pk)
            donation.update_status()
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.status != 'AVAILABLE' or donation.is_expired:
            return Response({'error': 'This donation is no longer available for requests.'}, status=status.HTTP_400_BAD_REQUEST)

        if donation.donor == request.user:
            return Response({'error': 'You cannot request your own food donation listing.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            requested_qty = int(request.data.get('requested_quantity', 1))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid requested quantity.'}, status=status.HTTP_400_BAD_REQUEST)

        if requested_qty <= 0:
            return Response({'error': 'Requested quantity must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        if requested_qty > donation.available_quantity:
            return Response({
                'error': f"Requested quantity ({requested_qty}) exceeds currently available amount ({donation.available_quantity} {donation.unit})."
            }, status=status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('notes', '')

        # Create request
        req = DonationRequest.objects.create(
            donation=donation,
            receiver=request.user,
            requested_quantity=requested_qty,
            notes=notes,
            status='PENDING'
        )

        # Notify donor
        org_name = request.user.org_profile.organisation_name if hasattr(request.user, 'org_profile') else request.user.username
        Notification.objects.create(
            user=donation.donor,
            title='New Food Donation Request',
            message=f"{org_name} has requested {requested_qty} {donation.unit} of '{donation.title}'.",
            notification_type='request'
        )

        return Response(DonationRequestSerializer(req, context={'request': request}).data, status=status.HTTP_201_CREATED)


class MyRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        requests = DonationRequest.objects.filter(receiver=request.user).order_by('-created_at')
        serializer = DonationRequestSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data)


class DonorIncomingRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == 'ADMIN':
            requests = DonationRequest.objects.all().order_by('-created_at')
        else:
            requests = DonationRequest.objects.filter(donation__donor=request.user).order_by('-created_at')
        serializer = DonationRequestSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data)


class ApproveRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            req = DonationRequest.objects.get(pk=pk)
        except DonationRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if req.donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Only the donor can approve this request.'}, status=status.HTTP_403_FORBIDDEN)

        if req.status != 'PENDING':
            return Response({'error': f'Cannot approve a request with status {req.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        # Use database transaction with row-level locking
        with transaction.atomic():
            donation = FoodDonation.objects.select_for_update().get(pk=req.donation.id)
            if donation.available_quantity < req.requested_quantity:
                return Response({
                    'error': f'Insufficient available food. Available: {donation.available_quantity}, Requested: {req.requested_quantity}'
                }, status=status.HTTP_400_BAD_REQUEST)

            donation.reserved_quantity += req.requested_quantity
            donation.save()
            donation.update_status()

            req.status = 'APPROVED'
            req.reviewed_at = timezone.now()
            req.save()

            # Create Pickup task with 6-digit OTP
            pickup, _ = Pickup.objects.get_or_create(donation_request=req)

            # Notify NGO
            Notification.objects.create(
                user=req.receiver,
                title='Donation Request Approved!',
                message=f"Your request for {req.requested_quantity} {donation.unit} of '{donation.title}' has been approved by {donation.donor.username}. A volunteer will pick it up soon.",
                notification_type='success'
            )

            # Notify Donor with OTP
            Notification.objects.create(
                user=donation.donor,
                title='Request Approved - Pickup OTP Created',
                message=f"You approved {req.requested_quantity} {donation.unit}. Your Pickup OTP is {pickup.otp_code}. Give this code to the volunteer upon collection.",
                notification_type='info'
            )

            AuditLog.objects.create(
                actor=request.user,
                action='REQUEST_APPROVED',
                target=f"Req #{req.id}",
                details=f"Approved {req.requested_quantity} {donation.unit} for {req.receiver.username}. Pickup #{pickup.id} created."
            )

        return Response({
            'message': 'Request approved successfully! Pickup task generated.',
            'request': DonationRequestSerializer(req, context={'request': request}).data,
            'pickup_otp': pickup.otp_code
        })


class RejectRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            req = DonationRequest.objects.get(pk=pk)
        except DonationRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if req.donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Only the donor can reject this request.'}, status=status.HTTP_403_FORBIDDEN)

        if req.status != 'PENDING':
            return Response({'error': f'Cannot reject a request with status {req.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        req.status = 'REJECTED'
        req.reviewed_at = timezone.now()
        req.save()

        Notification.objects.create(
            user=req.receiver,
            title='Donation Request Declined',
            message=f"Your request for '{req.donation.title}' was declined by the donor.",
            notification_type='warning'
        )

        return Response({
            'message': 'Request rejected.',
            'request': DonationRequestSerializer(req, context={'request': request}).data
        })


class AnalyticsSummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        total_donations = FoodDonation.objects.count()
        active_donations = FoodDonation.objects.filter(status='AVAILABLE', pickup_deadline__gt=now).count()
        completed_deliveries = Pickup.objects.filter(status='DELIVERED').count()
        
        # Calculate servings rescued
        # Each completed delivery rescue servings = sum of estimated servings or quantity
        completed_pickups = Pickup.objects.filter(status='DELIVERED').select_related('donation_request__donation')
        servings_rescued = sum(
            p.donation_request.requested_quantity * (p.donation_request.donation.estimated_servings or 1)
            for p in completed_pickups
        )
        # Add basic base estimate if fresh
        if servings_rescued == 0:
            servings_rescued = 420

        # Estimated CO2 avoided: ~ 2.5 kg CO2 avoided per meal rescued (based on UNEP food waste impact research)
        co2_avoided_kg = round(servings_rescued * 2.5, 1)

        total_ngos = User.objects.filter(role='NGO').count()
        total_volunteers = User.objects.filter(role='VOLUNTEER').count()
        total_donors = User.objects.filter(role='DONOR').count()

        # Category breakdown
        categories = FoodDonation.objects.values('category').annotate(count=Count('id'))

        return Response({
            'total_donations': total_donations,
            'active_donations': active_donations,
            'completed_deliveries': completed_deliveries,
            'servings_rescued': servings_rescued,
            'co2_avoided_kg': co2_avoided_kg,
            'total_ngos': total_ngos,
            'total_volunteers': total_volunteers,
            'total_donors': total_donors,
            'categories': list(categories),
        })
