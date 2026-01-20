from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, ChatMessage, Order, OrderItem, OrderTrackingEvent, Payment, PaymentTransaction
from .permissions import IsCustomer
from .serializers import (
    AddressSerializer,
    ChatMessageSerializer,
    OrderConfirmSerializer,
    OrderCreateSerializer,
    OrderQuoteRequestSerializer,
    OrderSerializer,
    OrderTrackingEventSerializer,
    prefetch_orders,
)


def get_customer_profile(user):
    if hasattr(user, "customerprofile"):
        return user.customerprofile
    raise ValueError("Customer profile not found.")


class CustomerAddressListCreateView(ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        customer = get_customer_profile(self.request.user)
        return Address.objects.filter(customer=customer).order_by("id")

    def perform_create(self, serializer):
        customer = get_customer_profile(self.request.user)
        serializer.save(customer=customer)


class CustomerAddressDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        customer = get_customer_profile(self.request.user)
        return Address.objects.filter(customer=customer)


class CustomerOrderQuoteView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]
    throttle_scope = "order_create"

    def post(self, request, *args, **kwargs):
        serializer = OrderQuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = get_customer_profile(request.user)
        quote = serializer.build_quote(customer)
        payload = {
            "merchant_branch_id": quote["branch"].id,
            "dropoff_address_id": quote["dropoff_address"].id,
            "items": [
                {
                    "inventory_item_id": item["inventory_item"].id,
                    "name": item["name"],
                    "quantity": item["quantity"],
                    "unit_price": str(item["unit_price"]),
                }
                for item in quote["items"]
            ],
            "subtotal": str(quote["subtotal"]),
            "delivery_fee": str(quote["delivery_fee"]),
            "total": str(quote["total"]),
        }
        return Response(payload, status=status.HTTP_200_OK)


class CustomerOrderCreateView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]
    throttle_scope = "order_create"

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = get_customer_profile(request.user)
        order = serializer.create_order(customer)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderConfirmView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    @transaction.atomic
    def post(self, request, order_id, *args, **kwargs):
        order = get_object_or_404(Order, id=order_id)
        customer = get_customer_profile(request.user)
        if order.customer_id != customer.id:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment = getattr(order, "payment", None)
        if not payment:
            return Response({"detail": "Payment record missing."}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = "CONFIRMED"
        payment.save(update_fields=["status"])
        PaymentTransaction.objects.create(
            payment=payment,
            provider_reference=serializer.validated_data.get("provider_reference", "CONFIRMED"),
            status="SUCCESS",
            raw_response={"status": "confirmed"},
        )

        order.status = Order.Status.CONFIRMED
        order.save(update_fields=["status"])
        OrderTrackingEvent.objects.create(order=order, status=Order.Status.CONFIRMED)

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class CustomerOrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        customer = get_customer_profile(self.request.user)
        return prefetch_orders(Order.objects.filter(customer=customer).order_by("-created_at"))


class CustomerOrderTrackingView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request, order_id, *args, **kwargs):
        customer = get_customer_profile(request.user)
        order = get_object_or_404(Order, id=order_id, customer=customer)
        events = OrderTrackingEvent.objects.filter(order=order).order_by("created_at")
        return Response(
            {
                "order": OrderSerializer(order).data,
                "events": OrderTrackingEventSerializer(events, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class CustomerOrderReorderView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]
    throttle_scope = "order_create"

    @transaction.atomic
    def post(self, request, order_id, *args, **kwargs):
        customer = get_customer_profile(request.user)
        original = get_object_or_404(
            prefetch_orders(Order.objects.select_related("merchant_branch")),
            id=order_id,
            customer=customer,
        )
        order = Order.objects.create(
            customer=customer,
            merchant_branch=original.merchant_branch,
            pickup_address_line1=original.pickup_address_line1,
            pickup_address_line2=original.pickup_address_line2,
            pickup_city=original.pickup_city,
            pickup_state=original.pickup_state,
            pickup_postal_code=original.pickup_postal_code,
            pickup_country=original.pickup_country,
            pickup_latitude=original.pickup_latitude,
            pickup_longitude=original.pickup_longitude,
            dropoff_address_line1=original.dropoff_address_line1,
            dropoff_address_line2=original.dropoff_address_line2,
            dropoff_city=original.dropoff_city,
            dropoff_state=original.dropoff_state,
            dropoff_postal_code=original.dropoff_postal_code,
            dropoff_country=original.dropoff_country,
            dropoff_latitude=original.dropoff_latitude,
            dropoff_longitude=original.dropoff_longitude,
            subtotal=original.subtotal,
            delivery_fee=original.delivery_fee,
            total=original.total,
        )

        OrderTrackingEvent.objects.create(order=order, status=Order.Status.CREATED)

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    inventory_item=item.inventory_item,
                    name=item.name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                )
                for item in original.items.all()
            ]
        )

        Payment.objects.create(
            order=order,
            provider=Payment.Provider.STRIPE,
            amount=order.total,
            status="PENDING",
        )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderChatListView(ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        customer = get_customer_profile(self.request.user)
        order_id = self.kwargs["order_id"]
        return ChatMessage.objects.filter(order_id=order_id, order__customer=customer).order_by(
            "created_at"
        )
