
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { AddHealthActorForm } from '@/components/HealthActors/AddHealthActorForm';
import { HealthActorList } from '@/components/HealthActors/HealthActorList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, List } from 'lucide-react';

const HealthActorManagement = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Acteurs de santé</h1>
          <p className="text-gray-600">Gérez les médecins, laboratoires et autres acteurs du système</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              Liste des acteurs
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HealthActorManagement;
