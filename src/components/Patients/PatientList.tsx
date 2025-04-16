
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
import { Eye, Edit, TrashIcon, Check, X } from 'lucide-react';
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
interface Patient {
  id: string;
  requestId: string;
  patientId: string;
  name: string;
  etatRequest: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  ehrid: string;
  matricule: string;
  numeroOrganisation: string;
}

export function PatientList() {
  const { toast } = useToast();
  const [cryptoFormOpen, setCryptoFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // État pour stocker les patients (données fictives pour démo)
  const [patients, setPatients] = useState<Patient[]>([
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
  ]);

  // Simuler des appels API
  const handleAcceptRequest = (patientId: string) => {
    setPatients(
      patients.map(patient => 
        patient.id === patientId 
          ? { ...patient, etatRequest: 'ACCEPTED' as const } 
          : patient
      )
    );
    toast({
      title: "Demande acceptée",
      description: "La demande a été acceptée avec succès",
    });
  };

  const handleRejectRequest = (patientId: string) => {
    setPatients(
      patients.map(patient => 
        patient.id === patientId 
          ? { ...patient, etatRequest: 'REJECTED' as const } 
          : patient
      )
    );
    toast({
      title: "Demande rejetée",
      description: "La demande a été rejetée",
    });
  };

  const handleCreateCryptoMaterial = (patient: Patient) => {
    // Ouvrir le formulaire de création de matériel crypto
    setSelectedPatient(patient);
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
      patientId: selectedPatient?.patientId 
    });
    
    // Ici vous feriez un appel API réel pour enregistrer les identifiants
    // axios.post('/api/crypto-material', { email, password, patientId: selectedPatient?.patientId });
  };

  const handleDeleteRequest = (patientId: string) => {
    // Simulation de suppression
    setPatients(patients.filter(patient => patient.id !== patientId));
    toast({
      title: "Demande supprimée",
      description: "La demande a été supprimée avec succès",
    });
  };

  return (
    <div className="bg-white rounded-md shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Liste des patients</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>ID Patient</TableHead>
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
              <TableRow key={patient.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{patient.patientId}</TableCell>
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
                  {/* Affichage conditionnel des boutons selon l'état */}
                  {patient.etatRequest === 'PENDING' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleAcceptRequest(patient.id)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRejectRequest(patient.id)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  {patient.etatRequest === 'ACCEPTED' && (
                    <Button 
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleCreateCryptoMaterial(patient)}
                    >
                      Créer Crypto
                    </Button>
                  )}
                  
                  {patient.etatRequest === 'REJECTED' && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteRequest(patient.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                  
                  {/* Détails du patient */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Détails du patient</DialogTitle>
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
        />
      )}
    </div>
  );
}
