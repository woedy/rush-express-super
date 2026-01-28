import Navigation from './Navigation';
import Footer from './Footer';
import { useAuthStore } from '@/lib/auth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
              <SidebarTrigger className="-ml-1" />
            </header>
            <div className="flex-1">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;