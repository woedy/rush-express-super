from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from core.views import HealthView, ReadyView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("accounts.urls")),
    path("api/", include("delivery.urls")),
    path("health/", HealthView.as_view(), name="health"),
    path("ready/", ReadyView.as_view(), name="ready"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
