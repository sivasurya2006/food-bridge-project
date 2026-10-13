from django.db import transaction
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Pickup
from .serializers import PickupSerializer
from notifications.models import Notification
from accounts.models import AuditLog

class VolunteerAvailableTasksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # List tasks ready for volunteer pickup
        pickups = Pickup.objects.filter(status='AWAITING_VOLUNTEER').order_by('donation_request__donation__pickup_deadline')
        serializer = PickupSerializer(pickups, many=True, context={'request': request})
        return Response(serializer.data)


class VolunteerAcceptTaskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['VOLUNTEER', 'ADMIN']:
            return Response({'error': 'Only registered volunteers can accept pickup tasks.'}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            try:
                pickup = Pickup.objects.select_for_update().get(pk=pk)
            except Pickup.DoesNotExist:
                return Response({'error': 'Pickup task not found.'}, status=status.HTTP_404_NOT_FOUND)

            if pickup.status != 'AWAITING_VOLUNTEER':
                return Response({'error': 'This task has already been accepted or is no longer available.'}, status=status.HTTP_400_BAD_REQUEST)

            pickup.volunteer = request.user
            pickup.status = 'ASSIGNED'
            pickup.save()

            donor = pickup.donation_request.donation.donor
            receiver = pickup.donation_request.receiver

            # Notify donor
            Notification.objects.create(
                user=donor,
                title='Volunteer Assigned to Your Donation',
                message=f"Volunteer {request.user.username} has accepted pickup for '{pickup.donation_request.donation.title}'. Share OTP {pickup.otp_code} when they arrive.",
                notification_type='info'
            )

            # Notify receiver NGO
            Notification.objects.create(
                user=receiver,
                title='Volunteer Assigned for Delivery',
                message=f"Volunteer {request.user.username} is handling delivery of '{pickup.donation_request.donation.title}'.",
                notification_type='info'
            )

            AuditLog.objects.create(
                actor=request.user,
                action='VOLUNTEER_TASK_ACCEPTED',
                target=f"Pickup #{pickup.id}",
                details=f"Volunteer {request.user.username} assigned"
            )

        return Response({
            'message': 'Task accepted successfully! Please coordinate pickup with the donor.',
            'pickup': PickupSerializer(pickup, context={'request': request}).data
        })


class VolunteerMyTasksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pickups = Pickup.objects.filter(volunteer=request.user).order_by('-updated_at')
        serializer = PickupSerializer(pickups, many=True, context={'request': request})
        return Response(serializer.data)


class VolunteerVerifyPickupOtpView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            pickup = Pickup.objects.get(pk=pk)
        except Pickup.DoesNotExist:
            return Response({'error': 'Pickup task not found.'}, status=status.HTTP_404_NOT_FOUND)

        if pickup.volunteer != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Only the assigned volunteer can verify pickup.'}, status=status.HTTP_403_FORBIDDEN)

        otp_attempt = request.data.get('otp_code', '').strip()
        if not otp_attempt:
            return Response({'error': 'Please provide the 6-digit OTP given by the donor.'}, status=status.HTTP_400_BAD_REQUEST)

        success, msg = pickup.verify_otp(otp_attempt)
        if not success:
            return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)

        # Notify NGO that food is now in transit
        Notification.objects.create(
            user=pickup.donation_request.receiver,
            title='Food is On the Way!',
            message=f"Volunteer {pickup.volunteer.username} has collected '{pickup.donation_request.donation.title}' and is in transit to your location.",
            notification_type='info'
        )

        AuditLog.objects.create(
            actor=request.user,
            action='PICKUP_VERIFIED_OTP',
            target=f"Pickup #{pickup.id}",
            details="Food collected, status changed to IN_TRANSIT"
        )

        return Response({
            'message': msg,
            'pickup': PickupSerializer(pickup, context={'request': request}).data
        })


class NGOActiveDeliveriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pickups = Pickup.objects.filter(
            donation_request__receiver=request.user,
            status__in=['ASSIGNED', 'IN_TRANSIT']
        ).order_by('-updated_at')
        serializer = PickupSerializer(pickups, many=True, context={'request': request})
        return Response(serializer.data)


class NGOConfirmReceiptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            pickup = Pickup.objects.get(pk=pk)
        except Pickup.DoesNotExist:
            return Response({'error': 'Pickup task not found.'}, status=status.HTTP_404_NOT_FOUND)

        # STRICT ROLE CHECK: Only the receiving NGO or Admin can confirm delivery
        if pickup.donation_request.receiver != request.user and request.user.role != 'ADMIN':
            return Response({
                'error': 'Permission denied. Only the recipient organisation can confirm receipt of food delivery.'
            }, status=status.HTTP_403_FORBIDDEN)

        if pickup.status != 'IN_TRANSIT' and pickup.status != 'ASSIGNED':
            return Response({'error': f'Cannot confirm receipt for pickup with status {pickup.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            pickup.status = 'DELIVERED'
            pickup.delivery_time = timezone.now()
            pickup.save()

            req = pickup.donation_request
            req.status = 'COMPLETED'
            req.save()

            # Update volunteer stats if assigned
            if pickup.volunteer and hasattr(pickup.volunteer, 'volunteer_profile'):
                vol_prof = pickup.volunteer.volunteer_profile
                vol_prof.deliveries_completed += 1
                vol_prof.save()

            # Check if total donation is fully fulfilled
            donation = req.donation
            if donation.reserved_quantity >= donation.quantity:
                donation.status = 'COMPLETED'
                donation.save()

            # Notifications
            donor = donation.donor
            Notification.objects.create(
                user=donor,
                title='Donation Completed Successfully!',
                message=f"The NGO confirmed receipt of {req.requested_quantity} {donation.unit} of '{donation.title}'. Thank you for reducing food waste!",
                notification_type='success'
            )

            if pickup.volunteer:
                Notification.objects.create(
                    user=pickup.volunteer,
                    title='Delivery Confirmed!',
                    message=f"The NGO confirmed delivery of '{donation.title}'. Excellent work!",
                    notification_type='success'
                )

            AuditLog.objects.create(
                actor=request.user,
                action='DELIVERY_CONFIRMED_RECEIPT',
                target=f"Pickup #{pickup.id}",
                details=f"Receipt confirmed by NGO {request.user.username}"
            )

        return Response({
            'message': 'Receipt confirmed successfully! Donation workflow completed.',
            'pickup': PickupSerializer(pickup, context={'request': request}).data
        })
