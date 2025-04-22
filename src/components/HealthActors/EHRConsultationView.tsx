
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestService, Request } from '@/services/RequestService';
import { FileText, Calendar, User, Clock, FileUp, Check, X, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface EHRConsultationViewProps {
  requestId: string;
}

export function EHRConsultationView({ requestId }: EHRConsultationViewProps) {
  const [request, setRequest] = useState<Request | null>(null);
  const [ehr, setEHR] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequestAndEHR = async () => {
      try {
        // Récupérer la requête
        const req = await RequestService.getRequestById(requestId);
        if (!req) {
          throw new Error("Requête non trouvée");
        }
        setRequest(req);

        // Si la requête est acceptée, récupérer l'EHR
        if (req.status === 'ACCEPTED' && req.type === 'EHR_CONSULTATION') {
          const ehrData = await RequestService.getEHRByConsultationRequest(requestId);
          if (!ehrData) {
            throw new Error("Impossible de récupérer les données de l'EHR");
          }
          setEHR(ehrData);
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err.message || "Une erreur est survenue");
        toast({
          description: `Erreur: ${err.message || "Impossible de récupérer les données"}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequestAndEHR();
  }, [requestId, toast]);

  if (loading) {
    return <EHRConsultationSkeleton />;
  }

  if (error || !request) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive flex items-center gap-2">
            <X className="h-5 w-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{error || "Impossible d'afficher les données de l'EHR"}</p>
        </CardContent>
      </Card>
    );
  }

  // Si la requête n'est pas acceptée
  if (request.status !== 'ACCEPTED') {
    return (
      <Card className="border-yellow-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-yellow-700 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Requête en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Cette demande de consultation est en attente d'approbation par le patient.
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              {request.status === 'PENDING' ? 'En attente' : 'Refusée'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-700 flex items-center gap-2">
          <Check className="h-5 w-5" />
          Consultation EHR autorisée
        </CardTitle>
        <CardDescription>
          Dossier médical électronique du patient (Matricule: {request.patientMatricule})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {ehr ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Titre</h3>
                <p className="text-lg font-medium">{ehr.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Identifiant</h3>
                <p className="text-lg font-medium">{ehr.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                <p className="text-base">{new Date(ehr.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Matricule patient</h3>
                <p className="text-base">{ehr.patientMatricule}</p>
              </div>
            </div>

            {/* Fichiers de l'EHR */}
            {ehr.files && ehr.files.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Fichiers associés</h3>
                <div className="space-y-2">
                  {ehr.files.map((file: any, index: number) => (
                    <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <FileUp className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">{file.fileTitle}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs md:max-w-md">{file.fileHash}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Aucun fichier disponible pour cet EHR</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Impossible de récupérer les informations de l'EHR</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EHRConsultationSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-6 w-[150px]" />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Skeleton className="h-4 w-[150px] mb-4" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full mb-2" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
