
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, User, Building, ShieldCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState<'HCA' | 'HQA'>('HCA');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Tentative de connexion avec:", { email, organization });
      const success = await login(email, password, organization);
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue sur la plateforme ${organization}`,
          variant: "default",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Email, mot de passe ou organisation incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="backdrop-blur-lg bg-white/5 rounded-xl border border-white/10 shadow-xl">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white flex items-center">
              <User className="mr-2 h-4 w-4" />
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="exemple@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-medical-primary"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-medical-primary pr-10"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 
                  <EyeOff className="h-4 w-4 text-white/70 hover:text-white" /> : 
                  <Eye className="h-4 w-4 text-white/70 hover:text-white" />
                }
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-white flex items-center">
              <Building className="mr-2 h-4 w-4" />
              Organisation
            </Label>
            <Select
              value={organization}
              onValueChange={(value) => setOrganization(value as 'HCA' | 'HQA')}
            >
              <SelectTrigger className="bg-white/10 border-white/10 text-white focus:border-medical-primary">
                <SelectValue placeholder="Sélectionnez une organisation" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="HCA" className="focus:bg-medical-primary/20">Hôpital HCA</SelectItem>
                <SelectItem value="HQA" className="focus:bg-medical-primary/20">Hôpital HQA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-medical-primary hover:bg-medical-dark transition-all duration-300 focus:ring-2 focus:ring-medical-primary focus:ring-offset-2 focus:ring-offset-gray-900" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="p-4 border-t border-white/10 bg-white/5 text-center space-y-2 rounded-b-xl">
        <div className="text-xs text-white/60">
          Admin par défaut pour HCA: <span className="font-mono">admin@HCA.com / admin</span>
        </div>
        <div className="text-xs text-white/60">
          Admin par défaut pour HQA: <span className="font-mono">admin@HQA.com / admin</span>
        </div>
      </div>
    </div>
  );
}
