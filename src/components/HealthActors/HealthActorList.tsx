
import { useState, useEffect } from 'react';
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
import { Eye, TrashIcon, Check, X, Bell } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { CryptoMaterialForm } from '@/components/Shared/CryptoMaterialForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast as sonnerToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

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
  hasStateChanged?: boolean; // Track if state has changed
  isNew?: boolean; // Track if this is a new entry
}

export function HealthActorList() {
  const { toast } = useToast();
  const { organization } = useAuth();
  const [cryptoFormOpen, setCryptoFormOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<HealthActor | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // État pour stocker les acteurs de santé (données fictives pour démo)
  const [healthActors, setHealthActors] = useState<HealthActor[]>([]);
  const [prevActors, setPrevActors] = useState<Record<string, HealthActor>>({});
  
  useEffect(() => {
    // Simulate fetching data from the blockchain API
    const fetchHealthActors = async () => {
      // Mock data - in a real app, this would be an API call to blockchain
      const mockActors = [
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
      ] as HealthActor[];

      // Compare with previous state to detect changes
      const newActors = mockActors.map(actor => {
        const prevActor = prevActors[actor.id];
        
        // Check if this is a new actor or if state has changed
        const isNew = !prevActor;
        const hasStateChanged = prevActor && prevActor.etatRequest !== actor.etatRequest;
        
        // If state has changed, show a notification
        if (hasStateChanged) {
          sonnerToast({
            title: "État de requête modifié",
            description: `La requête ${actor.requestId} est passée à l'état ${
              actor.etatRequest === 'ACCEPTED' ? 'acceptée' : 
              actor.etatRequest === 'REJECTED' ? 'rejetée' : 'en attente'
            }`,
          });
        }
        
        return {
          ...actor,
          hasStateChanged,
          isNew
        };
      });
      
      setHealthActors(newActors);
      
      // Update previous actors state for next comparison
      const newPrevActors: Record<string, HealthActor> = {};
      mockActors.forEach(actor => {
        newPrevActors[actor.id] = { ...actor };
      });
      setPrevActors(newPrevActors);
    };

    fetchHealthActors();
    
    // Set up a polling interval to simulate real-time updates
    const interval = setInterval(fetchHealthActors, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleCreateCryptoMaterial = (actor: HealthActor) => {
    // Ouvrir le formulaire de création de matériel crypto
    setSelectedActor(actor);
    setCryptoFormOpen(true);
  };

  const handleCryptoConfirm = async (email: string, password: string) => {
    if (!selectedActor) return;
    
    // Simuler l'enregistrement du matériel cryptographique dans la blockchain
    console.log("Enregistrement du matériel cryptographique dans la blockchain:", {
      healthActorId: selectedActor.healthActorId,
      email: email,
      timestamp: new Date().toISOString()
    });
    
    // Simulation d'un appel API pour créer le matériel cryptographique
    // et enregistrer les identifiants
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation de délai
    
    // Enregistrer dans la base de données locale (localStorage) les infos complètes de l'acteur de santé
    const actorName = selectedActor.prenom 
      ? `${selectedActor.nom} ${selectedActor.prenom}`
      : selectedActor.nom;
      
    const actorProfile = {
      id: selectedActor.healthActorId,
      name: actorName,
      email: email,
      matricule: selectedActor.matriculeActor,
      organization: selectedActor.numeroOrg,
      role: selectedActor.role,
      createdAt: new Date().toISOString()
    };
    
    // Stocker le profil complet de l'acteur de santé
    const actorProfiles = JSON.parse(localStorage.getItem('medSecureHealthActorProfiles') || '{}');
    actorProfiles[selectedActor.healthActorId] = actorProfile;
    localStorage.setItem('medSecureHealthActorProfiles', JSON.stringify(actorProfiles));
    
    toast({
      title: "Succès",
      description: "Matériel cryptographique créé et identifiants enregistrés",
      variant: "default",
    });
    
    // Mettre à jour l'état local pour indiquer que le matériel a été créé
    setHealthActors(prevState => 
      prevState.map(actor => 
        actor.id === selectedActor.id 
          ? { ...actor, hasCryptoMaterial: true }
          : actor
      )
    );
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

  // Function to get appropriate color based on role
  const getRoleColor = (role: HealthActor['role']) => {
    const colorMap = {
      'MEDECIN': 'bg-blue-50 text-blue-700',
      'LABORATOIRE': 'bg-purple-50 text-purple-700',
      'CENTRE_IMAGERIE': 'bg-indigo-50 text-indigo-700',
      'ASSURANCE': 'bg-emerald-50 text-emerald-700',
    };
    return colorMap[role] || 'bg-gray-50 text-gray-700';
  };

  // Function to get status color for both badges and cards
  const getStatusColor = (status: HealthActor['etatRequest']) => {
    const colorMap = {
      'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'ACCEPTED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
    };
    return colorMap[status];
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Liste des requêtes d'acteurs de santé</h2>
            <p className="text-sm text-gray-500 mt-1">
              Les requêtes sont récupérées depuis la blockchain et leur état est géré par une entité externe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="transition-all"
            >
              Tableau
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="transition-all"
            >
              Cartes
            </Button>
          </div>
        </div>
        
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID Requête</TableHead>
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
                  <TableRow 
                    key={actor.id} 
                    className={`hover:bg-gray-50 ${actor.isNew ? 'animate-fade-in' : ''}`}
                  >
                    <TableCell className="font-medium flex items-center gap-2">
                      {actor.requestId}
                      {actor.hasStateChanged && (
                        <span className="relative flex h-3 w-3 animate-pulse">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {actor.prenom ? `${actor.nom} ${actor.prenom}` : actor.nom}
                    </TableCell>
                    <TableCell>{actor.matriculeActor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getRoleColor(actor.role)}`}>
                        {formatRole(actor.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{actor.numeroOrg}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(actor.etatRequest)}>
                        {actor.etatRequest === 'PENDING' && "En attente"}
                        {actor.etatRequest === 'ACCEPTED' && "Acceptée"}
                        {actor.etatRequest === 'REJECTED' && "Rejetée"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {/* Afficher uniquement le bouton de création de crypto pour les demandes acceptées */}
                      {actor.etatRequest === 'ACCEPTED' && (
                        <Button 
                          variant="outline"
                          className="h-8 text-xs transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                          onClick={() => handleCreateCryptoMaterial(actor)}
                        >
                          Créer Crypto
                        </Button>
                      )}
                      
                      {/* Détails de l'acteur */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Détails de la requête d'acteur de santé</DialogTitle>
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
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthActors.map((actor) => (
              <Card 
                key={actor.id} 
                className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
                  actor.isNew ? 'animate-fade-in' : ''
                } ${
                  actor.hasStateChanged ? 'ring-2 ring-red-400' : ''
                }`}
              >
                <CardHeader className={`${getRoleColor(actor.role)} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {actor.prenom ? `${actor.nom} ${actor.prenom}` : actor.nom}
                      </CardTitle>
                      <CardDescription className="text-gray-700 mt-1">
                        {formatRole(actor.role)}
                      </CardDescription>
                    </div>
                    {actor.hasStateChanged && (
                      <span className="relative flex h-3 w-3 animate-pulse">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Requête:</span>
                      <span className="font-medium">{actor.requestId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Matricule:</span>
                      <span>{actor.matriculeActor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Organisation:</span>
                      <span>{actor.numeroOrg}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">État:</span>
                      <Badge className={getStatusColor(actor.etatRequest)}>
                        {actor.etatRequest === 'PENDING' && "En attente"}
                        {actor.etatRequest === 'ACCEPTED' && "Acceptée"}
                        {actor.etatRequest === 'REJECTED' && "Rejetée"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  {actor.etatRequest === 'ACCEPTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      onClick={() => handleCreateCryptoMaterial(actor)}
                    >
                      Créer Crypto
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Détails de la requête d'acteur de santé</DialogTitle>
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
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Formulaire de création de matériel cryptographique */}
      {selectedActor && (
        <CryptoMaterialForm
          open={cryptoFormOpen}
          onClose={() => setCryptoFormOpen(false)}
          onConfirm={handleCryptoConfirm}
          entityName={selectedActor.prenom ? `${selectedActor.nom} ${selectedActor.prenom}` : selectedActor.nom}
          entityId={selectedActor.healthActorId}
          entityRole="healthActor"
          entityOrg={selectedActor.numeroOrg as 'HCA' | 'HQA'}
        />
      )}
    </div>
  );
}
