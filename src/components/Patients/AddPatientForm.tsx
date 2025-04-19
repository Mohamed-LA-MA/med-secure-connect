
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BlockchainService, API_CONFIG } from '@/services/BlockchainService';
import axios from 'axios';

export function AddPatientForm() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // États du formulaire
  const [patientData, setPatientData] = useState({
    name: '',
    ehrid: '',
    matricule: '',
    numeroOrganisation: organization?.code || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Obtenir le token d'authentification
      const authToken = await BlockchainService.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }
      
      // Générer des IDs uniques
      const requestId = `REQ_PAT_${Date.now()}`;
      const patientId = `PAT_${Date.now()}`;
      
      // Préparer les arguments pour l'appel API
      const requestData = {
        fcn: "RequestPatient",
        args: [
          "adminUser", // requesterID (utilisez un ID approprié)
          requestId,
          patientId,
          patientData.name,
          patientData.ehrid,
          patientData.matricule,
          patientData.numeroOrganisation
        ],
        peers: [`peer0.${patientData.numeroOrganisation}.example.com`]
      };
      
      // Envoyer la requête
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/${API_CONFIG.CHAINCODE_HEALTH_PATIENT}`,
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
          title: "Patient ajouté",
          description: "La demande d'ajout de patient a été envoyée avec succès",
        });
        
        // Réinitialiser le formulaire
        setPatientData({
          name: '',
          ehrid: '',
          matricule: '',
          numeroOrganisation: organization?.code || '',
        });
      } else {
        throw new Error(response.data?.message || "Échec de l'ajout du patient");
      }
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'ajout du patient",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un nouveau patient</CardTitle>
        <CardDescription>
          Créez une nouvelle demande d'ajout de patient dans le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              name="name"
              placeholder="Jean Dupont"
              value={patientData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ehrid">EHRID</Label>
            <Input
              id="ehrid"
              name="ehrid"
              placeholder="EHR000"
              value={patientData.ehrid}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule</Label>
            <Input
              id="matricule"
              name="matricule"
              placeholder="MAT000"
              value={patientData.matricule}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numeroOrganisation">Organisation</Label>
            <Input
              id="numeroOrganisation"
              name="numeroOrganisation"
              value={patientData.numeroOrganisation}
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
