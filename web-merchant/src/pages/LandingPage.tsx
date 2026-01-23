import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Store,
  Clock,
  Shield,
  DollarSign,
  MapPin,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Package,
  TrendingUp,
} from 'lucide-react';
import heroImage from '@/assets/hero-delivery.jpg';

const LandingPage = () => {
  const features = [
    {
      icon: Clock,
      title: 'Faster Fulfillment',
      description: 'Accept and dispatch orders instantly to nearby riders.',
      color: 'text-secondary'
    },
    {
      icon: Shield,
      title: 'Reliable Logistics',
      description: 'Real-time tracking and verified riders for every delivery.',
      color: 'text-primary'
    },
    {
      icon: DollarSign,
      title: 'Revenue Growth',
      description: 'Expand delivery reach without hiring your own fleet.',
      color: 'text-accent'
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: MapPin,
      title: 'Create Your Branch',
      description: 'Set up pickup locations and publish your inventory.'
    },
    {
      step: 2,
      icon: Smartphone,
      title: 'Manage Orders',
      description: 'Confirm incoming requests and hand off to riders.'
    },
    {
      step: 3,
      icon: CheckCircle,
      title: 'Track Performance',
      description: 'Monitor revenue and delivery times in real time.'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Cafe Owner',
      content: 'Rush Express increased our delivery volume by 40% with consistent rider coverage.',
      rating: 5,
      avatar: '☕'
    },
    {
      name: 'Mike Chen',
      role: 'Retail Manager',
      content: 'The merchant dashboard is simple and the analytics keep our team on top of fulfillment.',
      rating: 5,
      avatar: '🏬'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Restaurant Manager',
      content: 'Real-time updates and reliable riders keep our guests happy every night.',
      rating: 5,
      avatar: '🍽️'
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Merchants', value: '4K+' },
    { icon: Package, label: 'Deliveries Completed', value: '1M+' },
    { icon: TrendingUp, label: 'Revenue Lift', value: '32%' },
    { icon: Clock, label: 'Avg Delivery Time', value: '28min' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-subtle min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight">
                    <span className="text-gradient">Power your store</span>
                    <br />
                    <span className="text-foreground">with on-demand</span>
                    <br />
                    <span className="text-secondary">delivery</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Rush Express gives merchants real-time order management,
                    rider dispatch, and performance analytics to grow fast.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero" size="xl" className="text-lg">
                    <Link to="/register">
                      <Store className="mr-2 h-5 w-5" />
                      Open a Store
                    </Link>
                  </Button>
                  <Button asChild variant="cta" size="xl" className="text-lg">
                    <Link to="/login">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Sign In
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center space-x-8 pt-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Icon className="h-5 w-5 text-primary mr-1" />
                          <span className="font-bold text-lg text-foreground">{stat.value}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10 animate-float">
                  <img 
                    src={heroImage} 
                    alt="Rush Express Delivery Service" 
                    className="w-full h-auto rounded-2xl shadow-strong"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-secondary text-secondary-foreground p-4 rounded-xl shadow-orange-glow">
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Avg Delivery</div>
                      <div className="text-lg font-bold">28 min</div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 gradient-hero rounded-2xl blur-3xl opacity-20 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              Why Choose Rush Express?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with professional service to deliver 
              the best logistics experience in the industry.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="gradient-card border-border/50 shadow-soft hover:shadow-medium transition-smooth group">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50 ${feature.color} mb-4 group-hover:animate-pulse-glow transition-smooth`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your delivery done in three simple steps. 
              It's that easy with Rush Express!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  <div className="relative inline-block mb-6">
                    <div className="gradient-hero w-16 h-16 rounded-full flex items-center justify-center shadow-glow">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-orange-glow">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < howItWorks.length - 1 && (
                    <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground absolute top-8 -right-8 lg:-right-12" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="hero" size="lg">
              <Link to="/register">
                Launch Your First Branch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              What Merchants Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from merchants who run daily fulfillment with Rush Express.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-card border-border/50 shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Ready to Grow Delivery Sales?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Join merchants nationwide who trust Rush Express for fast, reliable delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="xl" className="text-lg">
                <Link to="/register">
                  <Store className="mr-2 h-5 w-5" />
                  Create Merchant Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="text-lg bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary"
              >
                <Link to="/login">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-accent opacity-90"></div>
      </section>
    </div>
  );
};

export default LandingPage;
