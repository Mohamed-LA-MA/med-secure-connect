
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { AddPatientForm } from '@/components/Patients/AddPatientForm';
import { PatientList } from '@/components/Patients/PatientList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, List } from 'lucide-react';

const PatientManagement = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Gestion des patients</h1>
          <p className="text-gray-600">Ajoutez et gérez les dossiers des patients</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              Liste des patients
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <PatientList />
          </TabsContent>
          
          <TabsContent value="add" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <AddPatientForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientManagement;
