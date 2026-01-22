import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="gradient-hero p-2 rounded-lg shadow-glow group-hover:shadow-strong transition-smooth">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-gradient text-xl font-bold font-display">Rush Express</span>
              <p className="text-xs text-muted-foreground -mt-1">Merchant Console</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-smooth",
                isActive("/") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              )}
            >
              Home
            </Link>
            <Link
              to="/merchant"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-smooth",
                isActive("/merchant") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              )}
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.first_name || user.username}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="cta" size="sm">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
