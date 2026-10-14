from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Backward compatibility redirect for custom user model in admin
    path('admin/auth/user/', RedirectView.as_view(url='/admin/accounts/user/', permanent=False)),
    path('admin/auth/user/<path:rest>', RedirectView.as_view(url='/admin/accounts/user/%(rest)s', permanent=False)),
    
    path('admin/', admin.site.urls),
    # API v1 endpoints
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('donations.urls')),
    path('api/v1/', include('pickups.urls')),
    path('api/v1/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
