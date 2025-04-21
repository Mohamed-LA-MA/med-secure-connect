
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Clock, Search, Plus, FileUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useState } from 'react';
import { CreateEHRForm } from '@/components/HealthActors/CreateEHRForm';

const actorData = {
  id: 'HA001',
  nom: 'Dubois',
  prenom: 'Claire',
  matricule: 'MED001',
  role: 'Médecin',
  organisation: 'HCA',
  specialite: 'Cardiologie',
  cryptoMaterial: true,
};

const recentPatients = [
  { id: 'PAT001', name: 'Jean Dupont', dateAccess: '15/04/2023', status: 'Actif' },
  { id: 'PAT003', name: 'Emilie Martin', dateAccess: '10/04/2023', status: 'Actif' },
  { id: 'PAT007', name: 'Lucas Bernard', dateAccess: '05/04/2023', status: 'Inactif' },
];

const pendingRequests = [
  { 
    id: 'REQ567', 
    type: 'Accès patient', 
    patientName: 'Sophie Moreau', 
    dateRequested: '16/04/2023', 
    status: 'En attente' 
  },
  { 
    id: 'REQ568', 
    type: 'Consultation dossier', 
    patientName: 'Pierre Durand', 
    dateRequested: '15/04/2023', 
    status: 'En attente' 
  },
];

const HealthActorView = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Profil Acteur de Santé</h1>
          <p className="text-gray-600">Gestion de votre compte et de vos accès</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Informations du profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-medical-light flex items-center justify-center text-medical-primary text-2xl font-bold">
                  {actorData.prenom.charAt(0)}{actorData.nom.charAt(0)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{actorData.prenom} {actorData.nom}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{actorData.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Matricule</p>
                  <p className="font-medium">{actorData.matricule}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Rôle</p>
                  <p className="font-medium">{actorData.role}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Spécialité</p>
                  <p className="font-medium">{actorData.specialite}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Organisation</p>
                  <p className="font-medium">{actorData.organisation}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Matériel cryptographique</p>
                  {actorData.cryptoMaterial ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">Actif</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700">Non créé</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs 
              defaultValue="dashboard" 
              value={activeTab} 
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                <TabsTrigger value="patients">Mes patients</TabsTrigger>
                <TabsTrigger value="requests">Demandes</TabsTrigger>
                <TabsTrigger value="createEHR">Créer EHR</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Accès récents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentPatients.slice(0, 3).map((patient) => (
                            <TableRow key={patient.id}>
                              <TableCell>{patient.name}</TableCell>
                              <TableCell>{patient.dateAccess}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Demandes en attente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingRequests.length > 0 ? (
                        <div className="space-y-2">
                          {pendingRequests.map(renderPatientRequests)}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Aucune demande en attente</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center py-6"
                        onClick={() => setActiveTab("patients")}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Rechercher un patient
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center py-6"
                        onClick={() => setActiveTab("createEHR")}  
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Créer un EHR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="patients" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mes patients</CardTitle>
                    <CardDescription>
                      Liste des patients auxquels vous avez accès
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Dernier accès</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.id}</TableCell>
                            <TableCell>{patient.name}</TableCell>
                            <TableCell>{patient.dateAccess}</TableCell>
                            <TableCell>
                              <Badge variant={patient.status === 'Actif' ? 'default' : 'outline'}>
                                {patient.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setActiveTab("createEHR")}
                                >
                                  <FileUp className="h-4 w-4" />
                                  <span className="sr-only">Créer EHR</span>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Consulter</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requests" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Demandes</CardTitle>
                    <CardDescription>
                      Gérez vos demandes d'accès et d'actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date demande</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{request.type}</TableCell>
                            <TableCell>{request.patientName}</TableCell>
                            <TableCell>{request.dateRequested}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                {request.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="createEHR" className="mt-6">
                <CreateEHRForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const renderPatientRequests = (request: typeof pendingRequests[0]) => (
  <div key={request.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50 transition-all duration-200">
    <div>
      <p className="font-medium text-sm flex items-center gap-2">
        {request.type}
        {request.status === 'En attente' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </p>
      <p className="text-xs text-gray-500">{request.patientName}</p>
    </div>
    <Badge 
      variant="outline" 
      className={
        request.status === 'En attente' 
          ? 'bg-yellow-50 text-yellow-700' 
          : 'bg-green-50 text-green-700'
      }
    >
      {request.status}
    </Badge>
  </div>
);

export default HealthActorView;
