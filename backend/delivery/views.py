from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.exceptions import ValidationError

from core.models import DeliverySetting
from .models import (
    Address,
    ChatMessage,
    InventoryItem,
    Order,
    OrderItem,
    OrderTrackingEvent,
    Payment,
    PaymentTransaction,
    RiderAvailability,
    RiderEarnings,
    RiderLocation,
    RiderProfile,
)
from .permissions import IsAdmin, IsCustomer, IsMerchant, IsRider
from .serializers import (
    AddressSerializer,
    AdminDeliveryFeeSerializer,
    AdminOrderReassignSerializer,
    AdminRiderKycSerializer,
    AdminUserSerializer,
    AdminUserStatusSerializer,
    ChatMessageSerializer,
    InventoryItemSerializer,
    MerchantBranchSerializer,
    MerchantOrderStatusSerializer,
    OrderConfirmSerializer,
    OrderCreateSerializer,
    OrderQuoteRequestSerializer,
    OrderSerializer,
    OrderTrackingEventSerializer,
    RiderAcceptOrderSerializer,
    RiderAvailabilitySerializer,
    RiderEarningsSerializer,
    RiderLocationSerializer,
    RiderStatusUpdateSerializer,
    prefetch_orders,
)


def get_customer_profile(user):
    if hasattr(user, "customerprofile"):
        return user.customerprofile
    raise ValueError("Customer profile not found.")


def get_rider_profile(user):
    if hasattr(user, "riderprofile"):
        return user.riderprofile
    raise ValueError("Rider profile not found.")


def get_merchant_profile(user):
    if hasattr(user, "merchantprofile"):
        return user.merchantprofile
    raise ValueError("Merchant profile not found.")


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


class RiderAvailabilityView(APIView):
    permission_classes = [IsAuthenticated, IsRider]

    def get(self, request, *args, **kwargs):
        rider = get_rider_profile(request.user)
        availability, _ = RiderAvailability.objects.get_or_create(rider=rider)
        return Response(RiderAvailabilitySerializer(availability).data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        rider = get_rider_profile(request.user)
        availability, _ = RiderAvailability.objects.get_or_create(rider=rider)
        serializer = RiderAvailabilitySerializer(availability, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RiderAvailableOrdersView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsRider]

    def get_queryset(self):
        rider = get_rider_profile(self.request.user)
        availability = RiderAvailability.objects.filter(rider=rider).first()
        if not availability or not availability.is_online:
            return Order.objects.none()
        return prefetch_orders(
            Order.objects.filter(status=Order.Status.CONFIRMED, rider__isnull=True).order_by("-created_at")
        )


class RiderAcceptOrderView(APIView):
    permission_classes = [IsAuthenticated, IsRider]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = RiderAcceptOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rider = get_rider_profile(request.user)
        order = Order.objects.select_for_update().get(id=serializer.validated_data["order_id"])
        if order.status != Order.Status.CONFIRMED or order.rider_id is not None:
            return Response({"detail": "Order is no longer available."}, status=status.HTTP_409_CONFLICT)
        order.rider = rider
        order.status = Order.Status.ASSIGNED
        order.save(update_fields=["rider", "status"])
        OrderTrackingEvent.objects.create(order=order, status=Order.Status.ASSIGNED)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class RiderOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsRider]

    @transaction.atomic
    def post(self, request, order_id, *args, **kwargs):
        rider = get_rider_profile(request.user)
        order = get_object_or_404(Order.objects.select_for_update(), id=order_id, rider=rider)
        serializer = RiderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        next_status = serializer.validated_data["status"]
        order.status = next_status
        order.save(update_fields=["status"])
        OrderTrackingEvent.objects.create(order=order, status=next_status)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class RiderLocationUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsRider]

    def post(self, request, *args, **kwargs):
        rider = get_rider_profile(request.user)
        location, _ = RiderLocation.objects.get_or_create(rider=rider)
        serializer = RiderLocationSerializer(location, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RiderEarningsListView(ListAPIView):
    serializer_class = RiderEarningsSerializer
    permission_classes = [IsAuthenticated, IsRider]

    def get_queryset(self):
        rider = get_rider_profile(self.request.user)
        return RiderEarnings.objects.filter(rider=rider).order_by("-period_start")


class MerchantBranchListCreateView(ListCreateAPIView):
    serializer_class = MerchantBranchSerializer
    permission_classes = [IsAuthenticated, IsMerchant]

    def get_queryset(self):
        merchant = get_merchant_profile(self.request.user)
        return merchant.branches.order_by("id")

    def perform_create(self, serializer):
        merchant = get_merchant_profile(self.request.user)
        serializer.save(merchant=merchant)


class MerchantBranchDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = MerchantBranchSerializer
    permission_classes = [IsAuthenticated, IsMerchant]

    def get_queryset(self):
        merchant = get_merchant_profile(self.request.user)
        return merchant.branches.all()


class MerchantInventoryListCreateView(ListCreateAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated, IsMerchant]

    def get_queryset(self):
        merchant = get_merchant_profile(self.request.user)
        return InventoryItem.objects.filter(branch__merchant=merchant).order_by("id")

    def perform_create(self, serializer):
        merchant = get_merchant_profile(self.request.user)
        branch = serializer.validated_data.get("branch")
        if branch.merchant_id != merchant.id:
            raise ValidationError({"branch": "Branch does not belong to merchant."})
        serializer.save()


class MerchantInventoryDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated, IsMerchant]

    def get_queryset(self):
        merchant = get_merchant_profile(self.request.user)
        return InventoryItem.objects.filter(branch__merchant=merchant)


class MerchantOrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsMerchant]

    def get_queryset(self):
        merchant = get_merchant_profile(self.request.user)
        return prefetch_orders(
            Order.objects.filter(merchant_branch__merchant=merchant).order_by("-created_at")
        )


class MerchantOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsMerchant]

    @transaction.atomic
    def post(self, request, order_id, *args, **kwargs):
        merchant = get_merchant_profile(request.user)
        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            merchant_branch__merchant=merchant,
        )
        serializer = MerchantOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status"])
        OrderTrackingEvent.objects.create(order=order, status=order.status)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class MerchantAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsMerchant]

    def get(self, request, *args, **kwargs):
        merchant = get_merchant_profile(request.user)
        orders = Order.objects.filter(merchant_branch__merchant=merchant)
        summary = orders.aggregate(
            order_count=Count("id"),
            revenue=Sum("total"),
        )

        delivered_events = OrderTrackingEvent.objects.filter(
            order__merchant_branch__merchant=merchant,
            status=Order.Status.DELIVERED,
        ).select_related("order")

        durations = [
            event.created_at - event.order.created_at for event in delivered_events if event.order.created_at
        ]
        avg_delivery_time_minutes = None
        if durations:
            total_duration = sum(durations, timedelta())
            avg_delivery_time_minutes = total_duration.total_seconds() / 60 / len(durations)

        return Response(
            {
                "order_count": summary["order_count"] or 0,
                "revenue": str(summary["revenue"] or 0),
                "avg_delivery_time_minutes": avg_delivery_time_minutes,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserListView(ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = get_user_model().objects.order_by("id")
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class AdminUserStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id, *args, **kwargs):
        user = get_object_or_404(get_user_model(), id=user_id)
        serializer = AdminUserStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.is_suspended = serializer.validated_data["is_suspended"]
        user.save(update_fields=["is_suspended"])
        return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)


class AdminRiderKycUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, rider_id, *args, **kwargs):
        rider = get_object_or_404(RiderProfile, id=rider_id)
        serializer = AdminRiderKycSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rider.kyc_status = serializer.validated_data["kyc_status"]
        rider.save(update_fields=["kyc_status"])
        return Response({"id": rider.id, "kyc_status": rider.kyc_status}, status=status.HTTP_200_OK)


class AdminOrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return prefetch_orders(Order.objects.all().order_by("-created_at"))


class AdminOrderReassignView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @transaction.atomic
    def post(self, request, order_id, *args, **kwargs):
        serializer = AdminOrderReassignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = get_object_or_404(Order.objects.select_for_update(), id=order_id)
        rider = get_object_or_404(RiderProfile, id=serializer.validated_data["rider_id"])
        if order.status in (Order.Status.DELIVERED, Order.Status.CANCELED):
            return Response({"detail": "Order cannot be reassigned."}, status=status.HTTP_409_CONFLICT)
        order.rider = rider
        order.status = Order.Status.ASSIGNED
        order.save(update_fields=["rider", "status"])
        OrderTrackingEvent.objects.create(order=order, status=Order.Status.ASSIGNED)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class AdminDeliveryFeeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        setting = DeliverySetting.objects.filter(key=DeliverySetting.Keys.DELIVERY_FEE_FLAT).first()
        value = setting.value if setting else None
        return Response({"delivery_fee": value}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = AdminDeliveryFeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fee_value = serializer.validated_data["delivery_fee"]
        setting, _ = DeliverySetting.objects.get_or_create(
            key=DeliverySetting.Keys.DELIVERY_FEE_FLAT,
            defaults={"value": str(fee_value)},
        )
        setting.value = str(fee_value)
        setting.save(update_fields=["value"])
        return Response({"delivery_fee": str(fee_value)}, status=status.HTTP_200_OK)
