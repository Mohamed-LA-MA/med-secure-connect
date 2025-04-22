
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, Calendar, FileUp, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RequestService, Request } from '@/services/RequestService';
import { motion, AnimatePresence } from 'framer-motion';
import { EHRService } from '@/services/EHRService';

export function RequestList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      const actorRequests = await RequestService.getRequestsByActor(user.id);
      setRequests(actorRequests);
    } catch (error) {
      console.error('Erreur lors de la récupération des requêtes:', error);
    }
  };
  
  useEffect(() => {
    fetchRequests();
    
    // Refresh requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setViewDetails(true);
  };
  
  const createAcceptedEHR = async (request: Request) => {
    try {
      if (!user?.matricule) {
        throw new Error("Matricule de l'acteur de santé manquant");
      }
      
      // Créer l'EHR dans la blockchain
      const ehrData = {
        title: request.title,
        matricule: user.matricule,
        hash: "",
        ipfs: request.files || [],
        secretKey: request.secretKey || ""
      };
      
      const orgName = user.organization.code === 'HCA' ? 'Org2' : 'Org3';
      
      const ehrId = await EHRService.createEHR(ehrData, user.id, orgName);
      
      // Mettre à jour l'EHR du patient
      await EHRService.updatePatientEHRID(request.patientMatricule, parseInt(ehrId), user.id);
      
      toast({
        title: "EHR créé avec succès",
        description: `L'EHR a été créé et associé au patient avec le matricule ${request.patientMatricule}`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'EHR",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const handleAcceptedRequestAction = async (request: Request) => {
    if (request.type === 'EHR_CREATION') {
      await createAcceptedEHR(request);
    }
    
    // Fermer la modal
    setViewDetails(false);
  };
  
  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const acceptedRequests = requests.filter(req => req.status === 'ACCEPTED');
  const rejectedRequests = requests.filter(req => req.status === 'REJECTED');
  
  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'EHR_CREATION': return 'Création EHR';
      case 'EHR_ACCESS': return 'Accès EHR';
      case 'DOCUMENT_SHARE': return 'Partage de document';
      default: return type;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05 
      } 
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="relative">
            Toutes
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-white text-xs">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Acceptées
            {acceptedRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">
                {acceptedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">Refusées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Files className="h-5 w-5 text-blue-500" />
                Toutes les requêtes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {requests.length === 0 ? (
                  <motion.div 
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Aucune requête trouvée
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {requests.map((request) => (
                      <motion.div
                        key={request.id}
                        variants={itemVariants}
                        className={`flex items-center justify-between p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors duration-300 ${
                          request.status === 'ACCEPTED' 
                            ? 'bg-green-50 border-green-200' 
                            : request.status === 'REJECTED'
                            ? 'bg-red-50 border-red-200'
                            : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              request.status === 'PENDING'
                                ? 'bg-yellow-50 text-yellow-800'
                                : request.status === 'ACCEPTED'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }>
                              {getRequestTypeLabel(request.type)}
                            </Badge>
                            <span className="text-sm font-medium">{request.title}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Patient Matricule: {request.patientMatricule}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(request.createdAt).toLocaleString()}
                            <Badge variant="outline" className={
                              request.status === 'PENDING'
                                ? 'bg-yellow-50 text-yellow-700 ml-2'
                                : request.status === 'ACCEPTED'
                                ? 'bg-green-50 text-green-700 ml-2'
                                : 'bg-red-50 text-red-700 ml-2'
                            }>
                              {request.status === 'PENDING' 
                                ? 'En attente' 
                                : request.status === 'ACCEPTED'
                                ? 'Acceptée'
                                : 'Refusée'
                              }
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          Détails
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Requêtes en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {pendingRequests.length === 0 ? (
                  <motion.div 
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Aucune requête en attente
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {pendingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors duration-300"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                              {getRequestTypeLabel(request.type)}
                            </Badge>
                            <span className="text-sm font-medium">{request.title}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Patient Matricule: {request.patientMatricule}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          Détails
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accepted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Requêtes acceptées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {acceptedRequests.length === 0 ? (
                  <motion.div 
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Aucune requête acceptée
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {acceptedRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              {getRequestTypeLabel(request.type)}
                            </Badge>
                            <span className="text-sm font-medium">{request.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Patient Matricule: {request.patientMatricule}
                          </div>
                          <div className="text-xs text-gray-500">
                            Acceptée le: {new Date(request.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            Détails
                          </Button>
                          {request.type === 'EHR_CREATION' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-300 bg-green-100 text-green-800 hover:bg-green-200"
                              onClick={() => handleAcceptedRequestAction(request)}
                            >
                              Créer EHR
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Requêtes refusées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {rejectedRequests.length === 0 ? (
                  <motion.div 
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Aucune requête refusée
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {rejectedRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              {getRequestTypeLabel(request.type)}
                            </Badge>
                            <span className="text-sm font-medium">{request.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Patient Matricule: {request.patientMatricule}
                          </div>
                          <div className="text-xs text-gray-500">
                            Refusée le: {new Date(request.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          Détails
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal de détails */}
      <Dialog open={viewDetails} onOpenChange={setViewDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la requête</DialogTitle>
            <DialogDescription>
              Informations sur la demande pour le patient {selectedRequest?.patientMatricule}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p>{getRequestTypeLabel(selectedRequest.type)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Titre</p>
                <p>{selectedRequest.title}</p>
              </div>
              
              {selectedRequest.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p>{selectedRequest.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Patient</p>
                <p>Matricule: {selectedRequest.patientMatricule}</p>
                {selectedRequest.patientName && <p>Nom: {selectedRequest.patientName}</p>}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <Badge
                  variant="outline"
                  className={
                    selectedRequest.status === 'PENDING'
                      ? 'bg-yellow-50 text-yellow-700'
                      : selectedRequest.status === 'ACCEPTED'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }
                >
                  {selectedRequest.status === 'PENDING'
                    ? 'En attente'
                    : selectedRequest.status === 'ACCEPTED'
                    ? 'Acceptée'
                    : 'Refusée'}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Date de création</p>
                <p>{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
              
              {selectedRequest.status !== 'PENDING' && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de mise à jour</p>
                  <p>{new Date(selectedRequest.updatedAt).toLocaleString()}</p>
                </div>
              )}
              
              {selectedRequest.files && selectedRequest.files.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Fichiers ({selectedRequest.files.length})</p>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.files.map((file, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                        <FileUp className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm">{file.fileTitle}</p>
                          <p className="text-xs text-gray-500 truncate">{file.fileHash}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setViewDetails(false)}
            >
              Fermer
            </Button>
            
            {selectedRequest && selectedRequest.status === 'ACCEPTED' && selectedRequest.type === 'EHR_CREATION' && (
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                onClick={() => handleAcceptedRequestAction(selectedRequest)}
              >
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Créer l'EHR
                </div>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
