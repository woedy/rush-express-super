from __future__ import annotations

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import ChatMessage, Order


@database_sync_to_async
def get_order_for_user(order_id, user):
    if isinstance(user, AnonymousUser) or not user.is_authenticated:
        return None
    try:
        order = Order.objects.select_related(
            "customer__user",
            "rider__user",
            "merchant_branch__merchant__user",
        ).get(id=order_id)
    except Order.DoesNotExist:
        return None

    if user.role == "ADMIN":
        return order
    if user.role == "CUSTOMER" and order.customer.user_id == user.id:
        return order
    if user.role == "RIDER" and order.rider and order.rider.user_id == user.id:
        return order
    if user.role == "MERCHANT" and order.merchant_branch.merchant.user_id == user.id:
        return order
    return None


@database_sync_to_async
def create_chat_message(order, sender, message):
    recipient = None
    if sender.role == "CUSTOMER" and order.rider:
        recipient = order.rider.user
    elif sender.role == "RIDER":
        recipient = order.customer.user

    if not recipient:
        return None

    return ChatMessage.objects.create(
        order=order,
        sender=sender,
        recipient=recipient,
        message=message,
    )


class NotificationsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return
        self.group_name = f"user_{user.id}_notifications"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        await self.send_json(event["payload"])


class OrderTrackingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        order_id = self.scope["url_route"]["kwargs"]["order_id"]
        self.order = await get_order_for_user(order_id, self.scope.get("user"))
        if not self.order:
            await self.close(code=4003)
            return
        self.group_name = f"order_{self.order.id}_tracking"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def tracking_message(self, event):
        await self.send_json(event["payload"])


class OrderChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        order_id = self.scope["url_route"]["kwargs"]["order_id"]
        self.order = await get_order_for_user(order_id, self.scope.get("user"))
        if not self.order:
            await self.close(code=4003)
            return
        self.group_name = f"order_{self.order.id}_chat"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message = content.get("message")
        if not message:
            return
        chat_message = await create_chat_message(self.order, self.scope["user"], message)
        if not chat_message:
            return
        payload = {
            "id": chat_message.id,
            "order_id": chat_message.order_id,
            "sender_id": chat_message.sender_id,
            "recipient_id": chat_message.recipient_id,
            "message": chat_message.message,
            "created_at": chat_message.created_at.isoformat(),
        }
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.message", "payload": payload},
        )

    async def chat_message(self, event):
        await self.send_json(event["payload"])
