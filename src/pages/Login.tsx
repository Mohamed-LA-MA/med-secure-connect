
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/ui/forms/LoginForm';

const Login = () => {
  const { isAuthenticated, redirectUserBasedOnRole } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectUserBasedOnRole();
    }
  }, [isAuthenticated, redirectUserBasedOnRole]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-medical-light to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-medical-primary mb-2">Med-Secure Connect</h1>
          <p className="text-gray-600">Gestion sécurisée des dossiers médicaux électroniques</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Système de gestion des dossiers médicaux électroniques sécurisés</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
