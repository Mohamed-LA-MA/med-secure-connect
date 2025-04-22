import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, UserCog, Clock, CheckCircle, XCircle, FileSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { RequestsPanel } from '@/components/Patients/RequestsPanel';

const patientData = {
  id: 'PAT001',
  name: 'Jean Dupont',
  ehrid: 'EHR001',
  matricule: 'MAT001',
  organisation: 'HCA',
  dateNaissance: '15/05/1980',
  dateInscription: '10/01/2023',
};

const recentActivities = [
  { 
    id: 'ACT001', 
    type: 'Consultation', 
    actor: 'Dr. Claire Dubois', 
    role: 'Médecin', 
    date: '15/04/2023',
    details: 'Consultation cardiologie' 
  },
  { 
    id: 'ACT002', 
    type: 'Analyse', 
    actor: 'Labo Central', 
    role: 'Laboratoire', 
    date: '10/04/2023',
    details: 'Analyse de sang' 
  },
  { 
    id: 'ACT003', 
    type: 'Imagerie', 
    actor: 'Centre Imagerie Paris', 
    role: 'Centre d\'imagerie', 
    date: '05/04/2023',
    details: 'Radiographie thorax' 
  },
];

const pendingRequests = [
  { 
    id: 'REQ567', 
    type: 'Accès au dossier', 
    actor: 'Dr. Martin Petit', 
    role: 'Médecin',
    dateRequested: '16/04/2023', 
    status: 'En attente' 
  },
  { 
    id: 'REQ568', 
    type: 'Partage de résultats', 
    actor: 'Clinique du Sud', 
    role: 'Centre médical',
    dateRequested: '15/04/2023', 
    status: 'En attente' 
  },
];

const PatientView = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Profil Patient</h1>
          <p className="text-gray-600">Gestion de votre dossier médical électronique</p>
        </div>

        {/* Carte de profil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-medical-light flex items-center justify-center text-medical-primary text-2xl font-bold">
                  {patientData.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{patientData.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">ID Patient</p>
                  <p className="font-medium">{patientData.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">EHRID</p>
                  <p className="font-medium">{patientData.ehrid}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Matricule</p>
                  <p className="font-medium">{patientData.matricule}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">{patientData.dateNaissance}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Organisation</p>
                  <p className="font-medium">{patientData.organisation}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date d'inscription</p>
                  <p className="font-medium">{patientData.dateInscription}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section principale avec onglets */}
          <div className="md:col-span-2">
            <Tabs defaultValue="dashboard">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="requests">Demandes</TabsTrigger>
              </TabsList>
              
              {/* Tableau de bord */}
              <TabsContent value="dashboard" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Activités récentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recentActivities.slice(0, 2).map((activity) => (
                          <div key={activity.id} className="flex justify-between items-center p-2 border rounded-md">
                            <div>
                              <p className="font-medium text-sm">{activity.type}</p>
                              <p className="text-xs text-gray-500">{activity.actor} - {activity.date}</p>
                            </div>
                            <FileSearch className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        Voir tout l'historique
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Demandes en attente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingRequests.length > 0 ? (
                        <div className="space-y-2">
                          {pendingRequests.map((request) => (
                            <div key={request.id} className="flex justify-between items-center p-2 border rounded-md">
                              <div>
                                <p className="font-medium text-sm">{request.type}</p>
                                <p className="text-xs text-gray-500">{request.actor} - {request.dateRequested}</p>
                              </div>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Aucune demande en attente</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Acteurs de santé autorisés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Dr. Claire Dubois</TableCell>
                          <TableCell>Médecin</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Labo Central</TableCell>
                          <TableCell>Laboratoire</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Centre Imagerie Paris</TableCell>
                          <TableCell>Centre d'imagerie</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Historique */}
              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des activités</CardTitle>
                    <CardDescription>
                      Toutes les actions réalisées sur votre dossier médical
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Acteur</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Détails</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentActivities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell>{activity.type}</TableCell>
                            <TableCell>{activity.actor}</TableCell>
                            <TableCell>{activity.role}</TableCell>
                            <TableCell>{activity.date}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{activity.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Demandes */}
              <TabsContent value="requests" className="mt-6">
                <RequestsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientView;
