
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
import { Eye, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
import { BlockchainService, PatientRequest } from '@/services/BlockchainService';

export function PatientList() {
  const { toast } = useToast();
  const { organization } = useAuth();
  const [cryptoFormOpen, setCryptoFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRequest | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // État pour stocker les patients (données à remplacer par les données blockchain)
  const [patients, setPatients] = useState<PatientRequest[]>([]);
  const [prevPatients, setPrevPatients] = useState<Record<string, PatientRequest>>({});
  const [registeredPatients, setRegisteredPatients] = useState<any[]>([]);

  // Filtrer les patients en fonction du filtre d'organisation et de la recherche
  const filteredPatients = patients.filter(patient => {
    const matchesOrg = organizationFilter === 'all' || patient.numeroOrganisation === organizationFilter;
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.matricule.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesOrg && matchesSearch;
  });

  const fetchPatientRequests = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      // Simulation d'appel à l'API blockchain
      console.log("🔹 Récupération des requêtes patients depuis la blockchain...");
      
      // Dans un environnement réel, ceci serait remplacé par l'appel à l'API blockchain
      const mockRequests = await BlockchainService.getPatientRequests(organization?.code);
      
      // Compare with previous state to detect changes
      const newPatients = mockRequests.map(patient => {
        const prevPatient = prevPatients[patient.requestId];
        
        // Check if this is a new patient or if state has changed
        const isNew = !prevPatient;
        const hasStateChanged = prevPatient && prevPatient.etatRequest !== patient.etatRequest;
        
        // If state has changed, show a notification
        if (hasStateChanged) {
          sonnerToast({
            title: "État de requête modifié",
            description: `La requête ${patient.requestId} est passée à l'état ${
              patient.etatRequest === 'ACCEPTED' ? 'acceptée' : 
              patient.etatRequest === 'REJECTED' ? 'rejetée' : 'en attente'
            }`,
          });
        }
        
        return {
          ...patient,
          hasStateChanged,
          isNew
        };
      });
      
      // Update previous patients state for next comparison
      const newPrevPatients: Record<string, PatientRequest> = {};
      mockRequests.forEach(patient => {
        newPrevPatients[patient.requestId] = { ...patient };
      });
      
      setPrevPatients(newPrevPatients);
      setPatients(newPatients);
      
      // Récupérer les patients enregistrés depuis la base de données locale
      const storedPatients = JSON.parse(localStorage.getItem('medSecurePatientProfiles') || '{}');
      setRegisteredPatients(Object.values(storedPatients));
      
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des requêtes:", error);
      setErrorMsg("Impossible de récupérer les requêtes patients. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientRequests();
    
    // Set up a polling interval to simulate real-time updates
    const interval = setInterval(fetchPatientRequests, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [organization]);

  // Simuler des appels API
  const handleCreateCryptoMaterial = (patient: PatientRequest) => {
    // Ouvrir le formulaire de création de matériel crypto
    setSelectedPatient(patient);
    setCryptoFormOpen(true);
  };

  const handleCryptoConfirm = async (email: string, password: string) => {
    if (!selectedPatient) return;
    
    try {
      // Appel à l'API blockchain pour créer le matériel cryptographique
      const success = await BlockchainService.createPatientCryptoMaterial(
        selectedPatient.patientId,
        email,
        password
      );
      
      if (!success) {
        throw new Error("Échec de la création du matériel cryptographique");
      }
      
      // Enregistrer dans la base de données locale (localStorage) les infos complètes du patient
      const patientProfile = {
        id: selectedPatient.patientId,
        name: selectedPatient.name,
        email: email,
        ehrid: selectedPatient.ehrid,
        matricule: selectedPatient.matricule,
        organization: selectedPatient.numeroOrganisation,
        createdAt: new Date().toISOString()
      };
      
      // Stocker le profil complet du patient
      const patientProfiles = JSON.parse(localStorage.getItem('medSecurePatientProfiles') || '{}');
      patientProfiles[selectedPatient.patientId] = patientProfile;
      localStorage.setItem('medSecurePatientProfiles', JSON.stringify(patientProfiles));
      
      // Mettre à jour la liste des patients enregistrés
      setRegisteredPatients(Object.values(patientProfiles));
      
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

  // Function to get status color for both badges and cards
  const getStatusColor = (status: PatientRequest['etatRequest']) => {
    const colorMap = {
      'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'ACCEPTED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
    };
    return colorMap[status];
  };

  const getStatusText = (status: PatientRequest['etatRequest']) => {
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
            <h2 className="text-lg font-medium">Liste des requêtes de patients</h2>
            <p className="text-sm text-gray-500 mt-1">
              Les requêtes sont récupérées depuis la blockchain et leur état est géré par une entité externe
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchPatientRequests}
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
                      <TableHead>EHRID</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>État</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          Aucune requête patient ne correspond à vos critères de recherche
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => (
                        <TableRow 
                          key={patient.requestId} 
                          className={`hover:bg-gray-50 ${patient.isNew ? 'animate-fade-in' : ''}`}
                        >
                          <TableCell className="font-medium flex items-center gap-2">
                            {patient.requestId}
                            {patient.hasStateChanged && (
                              <span className="relative flex h-3 w-3 animate-pulse">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{patient.name}</TableCell>
                          <TableCell>{patient.ehrid}</TableCell>
                          <TableCell>{patient.matricule}</TableCell>
                          <TableCell>{patient.numeroOrganisation}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(patient.etatRequest)}>
                              {getStatusText(patient.etatRequest)}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            {/* Affichage du bouton Créer CryptoMatériel uniquement pour les requêtes acceptées */}
                            {patient.etatRequest === 'ACCEPTED' && (
                              <Button 
                                variant="outline"
                                className="h-8 text-xs transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                onClick={() => handleCreateCryptoMaterial(patient)}
                              >
                                Créer Crypto
                              </Button>
                            )}
                            
                            {/* Détails du patient */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Détails de la requête patient</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm text-gray-500">ID de requête:</div>
                                    <div>{patient.requestId}</div>
                                    
                                    <div className="text-sm text-gray-500">ID du patient:</div>
                                    <div>{patient.patientId}</div>
                                    
                                    <div className="text-sm text-gray-500">Nom:</div>
                                    <div>{patient.name}</div>
                                    
                                    <div className="text-sm text-gray-500">EHRID:</div>
                                    <div>{patient.ehrid}</div>
                                    
                                    <div className="text-sm text-gray-500">Matricule:</div>
                                    <div>{patient.matricule}</div>
                                    
                                    <div className="text-sm text-gray-500">Organisation:</div>
                                    <div>{patient.numeroOrganisation}</div>
                                    
                                    <div className="text-sm text-gray-500">État:</div>
                                    <div>
                                      <Badge variant="outline" className={getStatusColor(patient.etatRequest)}>
                                        {getStatusText(patient.etatRequest)}
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
                {filteredPatients.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Aucune requête patient ne correspond à vos critères de recherche
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <Card 
                      key={patient.requestId} 
                      className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
                        patient.isNew ? 'animate-fade-in' : ''
                      } ${
                        patient.hasStateChanged ? 'ring-2 ring-red-400' : ''
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {patient.name}
                            </CardTitle>
                            <CardDescription className="text-gray-700 mt-1">
                              {patient.patientId}
                            </CardDescription>
                          </div>
                          {patient.hasStateChanged && (
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
                            <span className="font-medium">{patient.requestId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">EHRID:</span>
                            <span>{patient.ehrid}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Matricule:</span>
                            <span>{patient.matricule}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Organisation:</span>
                            <span>{patient.numeroOrganisation}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">État:</span>
                            <Badge className={getStatusColor(patient.etatRequest)}>
                              {getStatusText(patient.etatRequest)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-0">
                        {patient.etatRequest === 'ACCEPTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                            onClick={() => handleCreateCryptoMaterial(patient)}
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
                              <DialogTitle>Détails de la requête patient</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-gray-500">ID de requête:</div>
                                <div>{patient.requestId}</div>
                                
                                <div className="text-sm text-gray-500">ID du patient:</div>
                                <div>{patient.patientId}</div>
                                
                                <div className="text-sm text-gray-500">Nom:</div>
                                <div>{patient.name}</div>
                                
                                <div className="text-sm text-gray-500">EHRID:</div>
                                <div>{patient.ehrid}</div>
                                
                                <div className="text-sm text-gray-500">Matricule:</div>
                                <div>{patient.matricule}</div>
                                
                                <div className="text-sm text-gray-500">Organisation:</div>
                                <div>{patient.numeroOrganisation}</div>
                                
                                <div className="text-sm text-gray-500">État:</div>
                                <div>
                                  <Badge variant="outline" className={getStatusColor(patient.etatRequest)}>
                                    {getStatusText(patient.etatRequest)}
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
      
      {/* Liste des patients enregistrés dans la base de données */}
      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Patients enregistrés dans la base de données</h2>
          <p className="text-sm text-gray-500 mt-1">
            Liste des patients dont le matériel cryptographique a été créé
          </p>
        </div>
        
        {registeredPatients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun patient n'a encore été enregistré dans la base de données
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredPatients.map((patient) => (
              <Card key={patient.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="bg-blue-50 pb-2">
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <CardDescription className="text-gray-700">
                    Patient enregistré
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium">{patient.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">EHRID:</span>
                      <span>{patient.ehrid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Matricule:</span>
                      <span>{patient.matricule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Organisation:</span>
                      <span>{patient.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date de création:</span>
                      <span>{new Date(patient.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Formulaire de création de matériel cryptographique */}
      {selectedPatient && (
        <CryptoMaterialForm
          open={cryptoFormOpen}
          onClose={() => setCryptoFormOpen(false)}
          onConfirm={handleCryptoConfirm}
          entityName={selectedPatient.name}
          entityId={selectedPatient.patientId}
          entityRole="patient"
          entityOrg={selectedPatient.numeroOrganisation as 'HCA' | 'HQA'}
        />
      )}
    </div>
  );
}
