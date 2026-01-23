import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="gradient-hero w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-glow">
          <span className="text-3xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Oops! The page you're looking for doesn't exist. 
          It might have been moved or deleted.
        </p>
        <Button asChild variant="hero" size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
