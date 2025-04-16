
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState<'HCA' | 'HQA'>('HCA');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-medical-primary text-center">Med-Secure Connect</CardTitle>
        <CardDescription className="text-center">
          Connectez-vous à votre espace pour gérer les dossiers médicaux électroniques
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@organisation.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization">Organisation</Label>
            <Select
              value={organization}
              onValueChange={(value) => setOrganization(value as 'HCA' | 'HQA')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une organisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HCA">HCA</SelectItem>
                <SelectItem value="HQA">HQA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full bg-medical-primary hover:bg-medical-dark" disabled={isLoading}>
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
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-xs text-center text-muted-foreground">
          Admin par défaut pour HCA: admin@HCA.com / admin
        </div>
        <div className="text-xs text-center text-muted-foreground">
          Admin par défaut pour HQA: admin@HQA.com / admin
        </div>
      </CardFooter>
    </Card>
  );
}
