
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/ui/forms/LoginForm';
import { Chain, Lock, ShieldCheck, Key, Database } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user) {
        switch (user.role) {
          case 'admin':
            navigate('/dashboard');
            break;
          case 'patient':
            navigate('/patient-view');
            break;
          case 'healthActor':
            navigate('/health-actor-view');
            break;
          default:
            navigate('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Effet de particules pour simulation blockchain
  const renderBlockchainNodes = () => {
    const nodes = [];
    for (let i = 0; i < 15; i++) {
      const animationDelay = Math.random() * 5;
      const size = Math.floor(Math.random() * 10) + 15;
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      
      nodes.push(
        <div
          key={i}
          className="absolute rounded-full bg-medical-primary/20 backdrop-blur-sm"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            animation: `float 15s ease-in-out infinite`,
            animationDelay: `${animationDelay}s`,
          }}
        />
      );
    }
    return nodes;
  };
  
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-b from-medical-dark to-gray-900 p-4 overflow-hidden">
      {/* Fond animé de noeuds blockchain */}
      <div className="absolute inset-0 overflow-hidden">
        {renderBlockchainNodes()}
        <div className="absolute inset-0 backdrop-blur-[100px]"></div>
      </div>

      {/* Effet de grille/hexagones en arrière-plan */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIiBvcGFjaXR5PSIwLjA1Ij48cGF0aCBkPSJNMzAgMTUgTDE1IDMwIEwzMCA0NSBMNDUgMzAgWiIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjAuNSI+PC9wYXRoPjwvc3ZnPg==')] opacity-20"></div>

      {/* Icônes flottantes technologie médicale/blockchain */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Chain className="absolute text-blue-400/20 w-32 h-32 left-1/4 top-1/4 animate-pulse" />
        <Database className="absolute text-green-400/20 w-24 h-24 right-1/4 top-1/3 animate-pulse" />
        <Key className="absolute text-yellow-400/20 w-28 h-28 left-1/3 bottom-1/4 animate-pulse" />
        <Lock className="absolute text-red-400/20 w-20 h-20 right-1/3 bottom-1/3 animate-pulse" />
        <ShieldCheck className="absolute text-purple-400/20 w-36 h-36 right-[45%] top-[10%] animate-pulse" />
      </div>

      {/* Contenu principal avec effet de flou */}
      <div className="z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 bg-medical-primary/20 backdrop-blur-md rounded-full">
            <ShieldCheck className="h-8 w-8 text-medical-primary" />
          </div>
          <div className="ml-4">
            <h1 className="text-4xl font-bold text-white">Med-Secure</h1>
            <p className="text-medical-primary/80">Blockchain Medical Records</p>
          </div>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Système sécurisé de gestion des dossiers médicaux</p>
          <p className="text-xs mt-1">Propulsé par la blockchain</p>
        </div>
      </div>
      
      {/* Ligne animée simulant une connexion blockchain */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-medical-primary to-transparent animate-pulse"></div>
    </div>
  );
};

export default Login;
