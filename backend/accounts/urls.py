from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    OrganizationVerificationListView, OrganizationVerifyActionView, DemoLoginView,
    AdminUserListView, AdminUserToggleStatusView,
    AdminComplaintListView, AdminComplaintActionView,
    AdminPlatformSettingsView, AdminAnalyticsDetailedView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/demo-login/', DemoLoginView.as_view(), name='auth-demo-login'),
    path('admin/organizations/', OrganizationVerificationListView.as_view(), name='admin-orgs'),
    path('admin/organizations/<int:pk>/verify/', OrganizationVerifyActionView.as_view(), name='admin-org-verify'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/toggle-status/', AdminUserToggleStatusView.as_view(), name='admin-user-toggle'),
    path('admin/complaints/', AdminComplaintListView.as_view(), name='admin-complaints'),
    path('admin/complaints/<int:pk>/resolve/', AdminComplaintActionView.as_view(), name='admin-complaint-resolve'),
    path('admin/settings/', AdminPlatformSettingsView.as_view(), name='admin-settings'),
    path('admin/analytics/', AdminAnalyticsDetailedView.as_view(), name='admin-analytics-detailed'),
]

