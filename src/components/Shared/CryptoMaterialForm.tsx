
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { addNewUser } from '@/contexts/AuthContext';

interface CryptoMaterialFormProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (email: string, password: string) => void;
  entityName: string;
  entityId: string;
  entityRole?: 'patient' | 'healthActor';
  entityOrg?: 'HCA' | 'HQA';
}

export function CryptoMaterialForm({ 
  open, 
  onClose, 
  onConfirm,
  entityName,
  entityId,
  entityRole = 'patient',
  entityOrg = 'HCA'
}: CryptoMaterialFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simuler l'enregistrement dans la blockchain
      console.log("Enregistrement dans la blockchain:", {
        entityId,
        entityName,
        entityRole,
        entityOrg,
        timestamp: new Date().toISOString()
      });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulation délai blockchain
      
      // Ajouter l'utilisateur dans le système d'authentification
      addNewUser(email, password, {
        id: entityId,
        email: email,
        name: entityName,
        role: entityRole,
        organization: entityOrg,
      });
      
      // Simuler l'enregistrement dans la base de données
      const profileData = {
        id: entityId,
        name: entityName,
        email: email,
        role: entityRole,
        organization: entityOrg,
        createdAt: new Date().toISOString()
      };
      
      // Sauvegarder les données du profil dans le localStorage
      const profilesKey = entityRole === 'patient' ? 'medSecurePatientProfiles' : 'medSecureHealthActorProfiles';
      const profiles = JSON.parse(localStorage.getItem(profilesKey) || '{}');
      profiles[entityId] = profileData;
      localStorage.setItem(profilesKey, JSON.stringify(profiles));
      
      // Appel de la fonction de confirmation fournie par le parent
      await onConfirm(email, password);
      
      toast({
        title: "Succès",
        description: "Matériel cryptographique créé avec succès. L'utilisateur peut maintenant se connecter.",
      });
      
      // Réinitialiser le formulaire et fermer
      setEmail('');
      setPassword('');
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer le matériel cryptographique</DialogTitle>
          <DialogDescription>
            Définissez les identifiants de connexion pour {entityName} (ID: {entityId})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez l'adresse email"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Créez un mot de passe"
              required
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
