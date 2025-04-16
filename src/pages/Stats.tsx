
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

// Données fictives pour la démo
const monthlyData = [
  { name: 'Jan', patients: 12, requests: 34, acceptedRequests: 28 },
  { name: 'Fév', patients: 15, requests: 37, acceptedRequests: 31 },
  { name: 'Mar', patients: 18, requests: 43, acceptedRequests: 36 },
  { name: 'Avr', patients: 21, requests: 49, acceptedRequests: 41 },
  { name: 'Mai', patients: 25, requests: 52, acceptedRequests: 45 },
  { name: 'Juin', patients: 28, requests: 58, acceptedRequests: 50 },
];

const pieData = [
  { name: 'Médecins', value: 35 },
  { name: 'Laboratoires', value: 15 },
  { name: 'Centres d\'imagerie', value: 10 },
  { name: 'Assurances', value: 5 },
];

const requestStatusData = [
  { name: 'En attente', value: 12 },
  { name: 'Approuvées', value: 42 },
  { name: 'Rejetées', value: 13 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS = ['#FFB74D', '#66BB6A', '#ef5350'];

const Stats = () => {
  const { organization } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Statistiques et Analytics</h1>
          <p className="text-gray-600">Données et informations sur les activités de {organization}</p>
        </div>

        {/* Graphique d'évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>
              Nombre de patients, requêtes et requêtes acceptées par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="#1976D2" name="Patients" />
                  <Line type="monotone" dataKey="requests" stroke="#03A9F4" name="Requêtes" />
                  <Line type="monotone" dataKey="acceptedRequests" stroke="#4ECDC4" name="Requêtes acceptées" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Graphiques en camembert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution des acteurs de santé</CardTitle>
              <CardDescription>
                Répartition par type d'acteur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>État des demandes</CardTitle>
              <CardDescription>
                Répartition des demandes par statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {requestStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique à barres */}
        <Card>
          <CardHeader>
            <CardTitle>Volume de requêtes par mois</CardTitle>
            <CardDescription>
              Comparaison du nombre total de requêtes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" name="Requêtes totales" fill="#1976D2" />
                  <Bar dataKey="acceptedRequests" name="Requêtes acceptées" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Stats;
