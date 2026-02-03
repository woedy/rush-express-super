import { Link } from 'react-router-dom';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
    { path: '/register', label: 'Get Started' },
  ];

  const services = [
    { path: '/customer', label: 'Order Delivery' },
    { path: '/merchant', label: 'Partner with Us' },
    { path: '/rider', label: 'Become a Rider' },
    { path: '/admin', label: 'Business Solutions' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="gradient-hero p-2 rounded-lg shadow-glow group-hover:shadow-strong transition-smooth">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-gradient text-lg font-bold font-display">
                  Rush Express
                </span>
                <p className="text-xs text-muted-foreground -mt-1">Fast & Reliable</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted delivery partner providing fast, reliable, and affordable
              delivery services across the city. Experience seamless logistics with
              real-time tracking and professional service.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Delivery Street, City Center</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-RUSH</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@rushexpress.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Our Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Connect With Us</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth group"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
            <div className="bg-gradient-subtle p-4 rounded-lg border border-border/50">
              <p className="text-sm font-medium text-foreground mb-1">24/7 Support Available</p>
              <p className="text-xs text-muted-foreground">
                Need help? Our customer support team is always ready to assist you.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© {currentYear} Rush Express. Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span>for faster deliveries.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-smooth">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-smooth">
                Terms of Service
              </Link>
              <Link to="/careers" className="hover:text-primary transition-smooth">
                Careers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;