from django.urls import path

from .views import (
    CustomerAddressDetailView,
    CustomerAddressListCreateView,
    CustomerOrderChatListView,
    CustomerOrderConfirmView,
    CustomerOrderCreateView,
    CustomerOrderListView,
    CustomerOrderQuoteView,
    CustomerOrderReorderView,
    CustomerOrderTrackingView,
    RiderAcceptOrderView,
    RiderAvailableOrdersView,
    RiderAvailabilityView,
    RiderEarningsListView,
    RiderLocationUpdateView,
    RiderOrderStatusUpdateView,
)

urlpatterns = [
    path("customer/addresses/", CustomerAddressListCreateView.as_view(), name="customer_addresses"),
    path(
        "customer/addresses/<int:pk>/",
        CustomerAddressDetailView.as_view(),
        name="customer_address_detail",
    ),
    path("customer/orders/quote/", CustomerOrderQuoteView.as_view(), name="customer_order_quote"),
    path("customer/orders/", CustomerOrderCreateView.as_view(), name="customer_order_create"),
    path("customer/orders/history/", CustomerOrderListView.as_view(), name="customer_order_history"),
    path(
        "customer/orders/<int:order_id>/confirm/",
        CustomerOrderConfirmView.as_view(),
        name="customer_order_confirm",
    ),
    path(
        "customer/orders/<int:order_id>/tracking/",
        CustomerOrderTrackingView.as_view(),
        name="customer_order_tracking",
    ),
    path(
        "customer/orders/<int:order_id>/reorder/",
        CustomerOrderReorderView.as_view(),
        name="customer_order_reorder",
    ),
    path(
        "customer/orders/<int:order_id>/chat/",
        CustomerOrderChatListView.as_view(),
        name="customer_order_chat",
    ),
    path("rider/availability/", RiderAvailabilityView.as_view(), name="rider_availability"),
    path("rider/orders/available/", RiderAvailableOrdersView.as_view(), name="rider_available_orders"),
    path("rider/orders/accept/", RiderAcceptOrderView.as_view(), name="rider_accept_order"),
    path(
        "rider/orders/<int:order_id>/status/",
        RiderOrderStatusUpdateView.as_view(),
        name="rider_order_status",
    ),
    path("rider/location/", RiderLocationUpdateView.as_view(), name="rider_location"),
    path("rider/earnings/", RiderEarningsListView.as_view(), name="rider_earnings"),
]
