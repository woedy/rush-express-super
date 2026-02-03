import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/State";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { connectNotifications, connectOrderChat, connectOrderTracking } from "@/lib/ws";
import type { Address, ChatMessage, Order, OrderQuote, OrderTrackingEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Package,
  Send,
} from "lucide-react";

const paymentProviders = ["STRIPE", "PAYPAL"] as const;
const addressSuggestions = [
  "123 Market Street",
  "456 Downtown Plaza",
  "789 Sunset Avenue",
  "101 Riverfront Road",
];

type ItemDraft = { inventory_item_id: string; quantity: string };

const CustomerDashboard = () => {
  const tokens = useAuthStore((state) => state.tokens);
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "orders";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<OrderTrackingEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [addressForm, setAddressForm] = useState({
    label: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [orderForm, setOrderForm] = useState({
    merchant_branch_id: "",
    dropoff_address_id: "",
    payment_provider: paymentProviders[0],
  });
  const [items, setItems] = useState<ItemDraft[]>([{ inventory_item_id: "", quantity: "1" }]);
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const chatSocketRef = useRef<WebSocket | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const data = await apiClient.listAddresses();
        setAddresses(data);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const data = await apiClient.listOrders();
        setOrders(data);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadAddresses();
    loadOrders();
  }, []);

  useEffect(() => {
    if (!tokens?.access) return;
    const socket = connectNotifications(tokens.access, () => {
      // notifications are already surfaced by toast on API errors
    });
    return () => socket.close();
  }, [tokens?.access]);

  useEffect(() => {
    if (!selectedOrderId) return;
    const loadTracking = async () => {
      const response = await apiClient.getTracking(selectedOrderId);
      setTrackingEvents(response.events);
    };
    const loadChat = async () => {
      const data = await apiClient.getChat(selectedOrderId);
      setChatMessages(data);
    };
    loadTracking();
    loadChat();
  }, [selectedOrderId]);

  useEffect(() => {
    if (!tokens?.access || !selectedOrderId) return;
    const trackingSocket = connectOrderTracking(tokens.access, selectedOrderId, (event) => {
      setTrackingEvents((prev) => [...prev, event]);
    });
    return () => trackingSocket.close();
  }, [tokens?.access, selectedOrderId]);

  useEffect(() => {
    if (!tokens?.access || !selectedOrderId) return;
    const chatSocket = connectOrderChat(tokens.access, selectedOrderId, (message) => {
      setChatMessages((prev) => [...prev, message as ChatMessage]);
    });
    chatSocketRef.current = chatSocket;
    return () => {
      chatSocket.close();
      chatSocketRef.current = null;
    };
  }, [tokens?.access, selectedOrderId]);

  const handleAddAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    const address = await apiClient.createAddress(addressForm);
    setAddresses((prev) => [...prev, address]);
    setAddressForm({
      label: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    });
  };

  const handleQuote = async () => {
    const payload = {
      merchant_branch_id: Number(orderForm.merchant_branch_id),
      dropoff_address_id: Number(orderForm.dropoff_address_id),
      items: items.map((item) => ({
        inventory_item_id: Number(item.inventory_item_id),
        quantity: Number(item.quantity),
      })),
    };
    const data = await apiClient.quoteOrder(payload);
    setQuote(data);
  };

  const handleCreateOrder = async () => {
    if (!quote) return;
    setIsSubmittingOrder(true);
    try {
      const order = await apiClient.createOrder({
        merchant_branch_id: quote.merchant_branch_id,
        dropoff_address_id: quote.dropoff_address_id,
        items: quote.items.map((item) => ({
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity,
        })),
        payment_provider: orderForm.payment_provider,
      });
      const confirmed = await apiClient.confirmOrder(order.id, "TEST_CONFIRM");
      setOrders((prev) => [confirmed, ...prev]);
      setSelectedOrderId(confirmed.id);
      setQuote(null);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleReorder = async (orderId: number) => {
    const newOrder = await apiClient.reorder(orderId);
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleSendChat = (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim() || !selectedOrderId) return;
    if (chatSocketRef.current && chatSocketRef.current.readyState === WebSocket.OPEN) {
      chatSocketRef.current.send(JSON.stringify({ message: chatInput }));
      setChatInput("");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Order history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingOrders ? (
                <LoadingState title="Loading orders" description="Pulling your order history." />
              ) : orders.length === 0 ? (
                <EmptyState title="No orders yet" description="Place your first delivery order." />
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className={cn(
                      "rounded-lg border border-border/60 p-4 transition",
                      selectedOrderId === order.id && "border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.dropoff_address_line1}</p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        View details
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleReorder(order.id)}>
                        Reorder
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      case "new":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Create a new order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="merchant-branch-id">Merchant branch ID</Label>
                  <Input
                    id="merchant-branch-id"
                    value={orderForm.merchant_branch_id}
                    onChange={(event) =>
                      setOrderForm((prev) => ({ ...prev, merchant_branch_id: event.target.value }))
                    }
                    placeholder="e.g. 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoff-address-id">Dropoff address ID</Label>
                  <Input
                    id="dropoff-address-id"
                    value={orderForm.dropoff_address_id}
                    onChange={(event) =>
                      setOrderForm((prev) => ({ ...prev, dropoff_address_id: event.target.value }))
                    }
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-provider">Payment provider</Label>
                  <select
                    id="payment-provider"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={orderForm.payment_provider}
                    onChange={(event) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        payment_provider: event.target.value,
                      }))
                    }
                  >
                    {paymentProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Order items</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setItems((prev) => [...prev, { inventory_item_id: "", quantity: "1" }])
                    }
                  >
                    Add item
                  </Button>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`inventory-item-${index}`}>Inventory item ID</Label>
                      <Input
                        id={`inventory-item-${index}`}
                        value={item.inventory_item_id}
                        onChange={(event) =>
                          setItems((prev) =>
                            prev.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, inventory_item_id: event.target.value }
                                : entry
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`inventory-qty-${index}`}>Quantity</Label>
                      <Input
                        id={`inventory-qty-${index}`}
                        value={item.quantity}
                        onChange={(event) =>
                          setItems((prev) =>
                            prev.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, quantity: event.target.value } : entry
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleQuote}>
                  Get quote
                </Button>
                <Button onClick={handleCreateOrder} disabled={!quote || isSubmittingOrder}>
                  {isSubmittingOrder ? "Submitting..." : "Confirm & Pay"}
                </Button>
              </div>

              {quote ? (
                <div className="rounded-lg border border-border/60 p-4 text-sm">
                  <p className="font-semibold">Quote</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    <div>Subtotal: ${quote.subtotal}</div>
                    <div>Delivery fee: ${quote.delivery_fee}</div>
                    <div>Total: ${quote.total}</div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      case "addresses":
        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Saved addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingAddresses ? (
                  <LoadingState title="Loading addresses" description="Fetching saved locations." />
                ) : addresses.length === 0 ? (
                  <EmptyState title="No addresses" description="Add your first drop-off address." />
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="rounded-lg border border-border/60 p-3">
                      <p className="text-sm font-semibold">{address.label || "Address"}</p>
                      <p className="text-xs text-muted-foreground">{address.address_line1}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Add address</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAddress} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="address-label">Label</Label>
                    <Input
                      id="address-label"
                      value={addressForm.label}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, label: event.target.value }))
                      }
                      placeholder="Home"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-line1">Address line 1</Label>
                    <Input
                      id="address-line1"
                      value={addressForm.address_line1}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, address_line1: event.target.value }))
                      }
                      list="address-suggestions"
                      placeholder="123 Main St"
                    />
                    <datalist id="address-suggestions">
                      {addressSuggestions.map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-city">City</Label>
                    <Input
                      id="address-city"
                      value={addressForm.city}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-state">State</Label>
                      <Input
                        id="address-state"
                        value={addressForm.state}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, state: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-postal">Postal code</Label>
                      <Input
                        id="address-postal"
                        value={addressForm.postal_code}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, postal_code: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Save address
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case "tracking":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Order tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedOrder ? (
                <EmptyState title="Select an order" description="Choose an order to view tracking." />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Order #{selectedOrder.id}</span>
                  </div>
                  <div className="rounded-lg border border-border/60 p-4">
                    <p className="text-xs text-muted-foreground mb-2">Tracking timeline</p>
                    <div className="space-y-2">
                      {trackingEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3">
                          <Badge variant="outline">{event.status}</Badge>
                          <div className="text-xs text-muted-foreground">
                            {event.created_at}
                            {event.latitude && event.longitude ? (
                              <div>
                                Coordinates: {event.latitude}, {event.longitude}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "chat":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chat with rider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedOrder ? (
                <EmptyState title="Select an order" description="Choose an order to chat with your rider." />
              ) : (
                <>
                  <div className="space-y-3">
                    {chatMessages.length === 0 ? (
                      <EmptyState title="No messages yet" description="Start the conversation." />
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className="rounded-lg border border-border/60 p-3">
                          <p className="text-xs text-muted-foreground">{message.created_at}</p>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <Textarea
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Type a message"
                      className="min-h-[44px]"
                    />
                    <Button type="submit" size="icon" className="mt-auto">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-gradient mb-2">Customer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.first_name || user?.username}.</p>
        </div>

        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
