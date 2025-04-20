
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

// Mappage des organisations pour le backend
const orgMapping = {
  HCA: { orgId: "org2", peer: "peer0.org2.example.com", admin: "hospitalAdmin1" },
  HQA: { orgId: "org3", peer: "peer0.org3.example.com", admin: "hospitalAdmin2" }
};

export function AddPatientForm() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // États du formulaire
  const [patientData, setPatientData] = useState({
    patientID: '',
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

  const generateRequestId = () => {
    return `REQ_PAT_${Date.now()}`;
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
      
      // Obtenir la configuration de l'organisation
      const orgConfig = orgMapping[patientData.numeroOrganisation as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Générer un ID de requête unique
      const requestId = generateRequestId();
      
      // Préparer les arguments pour l'appel API
      const requestData = {
        fcn: "RequestPatient",
        args: [
          orgConfig.admin, // requesterID dynamique
          requestId,
          patientData.patientID,
          patientData.name,
          patientData.ehrid,
          patientData.matricule,
          orgConfig.orgId  // org2/org3 selon l'organisation
        ],
        peers: [`peer0.${orgConfig.orgId}.example.com`]
      };
      
      console.log("📤 Données envoyées:", requestData);
      
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
        
        // Créer les identifiants utilisateur
        try {
          await BlockchainService.createPatientCredentials(
            patientData.patientID,
            patientData.numeroOrganisation
          );
          
          toast({
            title: "Identifiants créés",
            description: "Les identifiants du patient ont été créés avec succès",
          });
        } catch (credError) {
          console.error("⚠️ Erreur lors de la création des identifiants:", credError);
          toast({
            title: "Avertissement",
            description: "Patient ajouté mais erreur lors de la création des identifiants",
            variant: "destructive",
          });
        }
        
        // Réinitialiser le formulaire
        setPatientData({
          patientID: '',
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
            <Label htmlFor="patientID">Patient ID</Label>
            <Input
              id="patientID"
              name="patientID"
              placeholder="PAT000"
              value={patientData.patientID}
              onChange={handleChange}
              required
            />
          </div>
          
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
            <Label htmlFor="ehrid">EHRID (nombre)</Label>
            <Input
              id="ehrid"
              name="ehrid"
              type="number"
              placeholder="123456"
              value={patientData.ehrid}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule (nombre)</Label>
            <Input
              id="matricule"
              name="matricule"
              type="number"
              placeholder="987654"
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
