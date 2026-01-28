import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/State";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { AdminUser, DeliveryFeeSetting, Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

const AdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "users";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [riders, setRiders] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<DeliveryFeeSetting | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [selectedRider, setSelectedRider] = useState<Record<number, string>>({});
  const [kycSelection, setKycSelection] = useState<Record<number, string>>({});
  const [feeInput, setFeeInput] = useState("");

  const analytics = useMemo(() => {
    if (orders.length === 0) {
      return {
        totalOrders: 0,
        revenue: 0,
        delivered: 0,
        canceled: 0,
      };
    }
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const delivered = orders.filter((order) => order.status === "DELIVERED").length;
    const canceled = orders.filter((order) => order.status === "CANCELED").length;
    return { totalOrders, revenue, delivered, canceled };
  }, [orders]);

  const chartData = useMemo(
    () => [
      { name: "Orders", value: analytics.totalOrders },
      { name: "Delivered", value: analytics.delivered },
      { name: "Canceled", value: analytics.canceled },
    ],
    [analytics]
  );

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await apiClient.listUsers();
      setUsers(data);
      const ridersData = await apiClient.listUsers("RIDER");
      setRiders(ridersData);
    } finally {
      setIsLoadingUsers(false);
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

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await apiClient.getDeliveryFee();
      setDeliveryFee(data);
      setFeeInput(data.delivery_fee ?? "");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadOrders();
    loadSettings();
  }, []);

  const handleToggleUser = async (target: AdminUser) => {
    const updated = await apiClient.updateUserStatus(target.id, !target.is_suspended);
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (updated.role === "RIDER") {
      setRiders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const handleKycUpdate = async (target: AdminUser) => {
    if (!target.rider_profile_id) return;
    const status = kycSelection[target.id];
    if (!status) return;
    const response = await apiClient.updateRiderKyc(target.rider_profile_id, status);
    setUsers((prev) =>
      prev.map((item) =>
        item.id === target.id ? { ...item, rider_kyc_status: response.kyc_status } : item
      )
    );
    setRiders((prev) =>
      prev.map((item) =>
        item.id === target.id ? { ...item, rider_kyc_status: response.kyc_status } : item
      )
    );
  };

  const handleReassign = async (orderId: number) => {
    const riderId = Number(selectedRider[orderId]);
    if (!riderId) return;
    const updated = await apiClient.reassignOrder(orderId, riderId);
    setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
  };

  const handleUpdateFee = async () => {
    const updated = await apiClient.updateDeliveryFee(feeInput);
    setDeliveryFee(updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>User management</CardTitle>
              <Button variant="outline" size="sm" onClick={loadUsers}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingUsers ? (
                <LoadingState title="Loading users" description="Fetching all accounts." />
              ) : users.length === 0 ? (
                <EmptyState title="No users yet" description="Accounts will appear here." />
              ) : (
                users.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-lg border border-border/60 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {account.first_name || account.username}
                      </p>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">{account.role}</Badge>
                        {account.is_suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                        {account.role === "RIDER" && account.rider_kyc_status ? (
                          <Badge variant="outline">KYC {account.rider_kyc_status}</Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      {account.role === "RIDER" && account.rider_profile_id ? (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`kyc-${account.id}`} className="sr-only">
                            KYC status
                          </Label>
                          <Select
                            value={kycSelection[account.id] ?? ""}
                            onValueChange={(value) =>
                              setKycSelection((prev) => ({ ...prev, [account.id]: value }))
                            }
                          >
                            <SelectTrigger id={`kyc-${account.id}`} className="w-[160px]">
                              <SelectValue placeholder="KYC status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="VERIFIED">Verified</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleKycUpdate(account)}
                            disabled={!kycSelection[account.id]}
                          >
                            Update KYC
                          </Button>
                        </div>
                      ) : null}
                      <Button
                        size="sm"
                        variant={account.is_suspended ? "outline" : "destructive"}
                        onClick={() => handleToggleUser(account)}
                      >
                        {account.is_suspended ? (
                          <>
                            <UserCheck className="mr-1 h-4 w-4" /> Reactivate
                          </>
                        ) : (
                          <>
                            <UserX className="mr-1 h-4 w-4" /> Suspend
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      case "orders":
        return (
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Order monitoring</CardTitle>
              <Button variant="outline" size="sm" onClick={loadOrders}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingOrders ? (
                <LoadingState title="Loading orders" description="Pulling latest orders." />
              ) : orders.length === 0 ? (
                <EmptyState title="No orders yet" description="Orders will appear here." />
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border/60 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{order.id}</Badge>
                        <Badge>{order.status}</Badge>
                      </div>
                      <Badge variant="outline">Total {order.total}</Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="font-semibold">
                          {order.pickup_address_line1}, {order.pickup_city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dropoff</p>
                        <p className="font-semibold">
                          {order.dropoff_address_line1}, {order.dropoff_city}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`reassign-${order.id}`}>Reassign rider</Label>
                        <Select
                          value={selectedRider[order.id] ?? ""}
                          onValueChange={(value) =>
                            setSelectedRider((prev) => ({ ...prev, [order.id]: value }))
                          }
                        >
                          <SelectTrigger id={`reassign-${order.id}`}>
                            <SelectValue placeholder="Select rider" />
                          </SelectTrigger>
                          <SelectContent>
                            {riders.map((rider) => (
                              <SelectItem key={rider.id} value={String(rider.id)}>
                                {rider.first_name || rider.username} #{rider.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => handleReassign(order.id)}
                          disabled={!selectedRider[order.id]}
                        >
                          <Shield className="mr-2 h-4 w-4" /> Reassign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card>
            <CardHeader>
              <CardTitle>System analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingOrders ? (
                <LoadingState title="Loading analytics" description="Calculating system metrics." />
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Total orders</p>
                      <p className="text-2xl font-semibold">{analytics.totalOrders}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-semibold">{analytics.revenue.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Delivered</p>
                      <p className="text-2xl font-semibold">{analytics.delivered}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Canceled</p>
                      <p className="text-2xl font-semibold">{analytics.canceled}</p>
                    </div>
                  </div>
                  <div className={cn("rounded-lg border border-border/60 bg-muted/30 p-4")}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>System settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSettings ? (
                <LoadingState title="Loading settings" description="Retrieving current configuration." />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_fee">Delivery fee</Label>
                    <Input
                      id="delivery_fee"
                      type="number"
                      step="0.01"
                      value={feeInput}
                      onChange={(event) => setFeeInput(event.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current fee: {deliveryFee?.delivery_fee ?? "Not set"}
                    </p>
                  </div>
                  <Button onClick={handleUpdateFee}>
                    <Shield className="mr-2 h-4 w-4" />
                    Update delivery fee
                  </Button>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-display text-gradient">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || user?.username}. Monitor the system in real time.
          </p>
        </div>

        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
