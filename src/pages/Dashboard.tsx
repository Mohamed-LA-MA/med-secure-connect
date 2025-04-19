
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserCog,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Données fictives pour la démo
const statsData = {
  patients: 120,
  healthActors: 45,
  requests: {
    total: 67,
    pending: 12,
    accepted: 42,
    rejected: 13,
  }
};

const Dashboard = () => {
  const { organization } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace d'administration {organization?.name || "Non défini"}</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-medical-primary flex items-center">
                <Users className="mr-2 h-5 w-5 text-medical-primary" />
                Patients
              </CardTitle>
              <CardDescription>Nombre total de patients</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statsData.patients}</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-medical-primary flex items-center">
                <UserCog className="mr-2 h-5 w-5 text-medical-primary" />
                Acteurs de santé
              </CardTitle>
              <CardDescription>Nombre total d'acteurs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statsData.healthActors}</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-medical-primary flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-medical-primary" />
                Demandes traitées
              </CardTitle>
              <CardDescription>Demandes gérées ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statsData.requests.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* État des demandes */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-medical-dark">État des demandes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-yellow-600">
                  <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statsData.requests.pending}</p>
                <p className="text-sm text-gray-500 mt-1">Demandes nécessitant une action</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-green-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-green-600">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  Acceptées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statsData.requests.accepted}</p>
                <p className="text-sm text-gray-500 mt-1">Demandes approuvées</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-red-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-red-600">
                  <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  Rejetées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statsData.requests.rejected}</p>
                <p className="text-sm text-gray-500 mt-1">Demandes non approuvées</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alertes et notifications */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-medical-dark">Notifications récentes</h2>
          <Card className="bg-white">
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4 flex items-start hover:bg-gray-50 transition-colors">
                  <div className="mr-4 mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">5 nouvelles demandes en attente</h3>
                    <p className="text-sm text-gray-500">Nouvelles demandes nécessitant votre attention</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 20 minutes</p>
                  </div>
                </div>
                
                <div className="p-4 flex items-start hover:bg-gray-50 transition-colors">
                  <div className="mr-4 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Matériel cryptographique créé</h3>
                    <p className="text-sm text-gray-500">Le matériel a été créé avec succès pour Dr. Martin</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                  </div>
                </div>
                
                <div className="p-4 flex items-start hover:bg-gray-50 transition-colors">
                  <div className="mr-4 mt-0.5">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Demande rejetée</h3>
                    <p className="text-sm text-gray-500">La demande #2548 a été rejetée</p>
                    <p className="text-xs text-gray-400 mt-1">Hier à 14:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
