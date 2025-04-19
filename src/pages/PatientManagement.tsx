
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { AddPatientForm } from '@/components/Patients/AddPatientForm';
import { PatientList } from '@/components/Patients/PatientList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, List, FileText } from 'lucide-react';

const PatientManagement = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-medical-dark">Gestion des patients</h1>
          <p className="text-gray-600">Ajoutez, gérez les dossiers des patients et traitez les requêtes blockchain</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="list" className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              Requêtes patients
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter patient
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Statistiques
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
          
          <TabsContent value="stats" className="mt-6">
            <div className="p-8 bg-white rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">Statistiques des patients</h2>
              <p className="text-gray-500">
                Cette section affichera des statistiques sur les patients et les requêtes blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-700">Requêtes en attente</h3>
                  <p className="text-3xl font-bold mt-2">12</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-700">Patients enregistrés</h3>
                  <p className="text-3xl font-bold mt-2">45</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
                  <h3 className="text-lg font-medium text-purple-700">Requêtes traitées</h3>
                  <p className="text-3xl font-bold mt-2">87</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientManagement;
