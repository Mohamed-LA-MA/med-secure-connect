
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

// Types
interface Patient {
  id: string;
  requestId: string;
  patientId: string;
  name: string;
  etatRequest: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  ehrid: string;
  matricule: string;
  numeroOrganisation: string;
  hasStateChanged?: boolean; // Track if state has changed
  isNew?: boolean; // Track if this is a new entry
}

export function PatientList() {
  const { toast } = useToast();
  const { organization } = useAuth();
  const [cryptoFormOpen, setCryptoFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // État pour stocker les patients (données fictives pour démo)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prevPatients, setPrevPatients] = useState<Record<string, Patient>>({});

  useEffect(() => {
    // Simulate fetching data from the blockchain API
    const fetchPatients = async () => {
      // Mock data - in a real app, this would be an API call to blockchain
      const mockPatients = [
        {
          id: '1',
          requestId: 'REQ001',
          patientId: 'PAT001',
          name: 'Jean Dupont',
          etatRequest: 'PENDING',
          ehrid: 'EHR001',
          matricule: 'MAT001',
          numeroOrganisation: 'HCA',
        },
        {
          id: '2',
          requestId: 'REQ002',
          patientId: 'PAT002',
          name: 'Marie Martin',
          etatRequest: 'ACCEPTED',
          ehrid: 'EHR002',
          matricule: 'MAT002',
          numeroOrganisation: 'HCA',
        },
        {
          id: '3',
          requestId: 'REQ003',
          patientId: 'PAT003',
          name: 'Pierre Durand',
          etatRequest: 'REJECTED',
          ehrid: 'EHR003',
          matricule: 'MAT003',
          numeroOrganisation: 'HQA',
        },
        {
          id: '4',
          requestId: 'REQ004',
          patientId: 'PAT004',
          name: 'Sophie Lefebvre',
          etatRequest: 'PENDING',
          ehrid: 'EHR004',
          matricule: 'MAT004',
          numeroOrganisation: 'HQA',
        },
      ] as Patient[];

      // Compare with previous state to detect changes
      const newPatients = mockPatients.map(patient => {
        const prevPatient = prevPatients[patient.id];
        
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
      
      setPatients(newPatients);
      
      // Update previous patients state for next comparison
      const newPrevPatients: Record<string, Patient> = {};
      mockPatients.forEach(patient => {
        newPrevPatients[patient.id] = { ...patient };
      });
      setPrevPatients(newPrevPatients);
    };

    fetchPatients();
    
    // Set up a polling interval to simulate real-time updates
    const interval = setInterval(fetchPatients, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Simuler des appels API
  const handleCreateCryptoMaterial = (patient: Patient) => {
    // Ouvrir le formulaire de création de matériel crypto
    setSelectedPatient(patient);
    setCryptoFormOpen(true);
  };

  const handleCryptoConfirm = async (email: string, password: string) => {
    if (!selectedPatient) return;
    
    // Simuler l'enregistrement du matériel cryptographique dans la blockchain
    console.log("Enregistrement du matériel cryptographique dans la blockchain:", {
      patientId: selectedPatient.patientId,
      email: email,
      timestamp: new Date().toISOString()
    });
    
    // Simulation d'un appel API pour créer le matériel cryptographique
    // et enregistrer les identifiants
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation de délai
    
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
    
    toast({
      title: "Succès",
      description: "Matériel cryptographique créé et identifiants enregistrés",
      variant: "default",
    });
    
    // Mettre à jour l'état local pour indiquer que le matériel a été créé
    setPatients(prevState => 
      prevState.map(patient => 
        patient.id === selectedPatient.id 
          ? { ...patient, hasCryptoMaterial: true }
          : patient
      )
    );
  };

  return (
    <div className="bg-white rounded-md shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Liste des requêtes de patients</h2>
        <p className="text-sm text-gray-500 mt-1">
          Les requêtes sont récupérées depuis la blockchain et leur état est géré par une entité externe
        </p>
      </div>
      
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
            {patients.map((patient) => (
              <TableRow 
                key={patient.id} 
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
                  {patient.etatRequest === 'PENDING' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      En attente
                    </Badge>
                  )}
                  {patient.etatRequest === 'ACCEPTED' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Acceptée
                    </Badge>
                  )}
                  {patient.etatRequest === 'REJECTED' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                      Rejetée
                    </Badge>
                  )}
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
                            {patient.etatRequest === 'PENDING' && "En attente"}
                            {patient.etatRequest === 'ACCEPTED' && "Acceptée"}
                            {patient.etatRequest === 'REJECTED' && "Rejetée"}
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
