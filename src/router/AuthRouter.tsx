
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface AuthRouterProps {
  children: ReactNode;
}

const AuthRouter = ({ children }: AuthRouterProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Verify the user is accessing the correct routes based on their role
    if (user) {
      const path = window.location.pathname;
      
      if (user.role === 'patient' && !path.includes('/patient-view')) {
        navigate('/patient-view');
        toast({
          title: "Redirection",
          description: "Vous êtes redirigé vers votre espace patient",
        });
      } else if (user.role === 'healthActor' && !path.includes('/health-actor-view')) {
        navigate('/health-actor-view');
        toast({
          title: "Redirection",
          description: "Vous êtes redirigé vers votre espace professionnel de santé",
        });
      } else if (user.role === 'admin' && (path.includes('/patient-view') || path.includes('/health-actor-view'))) {
        navigate('/dashboard');
        toast({
          title: "Redirection",
          description: "Vous êtes redirigé vers le tableau de bord administrateur",
        });
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthRouter;
