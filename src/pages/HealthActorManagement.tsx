
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { AddHealthActorForm } from '@/components/HealthActors/AddHealthActorForm';
import { HealthActorList } from '@/components/HealthActors/HealthActorList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, List, FileText } from 'lucide-react';

const HealthActorManagement = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Acteurs de santé</h1>
          <p className="text-gray-600">Gérez les médecins, laboratoires et autres acteurs du système et traitez les requêtes blockchain</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="list" className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              Requêtes acteurs
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter acteur
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <HealthActorList />
          </TabsContent>
          
          <TabsContent value="add" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <AddHealthActorForm />
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <div className="p-8 bg-white rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">Statistiques des acteurs de santé</h2>
              <p className="text-gray-500">
                Cette section affichera des statistiques sur les acteurs de santé et les requêtes blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-700">Requêtes en attente</h3>
                  <p className="text-3xl font-bold mt-2">8</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-700">Acteurs enregistrés</h3>
                  <p className="text-3xl font-bold mt-2">32</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
                  <h3 className="text-lg font-medium text-purple-700">Requêtes traitées</h3>
                  <p className="text-3xl font-bold mt-2">56</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HealthActorManagement;
