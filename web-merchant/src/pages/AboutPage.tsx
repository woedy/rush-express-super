import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Users, 
  Clock, 
  Shield,
  Award,
  Target,
  Heart,
  Globe,
  Star,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const values = [
    {
      icon: Clock,
      title: 'Speed & Efficiency',
      description: 'We prioritize fast delivery times without compromising quality or safety.'
    },
    {
      icon: Shield,
      title: 'Reliability & Trust',
      description: 'Your packages are secure with our insured delivery network and tracking system.'
    },
    {
      icon: Heart,
      title: 'Merchant First',
      description: 'Every decision we make is focused on creating the best experience for our partners.'
    },
    {
      icon: Globe,
      title: 'Community Impact',
      description: 'We support local businesses and provide employment opportunities in every community.'
    },
  ];

  const stats = [
    { icon: Users, number: '4K+', label: 'Active Merchants' },
    { icon: Truck, number: '5K+', label: 'Professional Riders' },
    { icon: CheckCircle, number: '1M+', label: 'Completed Deliveries' },
    { icon: Star, number: '4.9', label: 'Average Rating' },
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      description: 'Former logistics executive with 15+ years in supply chain optimization.',
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      description: 'Tech innovator specializing in real-time tracking and mobile applications.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Johnson',
      role: 'Head of Operations',
      description: 'Operations expert ensuring smooth rider network management and merchant success.',
      avatar: '👩‍🔧'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-subtle py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-6">
              About Rush Express
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              We're revolutionizing the delivery industry by combining cutting-edge technology 
              with human-centered service. Founded in 2020, Rush Express has grown from a small 
              startup to the most trusted delivery platform in the region.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/register">Become a Partner</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="gradient-hero w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-glow">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To make delivery services accessible, affordable, and efficient for everyone. 
                We believe that fast, reliable logistics should be a service that connects 
                communities, supports local businesses, and makes daily life easier for everyone.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Innovation First</h3>
                    <p className="text-sm text-muted-foreground">
                      Constantly improving our technology and processes to deliver better experiences.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Quality Service</h3>
                    <p className="text-sm text-muted-foreground">
                      Maintaining the highest standards in every delivery, every time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Community Focus</h3>
                    <p className="text-sm text-muted-foreground">
                      Supporting local economies and creating meaningful employment opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="gradient-card p-8 rounded-2xl shadow-medium border border-border/50">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  To become the global standard for delivery services, where technology and 
                  human connection work together to create seamless logistics experiences 
                  that benefit everyone in the ecosystem.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-foreground font-medium">
                    "Every delivery is an opportunity to exceed expectations and build trust."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">- Rush Express Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from product development to merchant support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="gradient-card border-border/50 shadow-soft hover:shadow-medium transition-smooth text-center">
                  <CardContent className="p-6">
                    <div className="gradient-hero w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4 shadow-glow">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate professionals dedicated to revolutionizing the delivery experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="gradient-card border-border/50 shadow-soft hover:shadow-medium transition-smooth text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{member.avatar}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of merchants who have made Rush Express
            their trusted delivery partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/register">
                <Truck className="mr-2 h-5 w-5" />
                Start Partnering
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary">
              <Link to="/contact">
                <Users className="mr-2 h-5 w-5" />
                Contact Our Team
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
