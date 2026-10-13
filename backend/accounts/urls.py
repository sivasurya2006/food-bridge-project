from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    OrganizationVerificationListView, OrganizationVerifyActionView, DemoLoginView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/demo-login/', DemoLoginView.as_view(), name='auth-demo-login'),
    path('admin/organizations/', OrganizationVerificationListView.as_view(), name='admin-orgs'),
    path('admin/organizations/<int:pk>/verify/', OrganizationVerifyActionView.as_view(), name='admin-org-verify'),
]
