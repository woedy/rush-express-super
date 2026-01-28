import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Store,
    LayoutDashboard,
    Home,
    LogOut,
    User,
    ClipboardCheck,
    Package,
    LineChart,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const AppSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const currentTab = searchParams.get("tab") || "orders";

    const isActive = (path: string, tab?: string) => {
        if (tab) {
            return location.pathname === path && currentTab === tab;
        }
        return location.pathname === path && !searchParams.get("tab");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };


    const dashboardItems = [
        {
            title: "Orders",
            path: "/merchant",
            tab: "orders",
            icon: ClipboardCheck,
        },
        {
            title: "Branches",
            path: "/merchant",
            tab: "branches",
            icon: Store,
        },
        {
            title: "Inventory",
            path: "/merchant",
            tab: "inventory",
            icon: Package,
        },
        {
            title: "Analytics",
            path: "/merchant",
            tab: "analytics",
            icon: LineChart,
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="p-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="gradient-hero p-2 rounded-lg shadow-glow group-hover:shadow-strong transition-smooth">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <span className="text-gradient text-xl font-bold font-display block truncate">Rush Express</span>
                        <p className="text-xs text-muted-foreground -mt-1 truncate">Merchant Console</p>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {dashboardItems.map((item) => (
                                <SidebarMenuItem key={item.tab}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.path, item.tab)}
                                        tooltip={item.title}
                                    >
                                        <Link to={`${item.path}?tab=${item.tab}`}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center space-x-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user?.first_name || user?.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
