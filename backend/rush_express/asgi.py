import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rush_express.settings")

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from core.channels import JwtAuthMiddleware

http_application = get_asgi_application()

# Import routing after Django setup to avoid AppRegistryNotReady during model import.
from delivery.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": http_application,
        "websocket": AllowedHostsOriginValidator(JwtAuthMiddleware(URLRouter(websocket_urlpatterns))),
    }
)
