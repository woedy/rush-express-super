import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Clock,
  Users,
  MapPin,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
  Settings,
  BarChart3,
} from 'lucide-react';
import heroImage from '@/assets/hero-delivery.jpg';

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure Oversight',
      description: 'Role-based controls, audit trails, and system-wide visibility.',
      color: 'text-secondary'
    },
    {
      icon: Settings,
      title: 'System Controls',
      description: 'Manage delivery fees, users, and operational safeguards.',
      color: 'text-primary'
    },
    {
      icon: BarChart3,
      title: 'Live Analytics',
      description: 'Monitor order volumes, revenue, and delivery performance.',
      color: 'text-accent'
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: MapPin,
      title: 'Monitor Orders',
      description: 'Track every order across merchants and riders.'
    },
    {
      step: 2,
      icon: Smartphone,
      title: 'Manage Users',
      description: 'Suspend or verify accounts and keep operations safe.'
    },
    {
      step: 3,
      icon: CheckCircle,
      title: 'Tune Settings',
      description: 'Adjust delivery fees and operational settings quickly.'
    },
  ];

  const testimonials = [
    {
      name: 'Amina Okoro',
      role: 'Operations Lead',
      content: 'The admin console makes it easy to keep orders flowing and riders accountable.',
      rating: 5,
      avatar: '🛡️'
    },
    {
      name: 'Carlos Vega',
      role: 'Dispatch Manager',
      content: 'Real-time analytics help us spot bottlenecks before they affect service levels.',
      rating: 5,
      avatar: '📊'
    },
    {
      name: 'Diane Lee',
      role: 'Risk & Compliance',
      content: 'User controls and audit trails give us the confidence to scale.',
      rating: 5,
      avatar: '✅'
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Accounts', value: '60K+' },
    { icon: TrendingUp, label: 'Delivery Success', value: '99.8%' },
    { icon: Clock, label: 'Avg Delivery Time', value: '28min' },
    { icon: Shield, label: 'Verified Riders', value: '5K+' },
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
                    <span className="text-gradient">Command the network</span>
                    <br />
                    <span className="text-foreground">with real-time</span>
                    <br />
                    <span className="text-secondary">control</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                    The Rush Express admin console gives you full visibility into
                    users, orders, and operational performance.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero" size="xl" className="text-lg">
                    <Link to="/login">
                      <Shield className="mr-2 h-5 w-5" />
                      Admin Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="cta" size="xl" className="text-lg">
                    <Link to="/register">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Request Access
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
              <Link to="/login">
                Enter the Admin Console
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
              What Operations Teams Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from teams who rely on Rush Express to keep deliveries running.
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
              Ready to Operate at Scale?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Coordinate riders, merchants, and customers from one secure console.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="xl" className="text-lg">
                <Link to="/login">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Sign In
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="text-lg bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary"
              >
                <Link to="/register">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Request Access
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
