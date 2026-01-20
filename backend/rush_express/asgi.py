import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from core.channels import JwtAuthMiddleware
from delivery.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rush_express.settings")

http_application = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": http_application,
        "websocket": AllowedHostsOriginValidator(JwtAuthMiddleware(URLRouter(websocket_urlpatterns))),
    }
)
