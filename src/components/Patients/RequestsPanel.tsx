
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, FileUp, Clock, Calendar, Eye } from 'lucide-react';
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
import { EHRService } from '@/services/EHRService';
import { motion, AnimatePresence } from 'framer-motion';

export function RequestsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  
  const fetchRequests = async () => {
    if (!user?.matricule) {
      console.error("Erreur: Matricule utilisateur non disponible");
      return;
    }
    
    try {
      console.log("Récupération des requêtes pour le matricule:", user.matricule, "type:", typeof user.matricule);
      // Assurons-nous que le matricule est un nombre
      const matriculeNumber = Number(user.matricule);
      console.log("Matricule converti en nombre:", matriculeNumber);
      
      const patientRequests = await RequestService.getRequestsByPatientMatricule(matriculeNumber);
      console.log("Requêtes récupérées:", patientRequests);
      setRequests(patientRequests);
    } catch (error) {
      console.error('Erreur lors de la récupération des requêtes:', error);
    }
  };
  
  useEffect(() => {
    fetchRequests();
    
    // Refresh requests every minute
    const interval = setInterval(fetchRequests, 60000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setViewDetails(true);
  };
  
  const handleRequestAction = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    
    try {
      const updatedRequest = await RequestService.updateRequestStatus(requestId, status);
      
      if (status === 'ACCEPTED') {
        if (updatedRequest?.type === 'EHR_CREATION') {
          if (!user?.matricule) {
            throw new Error("Matricule du patient non trouvé");
          }
          
          const actorMatricule = parseInt(updatedRequest.actorId);
          
          // Créer l'EHR dans la blockchain
          const ehrData = {
            title: updatedRequest.title,
            matricule: actorMatricule,
            hash: "",
            ipfs: updatedRequest.files || [],
            secretKey: updatedRequest.secretKey || ""
          };
          
          const orgName = updatedRequest.actorOrganization === 'HCA' ? 'Org2' : 'Org3';
          
          const ehrId = await EHRService.createEHR(ehrData, updatedRequest.actorId, orgName);
          
          // Mettre à jour l'EHR du patient
          await EHRService.updatePatientEHRID(user.matricule, parseInt(ehrId), updatedRequest.actorId);
          
          toast({
            description: "EHR créé avec succès. L'EHR a été créé et associé à votre dossier patient",
          });
        } else if (updatedRequest?.type === 'EHR_CONSULTATION') {
          console.log("🔹 Simulation d'appel blockchain: SetResponse pour consultation EHR acceptée");
          
          toast({
            description: "Demande de consultation acceptée. L'acteur de santé peut maintenant consulter votre dossier.",
          });
        }
      }
      
      await fetchRequests();
      
      setViewDetails(false);
      
      toast({
        description: status === 'ACCEPTED' 
          ? "La demande a été acceptée avec succès" 
          : "La demande a été refusée",
        variant: status === 'ACCEPTED' ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        description: error.message || "Une erreur est survenue lors du traitement de la requête",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const acceptedRequests = requests.filter(req => req.status === 'ACCEPTED');
  const rejectedRequests = requests.filter(req => req.status === 'REJECTED');
  
  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'EHR_CREATION': return 'Création EHR';
      case 'EHR_ACCESS': return 'Accès EHR';
      case 'EHR_CONSULTATION': return 'Consultation EHR';
      case 'DOCUMENT_SHARE': return 'Partage de document';
      default: return type;
    }
  };

  // Animation variants
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
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">Acceptées</TabsTrigger>
          <TabsTrigger value="rejected">Refusées</TabsTrigger>
        </TabsList>
        
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
                            De: {request.actorName} ({request.actorRole})
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-300"
                            onClick={() => handleRequestAction(request.id, 'ACCEPTED')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Accepter</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-300"
                            onClick={() => handleRequestAction(request.id, 'REJECTED')}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Refuser</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            Détails
                          </Button>
                        </div>
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
                            De: {request.actorName} ({request.actorRole})
                          </div>
                          <div className="text-xs text-gray-500">
                            Acceptée le: {new Date(request.updatedAt).toLocaleString()}
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
                            De: {request.actorName} ({request.actorRole})
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
              Informations sur la demande de {selectedRequest?.actorName}
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
                <p className="text-sm font-medium text-gray-500">Demandeur</p>
                <p>{selectedRequest.actorName} ({selectedRequest.actorRole})</p>
                <p className="text-sm text-gray-500">{selectedRequest.actorOrganization}</p>
              </div>
              
              {selectedRequest.ehrId && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Identifiant EHR</p>
                  <p>{selectedRequest.ehrId}</p>
                </div>
              )}
              
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
            
            {selectedRequest && selectedRequest.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={() => handleRequestAction(selectedRequest.id, 'ACCEPTED')}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <Clock className="animate-spin h-4 w-4 mr-2" />
                      Traitement...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => handleRequestAction(selectedRequest.id, 'REJECTED')}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <Clock className="animate-spin h-4 w-4 mr-2" />
                      Traitement...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </div>
                  )}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
