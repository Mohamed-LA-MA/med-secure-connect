import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, TrashIcon, Check, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { CryptoMaterialForm } from '@/components/Shared/CryptoMaterialForm';

// Types
interface HealthActor {
  id: string;
  requestId: string;
  healthActorId: string;
  nom: string;
  prenom: string;
  matriculeActor: string;
  etatRequest: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  numeroOrg: string;
  role: 'MEDECIN' | 'LABORATOIRE' | 'CENTRE_IMAGERIE' | 'ASSURANCE';
}

export function HealthActorList() {
  const { toast } = useToast();
  const [cryptoFormOpen, setCryptoFormOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<HealthActor | null>(null);
  
  // État pour stocker les acteurs de santé (données fictives pour démo)
  const [healthActors, setHealthActors] = useState<HealthActor[]>([
    {
      id: '1',
      requestId: 'REQ101',
      healthActorId: 'HA001',
      nom: 'Dubois',
      prenom: 'Claire',
      matriculeActor: 'MED001',
      etatRequest: 'PENDING',
      numeroOrg: 'HCA',
      role: 'MEDECIN',
    },
    {
      id: '2',
      requestId: 'REQ102',
      healthActorId: 'HA002',
      nom: 'Labo Central',
      prenom: '',
      matriculeActor: 'LAB001',
      etatRequest: 'ACCEPTED',
      numeroOrg: 'HCA',
      role: 'LABORATOIRE',
    },
    {
      id: '3',
      requestId: 'REQ103',
      healthActorId: 'HA003',
      nom: 'Centre Imagerie',
      prenom: 'Paris',
      matriculeActor: 'IMG001',
      etatRequest: 'REJECTED',
      numeroOrg: 'HQA',
      role: 'CENTRE_IMAGERIE',
    },
    {
      id: '4',
      requestId: 'REQ104',
      healthActorId: 'HA004',
      nom: 'Assurance Santé',
      prenom: 'Plus',
      matriculeActor: 'ASS001',
      etatRequest: 'PENDING',
      numeroOrg: 'HQA',
      role: 'ASSURANCE',
    },
  ]);

  // Simuler des appels API
  const handleAcceptRequest = (actorId: string) => {
    setHealthActors(
      healthActors.map(actor => 
        actor.id === actorId 
          ? { ...actor, etatRequest: 'ACCEPTED' as const } 
          : actor
      )
    );
    toast({
      title: "Demande acceptée",
      description: "La demande a été acceptée avec succès",
    });
  };

  const handleRejectRequest = (actorId: string) => {
    setHealthActors(
      healthActors.map(actor => 
        actor.id === actorId 
          ? { ...actor, etatRequest: 'REJECTED' as const } 
          : actor
      )
    );
    toast({
      title: "Demande rejetée",
      description: "La demande a été rejetée",
    });
  };

  const handleCreateCryptoMaterial = (actor: HealthActor) => {
    // Ouvrir le formulaire de création de matériel crypto
    setSelectedActor(actor);
    setCryptoFormOpen(true);
  };

  const handleCryptoConfirm = async (email: string, password: string) => {
    // Simulation d'un appel API pour créer le matériel cryptographique
    // et enregistrer les identifiants
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation de délai
    
    toast({
      title: "Succès",
      description: "Matériel cryptographique créé et identifiants enregistrés",
      variant: "default",
    });
    
    console.log("Identifiants créés:", { 
      email, 
      password, 
      actorId: selectedActor?.healthActorId,
      role: selectedActor?.role
    });
    
    // Ici vous feriez un appel API réel pour enregistrer les identifiants
    // axios.post('/api/crypto-material', { email, password, actorId: selectedActor?.healthActorId });
  };

  const handleDeleteRequest = (actorId: string) => {
    // Simulation de suppression
    setHealthActors(healthActors.filter(actor => actor.id !== actorId));
    toast({
      title: "Demande supprimée",
      description: "La demande a été supprimée avec succès",
    });
  };

  // Fonction pour convertir le rôle en format lisible
  const formatRole = (role: HealthActor['role']) => {
    const roleMap = {
      'MEDECIN': 'Médecin',
      'LABORATOIRE': 'Laboratoire',
      'CENTRE_IMAGERIE': 'Centre d\'imagerie',
      'ASSURANCE': 'Assurance',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="bg-white rounded-md shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Liste des acteurs de santé</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Matricule</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {healthActors.map((actor) => (
              <TableRow key={actor.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{actor.healthActorId}</TableCell>
                <TableCell>
                  {actor.prenom ? `${actor.nom} ${actor.prenom}` : actor.nom}
                </TableCell>
                <TableCell>{actor.matriculeActor}</TableCell>
                <TableCell>{formatRole(actor.role)}</TableCell>
                <TableCell>{actor.numeroOrg}</TableCell>
                <TableCell>
                  {actor.etatRequest === 'PENDING' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      En attente
                    </Badge>
                  )}
                  {actor.etatRequest === 'ACCEPTED' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Acceptée
                    </Badge>
                  )}
                  {actor.etatRequest === 'REJECTED' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                      Rejetée
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  {/* Affichage conditionnel des boutons selon l'état */}
                  {actor.etatRequest === 'PENDING' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleAcceptRequest(actor.id)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRejectRequest(actor.id)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  {actor.etatRequest === 'ACCEPTED' && (
                    <Button 
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleCreateCryptoMaterial(actor)}
                    >
                      Créer Crypto
                    </Button>
                  )}
                  
                  {actor.etatRequest === 'REJECTED' && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteRequest(actor.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                  
                  {/* Détails de l'acteur */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Détails de l'acteur de santé</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-500">ID de requête:</div>
                          <div>{actor.requestId}</div>
                          
                          <div className="text-sm text-gray-500">ID de l'acteur:</div>
                          <div>{actor.healthActorId}</div>
                          
                          <div className="text-sm text-gray-500">Nom:</div>
                          <div>{actor.nom}</div>
                          
                          <div className="text-sm text-gray-500">Prénom:</div>
                          <div>{actor.prenom || "-"}</div>
                          
                          <div className="text-sm text-gray-500">Matricule:</div>
                          <div>{actor.matriculeActor}</div>
                          
                          <div className="text-sm text-gray-500">Rôle:</div>
                          <div>{formatRole(actor.role)}</div>
                          
                          <div className="text-sm text-gray-500">Organisation:</div>
                          <div>{actor.numeroOrg}</div>
                          
                          <div className="text-sm text-gray-500">État:</div>
                          <div>
                            {actor.etatRequest === 'PENDING' && "En attente"}
                            {actor.etatRequest === 'ACCEPTED' && "Acceptée"}
                            {actor.etatRequest === 'REJECTED' && "Rejetée"}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Formulaire de création de matériel cryptographique */}
      {selectedActor && (
        <CryptoMaterialForm
          open={cryptoFormOpen}
          onClose={() => setCryptoFormOpen(false)}
          onConfirm={handleCryptoConfirm}
          entityName={selectedActor.prenom ? `${selectedActor.nom} ${selectedActor.prenom}` : selectedActor.nom}
          entityId={selectedActor.healthActorId}
        />
      )}
    </div>
  );
}
