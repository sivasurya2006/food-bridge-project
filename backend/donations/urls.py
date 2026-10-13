from django.urls import path
from .views import (
    DonationListCreateView, DonationDetailView, DonationCancelView,
    DonorMyDonationsView, CreateDonationRequestView, MyRequestsView,
    DonorIncomingRequestsView, ApproveRequestView, RejectRequestView,
    AnalyticsSummaryView
)

urlpatterns = [
    path('donations/', DonationListCreateView.as_view(), name='donation-list-create'),
    path('donations/mine/', DonorMyDonationsView.as_view(), name='donor-donations-mine'),
    path('donations/<int:pk>/', DonationDetailView.as_view(), name='donation-detail'),
    path('donations/<int:pk>/cancel/', DonationCancelView.as_view(), name='donation-cancel'),
    path('donations/<int:pk>/requests/', CreateDonationRequestView.as_view(), name='donation-request-create'),
    
    path('requests/mine/', MyRequestsView.as_view(), name='my-requests'),
    path('donor/requests/', DonorIncomingRequestsView.as_view(), name='donor-incoming-requests'),
    path('requests/<int:pk>/approve/', ApproveRequestView.as_view(), name='request-approve'),
    path('requests/<int:pk>/reject/', RejectRequestView.as_view(), name='request-reject'),

    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
]
