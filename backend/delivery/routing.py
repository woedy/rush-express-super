from django.urls import path

from .consumers import NotificationsConsumer, OrderChatConsumer, OrderTrackingConsumer

websocket_urlpatterns = [
    path("ws/notifications/", NotificationsConsumer.as_asgi()),
    path("ws/orders/<int:order_id>/tracking/", OrderTrackingConsumer.as_asgi()),
    path("ws/orders/<int:order_id>/chat/", OrderChatConsumer.as_asgi()),
]
