import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, LoadingState } from "@/components/State";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { Order, RiderAvailability, RiderEarnings, RiderLocation } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Activity,
  DollarSign,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Truck,
} from "lucide-react";

const statusOptions = [
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
] as const;

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));

const RiderDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [availability, setAvailability] = useState<RiderAvailability | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [earnings, setEarnings] = useState<RiderEarnings[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [lastLocation, setLastLocation] = useState<RiderLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState({ latitude: "", longitude: "" });

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const totalEarnings = useMemo(
    () =>
      earnings.reduce((sum, entry) => sum + Number(entry.total_earnings ?? 0), 0),
    [earnings]
  );

  const totalDeliveries = useMemo(
    () => earnings.reduce((sum, entry) => sum + Number(entry.total_deliveries ?? 0), 0),
    [earnings]
  );

  const loadAvailability = async () => {
    setIsLoadingAvailability(true);
    try {
      const data = await apiClient.getAvailability();
      setAvailability(data);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await apiClient.listAvailableOrders();
      setAvailableOrders(data);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadEarnings = async () => {
    setIsLoadingEarnings(true);
    try {
      const data = await apiClient.listEarnings();
      setEarnings(data);
    } finally {
      setIsLoadingEarnings(false);
    }
  };

  useEffect(() => {
    loadAvailability();
    loadOrders();
    loadEarnings();
  }, []);

  useEffect(() => {
    if (!trackingEnabled) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSentRef.current < 8000) return;
        lastSentRef.current = now;
        const payload = {
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        };
        setLastLocation({ ...payload, updated_at: new Date().toISOString() });
        apiClient.updateLocation(payload).catch(() => undefined);
      },
      (error) => setLocationError(error.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingEnabled]);

  const handleAvailabilityToggle = async (next: boolean) => {
    setIsUpdatingAvailability(true);
    try {
      const data = await apiClient.setAvailability({ is_online: next });
      setAvailability(data);
      if (next) {
        loadOrders();
      } else {
        setAvailableOrders([]);
      }
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    const order = await apiClient.acceptOrder(orderId);
    setActiveOrder(order);
    setAvailableOrders((prev) => prev.filter((item) => item.id !== orderId));
  };

  const handleStatusUpdate = async (status: string) => {
    if (!activeOrder) return;
    setIsUpdatingStatus(true);
    try {
      const payload = {
        status,
        latitude: lastLocation?.latitude,
        longitude: lastLocation?.longitude,
      };
      const updated = await apiClient.updateOrderStatus(activeOrder.id, payload);
      setActiveOrder(updated);
      if (status === "DELIVERED") {
        loadEarnings();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.latitude || !manualLocation.longitude) return;
    const data = await apiClient.updateLocation({
      latitude: manualLocation.latitude,
      longitude: manualLocation.longitude,
    });
    setLastLocation(data);
  };

  const navigationUrl = useMemo(() => {
    if (!activeOrder) return "";
    const origin = encodeURIComponent(
      `${activeOrder.pickup_address_line1} ${activeOrder.pickup_city} ${activeOrder.pickup_country}`
    );
    const destination = encodeURIComponent(
      `${activeOrder.dropoff_address_line1} ${activeOrder.dropoff_city} ${activeOrder.dropoff_country}`
    );
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }, [activeOrder]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-gradient">Rider Console</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.first_name || user?.username}. Stay ready for your next delivery.
            </p>
          </div>
          <Card className="w-full md:w-auto">
            <CardContent className="flex items-center gap-4 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Availability</p>
                <p className="text-sm font-semibold">
                  {availability?.is_online ? "Online" : "Offline"}
                </p>
              </div>
              {isLoadingAvailability ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
              ) : (
                <Switch
                  checked={Boolean(availability?.is_online)}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={isUpdatingAvailability}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Route className="h-4 w-4" /> Active
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Earnings
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle>Available orders</CardTitle>
                <Button variant="outline" size="sm" onClick={loadOrders}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingOrders ? (
                  <LoadingState title="Loading orders" description="Checking the latest pickup requests." />
                ) : availableOrders.length === 0 ? (
                  <EmptyState title="No available orders" description="Stay online to receive requests." />
                ) : (
                  availableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-border/60 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">#{order.id}</Badge>
                          <Badge>{order.status}</Badge>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Pickup</p>
                          <p className="text-muted-foreground">
                            {order.pickup_address_line1}, {order.pickup_city}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Dropoff</p>
                          <p className="text-muted-foreground">
                            {order.dropoff_address_line1}, {order.dropoff_city}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">Total: {formatCurrency(order.total)}</p>
                      </div>
                      <Button onClick={() => handleAcceptOrder(order.id)}>Accept order</Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!activeOrder ? (
                  <EmptyState title="No active order" description="Accept an order to start delivery." />
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-border/60 p-4">
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="font-semibold">{activeOrder.pickup_address_line1}</p>
                        <p className="text-sm text-muted-foreground">
                          {activeOrder.pickup_city}, {activeOrder.pickup_country}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 p-4">
                        <p className="text-xs text-muted-foreground">Dropoff</p>
                        <p className="font-semibold">{activeOrder.dropoff_address_line1}</p>
                        <p className="text-sm text-muted-foreground">
                          {activeOrder.dropoff_city}, {activeOrder.dropoff_country}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {statusOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={activeOrder.status === option.value ? "default" : "outline"}
                          onClick={() => handleStatusUpdate(option.value)}
                          disabled={isUpdatingStatus || activeOrder.status === option.value}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>Current status: {activeOrder.status}</span>
                      </div>
                      <Button asChild variant="ghost">
                        <a href={navigationUrl} target="_blank" rel="noreferrer">
                          <Navigation className="mr-2 h-4 w-4" /> Open navigation
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingEarnings ? (
                  <LoadingState title="Loading earnings" description="Calculating your payouts." />
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-border/60 p-4">
                        <p className="text-xs text-muted-foreground">Total deliveries</p>
                        <p className="text-2xl font-semibold">{totalDeliveries}</p>
                      </div>
                      <div className="rounded-lg border border-border/60 p-4">
                        <p className="text-xs text-muted-foreground">Total earnings</p>
                        <p className="text-2xl font-semibold">{formatCurrency(totalEarnings)}</p>
                      </div>
                    </div>
                    {earnings.length === 0 ? (
                      <EmptyState
                        title="No earnings yet"
                        description="Complete deliveries to start seeing payouts."
                      />
                    ) : (
                      earnings.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-lg border border-border/60 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold">
                              {entry.period_start} - {entry.period_end}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Deliveries: {entry.total_deliveries}
                            </p>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(entry.total_earnings)}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Live location updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-semibold">Auto tracking</p>
                    <p className="text-xs text-muted-foreground">
                      Send live coordinates to dispatch every few seconds.
                    </p>
                  </div>
                  <Switch checked={trackingEnabled} onCheckedChange={setTrackingEnabled} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={manualLocation.latitude}
                      onChange={(event) =>
                        setManualLocation((prev) => ({ ...prev, latitude: event.target.value }))
                      }
                      placeholder="37.7749"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={manualLocation.longitude}
                      onChange={(event) =>
                        setManualLocation((prev) => ({ ...prev, longitude: event.target.value }))
                      }
                      placeholder="-122.4194"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Button onClick={handleManualLocation} variant="outline">
                    Send location now
                  </Button>
                  {locationError ? (
                    <p className="text-sm text-destructive">{locationError}</p>
                  ) : lastLocation ? (
                    <p className="text-sm text-muted-foreground">
                      Last sent: {lastLocation.latitude}, {lastLocation.longitude}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No location sent yet.</p>
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-lg border border-border/60 p-4 text-sm",
                    trackingEnabled ? "bg-muted/30" : "bg-background"
                  )}
                >
                  <p className="font-semibold">Tracking status</p>
                  <p className="text-muted-foreground">
                    {trackingEnabled
                      ? "Auto tracking is on. Keep this tab open while you are online."
                      : "Enable auto tracking to keep customers updated in real time."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RiderDashboard;
