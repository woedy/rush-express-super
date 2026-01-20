from decimal import Decimal

from django.db.models import Prefetch
from rest_framework import serializers

from .models import (
    Address,
    ChatMessage,
    InventoryItem,
    MerchantBranch,
    Order,
    OrderItem,
    OrderTrackingEvent,
    Payment,
    PaymentTransaction,
)
from .pricing import calculate_delivery_fee


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "label",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
            "latitude",
            "longitude",
        )


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "name", "quantity", "unit_price", "inventory_item")


class OrderTrackingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTrackingEvent
        fields = ("id", "status", "latitude", "longitude", "created_at")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "merchant_branch",
            "rider",
            "pickup_address_line1",
            "pickup_address_line2",
            "pickup_city",
            "pickup_state",
            "pickup_postal_code",
            "pickup_country",
            "pickup_latitude",
            "pickup_longitude",
            "dropoff_address_line1",
            "dropoff_address_line2",
            "dropoff_city",
            "dropoff_state",
            "dropoff_postal_code",
            "dropoff_country",
            "dropoff_latitude",
            "dropoff_longitude",
            "subtotal",
            "delivery_fee",
            "total",
            "created_at",
            "updated_at",
            "items",
        )


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ("id", "order", "sender", "recipient", "message", "created_at")


class OrderItemQuoteSerializer(serializers.Serializer):
    inventory_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate_inventory_item_id(self, value):
        if not InventoryItem.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid inventory item.")
        return value


class OrderQuoteRequestSerializer(serializers.Serializer):
    merchant_branch_id = serializers.IntegerField()
    dropoff_address_id = serializers.IntegerField()
    items = OrderItemQuoteSerializer(many=True)

    def validate(self, attrs):
        branch_id = attrs.get("merchant_branch_id")
        if not MerchantBranch.objects.filter(id=branch_id).exists():
            raise serializers.ValidationError({"merchant_branch_id": "Invalid branch."})
        return attrs

    def build_quote(self, customer_profile):
        branch = MerchantBranch.objects.get(id=self.validated_data["merchant_branch_id"])
        address = Address.objects.filter(
            id=self.validated_data["dropoff_address_id"], customer=customer_profile
        ).first()
        if not address:
            raise serializers.ValidationError({"dropoff_address_id": "Address not found."})

        item_requests = self.validated_data["items"]
        inventory_items = {
            item.id: item
            for item in InventoryItem.objects.filter(
                id__in=[item["inventory_item_id"] for item in item_requests],
                branch=branch,
                is_active=True,
            )
        }
        if len(inventory_items) != len(item_requests):
            raise serializers.ValidationError({"items": "Items must belong to the selected branch."})

        line_items = []
        subtotal = Decimal("0.00")
        for item in item_requests:
            inventory_item = inventory_items[item["inventory_item_id"]]
            quantity = item["quantity"]
            unit_price = inventory_item.price
            line_items.append(
                {
                    "inventory_item": inventory_item,
                    "name": inventory_item.name,
                    "quantity": quantity,
                    "unit_price": unit_price,
                }
            )
            subtotal += unit_price * quantity

        delivery_fee = calculate_delivery_fee(subtotal)
        total = subtotal + delivery_fee

        return {
            "branch": branch,
            "dropoff_address": address,
            "items": line_items,
            "subtotal": subtotal,
            "delivery_fee": delivery_fee,
            "total": total,
        }


class OrderCreateSerializer(OrderQuoteRequestSerializer):
    payment_provider = serializers.ChoiceField(choices=Payment.Provider.choices)

    def create_order(self, customer_profile):
        quote = self.build_quote(customer_profile)
        branch = quote["branch"]
        address = quote["dropoff_address"]

        order = Order.objects.create(
            customer=customer_profile,
            merchant_branch=branch,
            pickup_address_line1=branch.address_line1,
            pickup_address_line2=branch.address_line2,
            pickup_city=branch.city,
            pickup_state=branch.state,
            pickup_postal_code=branch.postal_code,
            pickup_country=branch.country,
            pickup_latitude=branch.latitude,
            pickup_longitude=branch.longitude,
            dropoff_address_line1=address.address_line1,
            dropoff_address_line2=address.address_line2,
            dropoff_city=address.city,
            dropoff_state=address.state,
            dropoff_postal_code=address.postal_code,
            dropoff_country=address.country,
            dropoff_latitude=address.latitude,
            dropoff_longitude=address.longitude,
            subtotal=quote["subtotal"],
            delivery_fee=quote["delivery_fee"],
            total=quote["total"],
        )

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    inventory_item=item["inventory_item"],
                    name=item["name"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                )
                for item in quote["items"]
            ]
        )

        payment = Payment.objects.create(
            order=order,
            provider=self.validated_data["payment_provider"],
            amount=quote["total"],
            status="PENDING",
        )

        PaymentTransaction.objects.create(
            payment=payment,
            provider_reference="INIT",
            status="PENDING",
            raw_response={"status": "initialized"},
        )

        OrderTrackingEvent.objects.create(order=order, status=Order.Status.CREATED)

        return order


class OrderConfirmSerializer(serializers.Serializer):
    provider_reference = serializers.CharField(required=False, allow_blank=True)


def prefetch_orders(queryset):
    return queryset.prefetch_related(
        Prefetch("items", queryset=OrderItem.objects.select_related("inventory_item"))
    )
