
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
import { Eye, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockchainService, HealthActorRequest } from '@/services/BlockchainService';

export function HealthActorList() {
  const { toast } = useToast();
  const { organization } = useAuth();
  const [cryptoFormOpen, setCryptoFormOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<HealthActorRequest | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // État pour stocker les acteurs de santé
  const [healthActors, setHealthActors] = useState<HealthActorRequest[]>([]);
  const [prevActors, setPrevActors] = useState<Record<string, HealthActorRequest>>({});
  const [registeredActors, setRegisteredActors] = useState<any[]>([]);

  // Filtrer les acteurs en fonction des filtres et de la recherche
  const filteredActors = healthActors.filter(actor => {
    const matchesOrg = organizationFilter === 'all' || actor.numeroOrg === organizationFilter;
    const matchesRole = roleFilter === 'all' || actor.role === roleFilter;
    const matchesSearch = 
      (actor.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (actor.prenom && actor.prenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      actor.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.matriculeActor.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesOrg && matchesRole && matchesSearch;
  });

  const fetchHealthActorRequests = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      // Simulation d'appel à l'API blockchain
      console.log("🔹 Récupération des requêtes d'acteurs de santé depuis la blockchain...");
      
      // Dans un environnement réel, ceci serait remplacé par l'appel à l'API blockchain
      const mockRequests = await BlockchainService.getHealthActorRequests(organization?.code);
      
      // Compare with previous state to detect changes
      const newActors = mockRequests.map(actor => {
        const prevActor = prevActors[actor.requestId];
        
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
      
      // Update previous actors state for next comparison
      const newPrevActors: Record<string, HealthActorRequest> = {};
      mockRequests.forEach(actor => {
        newPrevActors[actor.requestId] = { ...actor };
      });
      
      setPrevActors(newPrevActors);
      setHealthActors(newActors);
      
      // Récupérer les acteurs enregistrés depuis la base de données locale
      const storedActors = JSON.parse(localStorage.getItem('medSecureHealthActorProfiles') || '{}');
      setRegisteredActors(Object.values(storedActors));
      
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des requêtes:", error);
      setErrorMsg("Impossible de récupérer les requêtes d'acteurs de santé. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthActorRequests();
    
    // Set up a polling interval to simulate real-time updates
    const interval = setInterval(fetchHealthActorRequests, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [organization]);

  const handleCreateCryptoMaterial = (actor: HealthActorRequest) => {
    // Ouvrir le formulaire de création de matériel crypto
    setSelectedActor(actor);
    setCryptoFormOpen(true);
  };

  const handleCryptoConfirm = async (email: string, password: string) => {
    if (!selectedActor) return;
    
    try {
      // Appel à l'API blockchain pour créer le matériel cryptographique
      const success = await BlockchainService.createHealthActorCryptoMaterial(
        selectedActor.healthActorId,
        email,
        password
      );
      
      if (!success) {
        throw new Error("Échec de la création du matériel cryptographique");
      }
      
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
      
      // Mettre à jour la liste des acteurs enregistrés
      setRegisteredActors(Object.values(actorProfiles));
      
      toast({
        title: "Succès",
        description: "Matériel cryptographique créé et identifiants enregistrés",
        variant: "default",
      });
      
      // Fermer le formulaire
      setCryptoFormOpen(false);
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Fonction pour convertir le rôle en format lisible
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'MEDECIN': 'Médecin',
      'LABORATOIRE': 'Laboratoire',
      'CENTRE_IMAGERIE': 'Centre d\'imagerie',
      'ASSURANCE': 'Assurance',
    };
    return roleMap[role] || role;
  };

  // Function to get appropriate color based on role
  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'MEDECIN': 'bg-blue-50 text-blue-700',
      'LABORATOIRE': 'bg-purple-50 text-purple-700',
      'CENTRE_IMAGERIE': 'bg-indigo-50 text-indigo-700',
      'ASSURANCE': 'bg-emerald-50 text-emerald-700',
    };
    return colorMap[role] || 'bg-gray-50 text-gray-700';
  };

  // Function to get status color for both badges and cards
  const getStatusColor = (status: HealthActorRequest['etatRequest']) => {
    const colorMap = {
      'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'ACCEPTED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
    };
    return colorMap[status];
  };

  const getStatusText = (status: HealthActorRequest['etatRequest']) => {
    const statusMap = {
      'PENDING': 'En attente',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Rejetée',
    };
    return statusMap[status];
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
              variant="outline" 
              size="sm" 
              onClick={fetchHealthActorRequests}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
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
        
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="sm:w-64">
            <Select
              value={organizationFilter}
              onValueChange={setOrganizationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par organisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les organisations</SelectItem>
                <SelectItem value="HCA">Hôpital HCA (org2)</SelectItem>
                <SelectItem value="HQA">Hôpital HQA (org3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:w-64">
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="MEDECIN">Médecin</SelectItem>
                <SelectItem value="LABORATOIRE">Laboratoire</SelectItem>
                <SelectItem value="CENTRE_IMAGERIE">Centre d'imagerie</SelectItem>
                <SelectItem value="ASSURANCE">Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{errorMsg}</span>
          </div>
        )}
        
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4 items-center animate-pulse">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
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
                    {filteredActors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          Aucune requête d'acteur de santé ne correspond à vos critères de recherche
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActors.map((actor) => (
                        <TableRow 
                          key={actor.requestId} 
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
                              {getStatusText(actor.etatRequest)}
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
                                      <Badge variant="outline" className={getStatusColor(actor.etatRequest)}>
                                        {getStatusText(actor.etatRequest)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActors.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Aucune requête d'acteur de santé ne correspond à vos critères de recherche
                  </div>
                ) : (
                  filteredActors.map((actor) => (
                    <Card 
                      key={actor.requestId} 
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
                              {getStatusText(actor.etatRequest)}
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
                                  <Badge variant="outline" className={getStatusColor(actor.etatRequest)}>
                                    {getStatusText(actor.etatRequest)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Liste des acteurs de santé enregistrés dans la base de données */}
      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Acteurs de santé enregistrés dans la base de données</h2>
          <p className="text-sm text-gray-500 mt-1">
            Liste des acteurs dont le matériel cryptographique a été créé
          </p>
        </div>
        
        {registeredActors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun acteur de santé n'a encore été enregistré dans la base de données
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredActors.map((actor) => (
              <Card key={actor.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className={`${getRoleColor(actor.role)} pb-2`}>
                  <CardTitle className="text-lg">{actor.name}</CardTitle>
                  <CardDescription className="text-gray-700">
                    {formatRole(actor.role)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium">{actor.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{actor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Matricule:</span>
                      <span>{actor.matricule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Organisation:</span>
                      <span>{actor.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date de création:</span>
                      <span>{new Date(actor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
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
