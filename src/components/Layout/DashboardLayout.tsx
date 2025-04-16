
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  LineChart, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, organization, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Protect the route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      href: '/dashboard',
    },
    {
      icon: Users,
      label: 'Patients',
      href: '/patients',
    },
    {
      icon: UserCog,
      label: 'Acteurs de santé',
      href: '/health-actors',
    },
    {
      icon: LineChart,
      label: 'Statistiques',
      href: '/stats',
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-medical-gray flex flex-col md:flex-row">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <h1 className="text-xl font-bold text-medical-primary ml-2">Med-Secure</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-gray-500"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Sidebar - Desktop always visible, Mobile conditionally visible */}
      <div className={cn(
        "bg-white w-64 shadow-md transition-all duration-300 ease-in-out",
        "flex-shrink-0 h-screen sticky top-0 overflow-y-auto",
        "md:block", // Always visible on desktop
        sidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden" // Conditional on mobile
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-medical-primary">Med-Secure</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-500 mb-2">Organisation</div>
            <div className="px-3 py-2 bg-medical-light rounded-md font-medium text-medical-primary">
              {organization}
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-500 mb-2">Utilisateur</div>
            <div className="px-3 py-2 bg-medical-light rounded-md">
              <div className="font-medium text-medical-primary">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
        </div>
        
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md text-gray-600 hover:bg-medical-light hover:text-medical-primary",
                    "transition-colors duration-200",
                    location.pathname === item.href && "bg-medical-light text-medical-primary font-medium"
                  )}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-medical-primary"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Page title will be different on each page */}
        <div className="mb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
