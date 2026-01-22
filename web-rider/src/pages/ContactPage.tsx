import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  Headphones,
  Users,
  Truck
} from 'lucide-react';

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const contactInfo = [
    {
      icon: Phone,
      title: '24/7 Support Hotline',
      details: '+1 (555) 123-RUSH',
      description: 'Call us anytime for immediate assistance',
      color: 'text-primary'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: 'support@rushexpress.com',
      description: 'We respond within 2 hours',
      color: 'text-secondary'
    },
    {
      icon: MapPin,
      title: 'Headquarters',
      details: '123 Delivery Street, City Center',
      description: 'Visit us Monday-Friday, 9AM-6PM',
      color: 'text-accent'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Sunday, 24/7',
      description: 'Our riders are always ready',
      color: 'text-success'
    },
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'support', label: 'Rider Support', icon: Headphones },
    { value: 'partnership', label: 'Partnership', icon: Users },
    { value: 'rider', label: 'Become a Rider', icon: Truck },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      type: 'general'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-subtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have questions? Need support? Want to partner with us? 
              We'd love to hear from you. Our team is here to help 24/7.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="gradient-card shadow-medium border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl font-display flex items-center space-x-2">
                  <Send className="h-6 w-6 text-primary" />
                  <span>Send us a Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type */}
                  <div className="space-y-3">
                    <Label>What can we help you with?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {inquiryTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setContactForm(prev => ({ ...prev, type: type.value }))}
                            className={`p-3 rounded-lg border transition-smooth text-sm font-medium flex flex-col items-center space-y-1 ${
                              contactForm.type === type.value
                                ? 'bg-primary text-primary-foreground border-primary shadow-soft'
                                : 'bg-background border-border hover:bg-muted'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs text-center">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about how we can help..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="border-border/50 focus:border-primary min-h-32"
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    We'll get back to you within 2 hours during business hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Quick Actions */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="gradient-card shadow-soft border-border/50 hover:shadow-medium transition-smooth">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`${info.color} bg-muted/50 p-2 rounded-lg`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-sm mb-1">{info.title}</h3>
                          <p className="font-medium text-foreground text-sm mb-1">{info.details}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="gradient-secondary shadow-orange-glow border-secondary/20">
              <CardContent className="p-6 text-white text-center">
                <h3 className="font-semibold text-lg mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-white/90 mb-4">
                  For urgent delivery issues or support, call our 24/7 hotline.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-secondary"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now: (555) 123-RUSH
                </Button>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="gradient-card shadow-soft border-border/50">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-foreground mb-2">Frequently Asked Questions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Find quick answers to common questions about our service.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View FAQ
                </Button>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rider Service:</span>
                    <span className="font-medium text-foreground">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Service:</span>
                    <span className="font-medium text-foreground">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Office Hours:</span>
                    <span className="font-medium text-foreground">9AM - 6PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
