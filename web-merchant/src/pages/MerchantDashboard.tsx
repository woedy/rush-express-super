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
import type { InventoryItem, MerchantAnalytics, MerchantBranch, Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Box,
  ClipboardCheck,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Store,
  XCircle,
} from "lucide-react";

const emptyBranchForm = {
  name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
};

const emptyInventoryForm = {
  branch: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  is_active: "true",
};

const MerchantDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "orders";

  const [branches, setBranches] = useState<MerchantBranch[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingInventoryId, setEditingInventoryId] = useState<number | null>(null);
  const [isSavingBranch, setIsSavingBranch] = useState(false);
  const [isSavingInventory, setIsSavingInventory] = useState(false);

  const analyticsChart = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Orders", value: analytics.order_count },
      { name: "Revenue", value: Number(analytics.revenue) },
      { name: "Avg Minutes", value: analytics.avg_delivery_time_minutes ?? 0 },
    ];
  }, [analytics]);

  const loadBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const data = await apiClient.listBranches();
      setBranches(data);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const loadInventory = async () => {
    setIsLoadingInventory(true);
    try {
      const data = await apiClient.listInventory();
      setInventory(data);
    } finally {
      setIsLoadingInventory(false);
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

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await apiClient.getAnalytics();
      setAnalytics(data);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadBranches();
    loadInventory();
    loadOrders();
    loadAnalytics();
  }, []);

  const handleBranchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingBranch(true);
    try {
      if (editingBranchId) {
        const updated = await apiClient.updateBranch(editingBranchId, branchForm);
        setBranches((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await apiClient.createBranch(branchForm);
        setBranches((prev) => [...prev, created]);
      }
      setBranchForm(emptyBranchForm);
      setEditingBranchId(null);
    } finally {
      setIsSavingBranch(false);
    }
  };

  const handleBranchEdit = (branch: MerchantBranch) => {
    setBranchForm({
      name: branch.name,
      address_line1: branch.address_line1,
      address_line2: branch.address_line2 ?? "",
      city: branch.city,
      state: branch.state ?? "",
      postal_code: branch.postal_code ?? "",
      country: branch.country,
    });
    setEditingBranchId(branch.id);
  };

  const handleBranchDelete = async (branchId: number) => {
    await apiClient.deleteBranch(branchId);
    setBranches((prev) => prev.filter((item) => item.id !== branchId));
  };

  const handleInventorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingInventory(true);
    try {
      const payload = {
        branch: Number(inventoryForm.branch),
        name: inventoryForm.name,
        description: inventoryForm.description,
        price: inventoryForm.price,
        stock: Number(inventoryForm.stock || 0),
        is_active: inventoryForm.is_active === "true",
      };
      if (editingInventoryId) {
        const updated = await apiClient.updateInventory(editingInventoryId, payload);
        setInventory((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await apiClient.createInventory(payload);
        setInventory((prev) => [...prev, created]);
      }
      setInventoryForm(emptyInventoryForm);
      setEditingInventoryId(null);
    } finally {
      setIsSavingInventory(false);
    }
  };

  const handleInventoryEdit = (item: InventoryItem) => {
    setInventoryForm({
      branch: String(item.branch),
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      stock: String(item.stock),
      is_active: item.is_active ? "true" : "false",
    });
    setEditingInventoryId(item.id);
  };

  const handleInventoryDelete = async (itemId: number) => {
    await apiClient.deleteInventory(itemId);
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleOrderStatus = async (orderId: number, status: string) => {
    const updated = await apiClient.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Orders queue</CardTitle>
              <Button variant="outline" size="sm" onClick={loadOrders}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingOrders ? (
                <LoadingState title="Loading orders" description="Fetching the latest orders." />
              ) : orders.length === 0 ? (
                <EmptyState title="No orders yet" description="New orders will appear here." />
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOrderStatus(order.id, "CONFIRMED")}
                          disabled={order.status !== "CREATED"}
                        >
                          <ClipboardCheck className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOrderStatus(order.id, "CANCELED")}
                          disabled={order.status === "CANCELED" || order.status === "DELIVERED"}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm font-semibold">
                          {order.pickup_address_line1}, {order.pickup_city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dropoff</p>
                        <p className="text-sm font-semibold">
                          {order.dropoff_address_line1}, {order.dropoff_city}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Items: {order.items.length} · Total {order.total}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      case "branches":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Branch management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleBranchSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch_name">Branch name</Label>
                    <Input
                      id="branch_name"
                      value={branchForm.name}
                      onChange={(event) =>
                        setBranchForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_city">City</Label>
                    <Input
                      id="branch_city"
                      value={branchForm.city}
                      onChange={(event) =>
                        setBranchForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_address">Address line 1</Label>
                    <Input
                      id="branch_address"
                      value={branchForm.address_line1}
                      onChange={(event) =>
                        setBranchForm((prev) => ({ ...prev, address_line1: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_address2">Address line 2</Label>
                    <Input
                      id="branch_address2"
                      value={branchForm.address_line2}
                      onChange={(event) =>
                        setBranchForm((prev) => ({ ...prev, address_line2: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_state">State</Label>
                    <Input
                      id="branch_state"
                      value={branchForm.state}
                      onChange={(event) =>
                        setBranchForm((prev) => ({ ...prev, state: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_postal">Postal code</Label>
                    <Input
                      id="branch_postal"
                      value={branchForm.postal_code}
                      onChange={(event) =>
                        setBranchForm((prev) => ({ ...prev, postal_code: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isSavingBranch}>
                    <Plus className="mr-2 h-4 w-4" />
                    {editingBranchId ? "Update branch" : "Add branch"}
                  </Button>
                  {editingBranchId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setBranchForm(emptyBranchForm);
                        setEditingBranchId(null);
                      }}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>

              {isLoadingBranches ? (
                <LoadingState title="Loading branches" description="Fetching your locations." />
              ) : branches.length === 0 ? (
                <EmptyState title="No branches yet" description="Create your first pickup location." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {branches.map((branch) => (
                    <div key={branch.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{branch.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <MapPin className="mr-1 inline h-3 w-3" />
                            {branch.address_line1}, {branch.city}
                          </p>
                        </div>
                        <Badge variant="secondary">#{branch.id}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBranchEdit(branch)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleBranchDelete(branch.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "inventory":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleInventorySubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inventory_branch">Branch</Label>
                    <Select
                      value={inventoryForm.branch}
                      onValueChange={(value) =>
                        setInventoryForm((prev) => ({ ...prev, branch: value }))
                      }
                    >
                      <SelectTrigger id="inventory_branch">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={String(branch.id)}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory_name">Item name</Label>
                    <Input
                      id="inventory_name"
                      value={inventoryForm.name}
                      onChange={(event) =>
                        setInventoryForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory_description">Description</Label>
                    <Input
                      id="inventory_description"
                      value={inventoryForm.description}
                      onChange={(event) =>
                        setInventoryForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory_price">Price</Label>
                    <Input
                      id="inventory_price"
                      type="number"
                      step="0.01"
                      value={inventoryForm.price}
                      onChange={(event) =>
                        setInventoryForm((prev) => ({ ...prev, price: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory_stock">Stock</Label>
                    <Input
                      id="inventory_stock"
                      type="number"
                      value={inventoryForm.stock}
                      onChange={(event) =>
                        setInventoryForm((prev) => ({ ...prev, stock: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory_status">Status</Label>
                    <Select
                      value={inventoryForm.is_active}
                      onValueChange={(value) =>
                        setInventoryForm((prev) => ({ ...prev, is_active: value }))
                      }
                    >
                      <SelectTrigger id="inventory_status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isSavingInventory || !inventoryForm.branch}>
                    <Box className="mr-2 h-4 w-4" />
                    {editingInventoryId ? "Update item" : "Add item"}
                  </Button>
                  {editingInventoryId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setInventoryForm(emptyInventoryForm);
                        setEditingInventoryId(null);
                      }}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>

              {isLoadingInventory ? (
                <LoadingState title="Loading inventory" description="Fetching your items." />
              ) : inventory.length === 0 ? (
                <EmptyState title="No inventory yet" description="Add your first item to sell." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {inventory.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Badge variant={item.is_active ? "secondary" : "outline"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Price: {item.price} · Stock: {item.stock}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleInventoryEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleInventoryDelete(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Performance analytics</CardTitle>
              <Button variant="outline" size="sm" onClick={loadAnalytics}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingAnalytics ? (
                <LoadingState title="Loading analytics" description="Crunching the latest numbers." />
              ) : analytics ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="text-2xl font-semibold">{analytics.order_count}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-semibold">{analytics.revenue}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <p className="text-xs text-muted-foreground">Avg delivery (min)</p>
                      <p className="text-2xl font-semibold">
                        {analytics.avg_delivery_time_minutes
                          ? analytics.avg_delivery_time_minutes.toFixed(1)
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border border-border/60 bg-muted/30 p-4",
                      analyticsChart.length === 0 && "text-muted-foreground"
                    )}
                  >
                    {analyticsChart.length === 0 ? (
                      "No analytics data to display yet."
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analyticsChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </>
              ) : (
                <EmptyState title="No analytics yet" description="Complete orders to see insights." />
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
          <h1 className="text-3xl font-bold font-display text-gradient">Merchant Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || user?.username}. Manage your branches, orders, and inventory.
          </p>
        </div>

        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
