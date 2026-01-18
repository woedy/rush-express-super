import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  User,
  Plus,
  History,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedTime: string;
  cost: number;
  rider?: {
    name: string;
    phone: string;
    rating: number;
  };
}

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'new-order' | 'orders' | 'profile'>('new-order');
  const [orderForm, setOrderForm] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    itemDescription: '',
    notes: ''
  });

  // Mock order data
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      pickupAddress: '123 Mall Street, Downtown',
      deliveryAddress: '456 Home Avenue, Suburbs',
      itemDescription: 'Electronics - Smartphone',
      status: 'delivered',
      createdAt: '2024-01-20 14:30',
      estimatedTime: '25 min',
      cost: 12.50,
      rider: {
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        rating: 4.8
      }
    },
    {
      id: 'ORD-002',
      pickupAddress: 'Restaurant Plaza, Main St',
      deliveryAddress: '789 Office Building, Business District',
      itemDescription: 'Food - Lunch Order',
      status: 'in_transit',
      createdAt: '2024-01-21 12:15',
      estimatedTime: '15 min',
      cost: 8.75,
      rider: {
        name: 'Sarah Johnson',
        phone: '+1 (555) 987-6543',
        rating: 4.9
      }
    },
    {
      id: 'ORD-003',
      pickupAddress: 'Pharmacy Corner, Health Blvd',
      deliveryAddress: '321 Residential Lane, Uptown',
      itemDescription: 'Medical Supplies',
      status: 'pending',
      createdAt: '2024-01-21 16:45',
      estimatedTime: '30 min',
      cost: 15.00
    }
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'picked_up': return 'bg-accent text-accent-foreground';
      case 'in_transit': return 'bg-primary text-primary-foreground';
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'picked_up': return Package;
      case 'in_transit': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock order submission
    console.log('Order submitted:', orderForm);
    // Reset form
    setOrderForm({
      pickupAddress: '',
      deliveryAddress: '',
      itemDescription: '',
      notes: ''
    });
  };

  const tabs = [
    { id: 'new-order' as const, label: 'New Order', icon: Plus },
    { id: 'orders' as const, label: 'Order History', icon: History },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-gradient mb-2">Customer Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries and track orders in real-time</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg mb-8 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth",
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'new-order' && (
              <Card className="gradient-card shadow-medium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span>Create New Order</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOrder} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup" className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span>Pickup Address</span>
                        </Label>
                        <Input
                          id="pickup"
                          placeholder="Enter pickup location"
                          value={orderForm.pickupAddress}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, pickupAddress: e.target.value }))}
                          className="border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery" className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-secondary" />
                          <span>Delivery Address</span>
                        </Label>
                        <Input
                          id="delivery"
                          placeholder="Enter delivery location"
                          value={orderForm.deliveryAddress}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                          className="border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item" className="flex items-center space-x-1">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Item Description</span>
                      </Label>
                      <Input
                        id="item"
                        placeholder="What are you sending?"
                        value={orderForm.itemDescription}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, itemDescription: e.target.value }))}
                        className="border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special delivery instructions..."
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="border-border/50 focus:border-primary"
                        rows={3}
                      />
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                        <span className="text-lg font-semibold text-primary">$12.50</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estimated Time:</span>
                        <span className="text-sm font-medium text-foreground">25-30 minutes</span>
                      </div>
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      <Package className="mr-2 h-4 w-4" />
                      Place Order
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {mockOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <Card key={order.id} className="gradient-card shadow-soft border-border/50 hover:shadow-medium transition-smooth">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="gradient-hero p-2 rounded-lg">
                              <Package className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{order.id}</h3>
                              <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                            </div>
                          </div>
                          <Badge className={cn("flex items-center space-x-1", getStatusColor(order.status))}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">From:</p>
                            <p className="text-sm font-medium text-foreground">{order.pickupAddress}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">To:</p>
                            <p className="text-sm font-medium text-foreground">{order.deliveryAddress}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Item:</p>
                            <p className="font-medium text-foreground">{order.itemDescription}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Time:</p>
                            <p className="font-medium text-foreground">{order.estimatedTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Cost:</p>
                            <p className="font-medium text-primary">${order.cost.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {order.rider && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">{order.rider.name}</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-secondary text-secondary" />
                                  <span className="text-xs text-muted-foreground">{order.rider.rating}</span>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">{order.rider.phone}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="gradient-card shadow-medium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Profile Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="john@example.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>Saved Addresses</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-center justify-between">
                        <span className="text-sm text-foreground">Home - 123 Main St, City</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-center justify-between">
                        <span className="text-sm text-foreground">Work - 456 Office Blvd, Downtown</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span>Payment Methods</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-center justify-between">
                        <span className="text-sm text-foreground">**** **** **** 4567 (Default)</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                  </div>

                  <Button variant="hero" className="w-full">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="gradient-card shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Orders:</span>
                  <span className="font-semibold text-primary">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month:</span>
                  <span className="font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Spent:</span>
                  <span className="font-semibold text-secondary">$387.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Rating:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground text-sm">4.9</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="gradient-secondary text-white shadow-orange-glow border-secondary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-white/90 mb-4">
                  Our 24/7 support team is here to assist you with any questions.
                </p>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-secondary">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;