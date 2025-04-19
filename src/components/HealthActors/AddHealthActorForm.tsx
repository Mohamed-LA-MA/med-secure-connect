
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BlockchainService, API_CONFIG } from '@/services/BlockchainService';
import axios from 'axios';

export function AddHealthActorForm() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // États du formulaire
  const [actorData, setActorData] = useState({
    nom: '',
    prenom: '',
    matriculeActor: '',
    role: '',
    numeroOrg: organization?.code || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setActorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actorData.role) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Obtenir le token d'authentification
      const authToken = await BlockchainService.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }
      
      // Générer des IDs uniques
      const requestId = `REQ_HA_${Date.now()}`;
      const healthActorId = `HA_${Date.now()}`;
      
      // Préparer les arguments pour l'appel API
      const requestData = {
        fcn: "RequestHealthActor",
        args: [
          "adminUser", // requesterID (utilisez un ID approprié)
          requestId,
          healthActorId,
          actorData.nom,
          actorData.prenom,
          actorData.matriculeActor,
          actorData.numeroOrg,
          actorData.role
        ],
        peers: [`peer0.${actorData.numeroOrg}.example.com`]
      };
      
      // Envoyer la requête
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/${API_CONFIG.CHAINCODE_HEALTH_ACTOR}`,
        requestData,
        {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Vérifier la réponse
      if (response.data && response.data.success) {
        toast({
          title: "Acteur de santé ajouté",
          description: "La demande d'ajout d'acteur de santé a été envoyée avec succès",
        });
        
        // Réinitialiser le formulaire
        setActorData({
          nom: '',
          prenom: '',
          matriculeActor: '',
          role: '',
          numeroOrg: organization?.code || '',
        });
      } else {
        throw new Error(response.data?.message || "Échec de l'ajout de l'acteur de santé");
      }
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'ajout de l'acteur de santé",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un nouvel acteur de santé</CardTitle>
        <CardDescription>
          Créez une nouvelle demande d'ajout d'acteur de santé dans le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              name="nom"
              placeholder="Dupont"
              value={actorData.nom}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom (optionnel pour les institutions)</Label>
            <Input
              id="prenom"
              name="prenom"
              placeholder="Marie"
              value={actorData.prenom}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="matriculeActor">Matricule</Label>
            <Input
              id="matriculeActor"
              name="matriculeActor"
              placeholder="MED000"
              value={actorData.matriculeActor}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={actorData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDECIN">Médecin</SelectItem>
                <SelectItem value="LABORATOIRE">Laboratoire</SelectItem>
                <SelectItem value="CENTRE_IMAGERIE">Centre d'imagerie</SelectItem>
                <SelectItem value="ASSURANCE">Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numeroOrg">Organisation</Label>
            <Input
              id="numeroOrg"
              name="numeroOrg"
              value={actorData.numeroOrg}
              onChange={handleChange}
              disabled
            />
            <p className="text-xs text-gray-500">
              L'organisation est définie automatiquement selon votre compte ({organization?.name})
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer la demande"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
