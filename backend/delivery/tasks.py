from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from .models import Notification, Order, OrderTrackingEvent


@shared_task
def send_order_tracking_event(order_id, event_id):
    try:
        event = OrderTrackingEvent.objects.get(id=event_id, order_id=order_id)
    except OrderTrackingEvent.DoesNotExist:
        return
    payload = {
        "id": event.id,
        "order_id": event.order_id,
        "status": event.status,
        "latitude": str(event.latitude) if event.latitude is not None else None,
        "longitude": str(event.longitude) if event.longitude is not None else None,
        "created_at": event.created_at.isoformat(),
    }
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"order_{order_id}_tracking",
        {"type": "tracking.message", "payload": payload},
    )


@shared_task
def send_order_status_notifications(order_id, status):
    try:
        order = Order.objects.select_related(
            "customer__user",
            "rider__user",
            "merchant_branch__merchant__user",
        ).get(id=order_id)
    except Order.DoesNotExist:
        return

    recipients = [order.customer.user]
    if order.rider:
        recipients.append(order.rider.user)
    if order.merchant_branch and order.merchant_branch.merchant:
        recipients.append(order.merchant_branch.merchant.user)

    channel_layer = get_channel_layer()
    for user in recipients:
        notification = Notification.objects.create(
            user=user,
            notification_type="ORDER_STATUS",
            payload={"order_id": order.id, "status": status},
        )
        payload = {
            "id": notification.id,
            "type": notification.notification_type,
            "payload": notification.payload,
            "created_at": notification.created_at.isoformat(),
        }
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}_notifications",
            {"type": "notification.message", "payload": payload},
        )
