from django.urls import path
from .views import (
    VolunteerAvailableTasksView, VolunteerAcceptTaskView,
    VolunteerMyTasksView, VolunteerVerifyPickupOtpView,
    NGOActiveDeliveriesView, NGOConfirmReceiptView,
    DonorPickupsView
)

urlpatterns = [
    path('volunteer/tasks/', VolunteerAvailableTasksView.as_view(), name='volunteer-tasks'),
    path('volunteer/my-tasks/', VolunteerMyTasksView.as_view(), name='volunteer-my-tasks'),
    path('pickups/<int:pk>/accept/', VolunteerAcceptTaskView.as_view(), name='pickup-accept'),
    path('pickups/<int:pk>/verify-pickup/', VolunteerVerifyPickupOtpView.as_view(), name='pickup-verify-otp'),
    path('pickups/<int:pk>/confirm-receipt/', NGOConfirmReceiptView.as_view(), name='pickup-confirm-receipt'),
    path('ngo/active-deliveries/', NGOActiveDeliveriesView.as_view(), name='ngo-active-deliveries'),
    path('donor/pickups/', DonorPickupsView.as_view(), name='donor-pickups'),
]
