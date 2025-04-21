
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, X, FileUp, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { EHRService, EHRFile } from '@/services/EHRService';
import { IPFSService } from '@/services/IPFSService';
import { useAuth } from '@/contexts/AuthContext';

// Schéma de validation pour le formulaire principal
const formSchema = z.object({
  patientMatricule: z.string().min(1, { message: "Le matricule du patient est requis" }),
  title: z.string().min(1, { message: "Le titre de l'EHR est requis" }),
  secretKey: z.string().min(1, { message: "La clé secrète est requise" }),
});

// Schéma de validation pour le formulaire de fichier
const fileFormSchema = z.object({
  fileTitle: z.string().min(1, { message: "Le titre du fichier est requis" }),
  file: z.instanceof(File, { message: "Le fichier est requis" }),
});

type FormValues = z.infer<typeof formSchema>;
type FileFormValues = z.infer<typeof fileFormSchema>;

export function CreateEHRForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<EHRFile[]>([]);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  
  // Formulaire principal pour les données de l'EHR
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientMatricule: '',
      title: '',
      secretKey: '',
    },
  });
  
  // Formulaire pour ajouter un fichier
  const fileForm = useForm<FileFormValues>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      fileTitle: '',
      file: undefined,
    },
  });
  
  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      fileForm.setValue('file', file);
    }
  };
  
  // Ajouter un fichier à la liste
  const handleAddFile = async (data: FileFormValues) => {
    try {
      setIsFileUploading(true);
      
      // Envoyer le fichier à IPFS
      const response = await IPFSService.uploadFile(data.file);
      
      // Ajouter le fichier à la liste
      const newFile: EHRFile = {
        fileTitle: data.fileTitle,
        fileHash: response.hash,
      };
      
      setFiles([...files, newFile]);
      
      // Réinitialiser le formulaire
      fileForm.reset();
      setSelectedFile(null);
      setIsAddingFile(false);
      
      toast({
        title: "Fichier ajouté",
        description: `Le fichier "${data.fileTitle}" a été ajouté avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFileUploading(false);
    }
  };
  
  // Supprimer un fichier de la liste
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  
  // Soumettre le formulaire principal
  const onSubmit = async (data: FormValues) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Erreur",
        description: "Vous devez ajouter au moins un fichier",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Déterminer l'organisation blockchain en fonction de l'organisation de l'utilisateur
      const orgName = user.organization?.code === 'HCA' ? 'Org2' : 'Org3';
      
      // Construire les données de l'EHR avec le matricule de l'acteur de santé (user.id)
      const ehrData = {
        title: data.title,
        matricule: parseInt(user.id), // Utiliser l'ID de l'acteur de santé authentifié
        hash: "", // Champ vide comme spécifié
        ipfs: files,
        secretKey: data.secretKey,
      };
      
      console.log("Données EHR soumises:", ehrData);
      
      // Créer l'EHR
      const ehrId = await EHRService.createEHR(ehrData, user.id, orgName);
      console.log("ID EHR créé:", ehrId);
      
      // Mettre à jour l'EHR ID du patient
      const updateResult = await EHRService.updatePatientEHRID(parseInt(data.patientMatricule), parseInt(ehrId), user.id);
      console.log("Résultat de la mise à jour de l'EHR ID:", updateResult);
      
      if (updateResult) {
        toast({
          title: "EHR créé avec succès",
          description: `L'EHR a été créé avec l'ID: ${ehrId} et associé au patient`,
        });
      } else {
        toast({
          title: "Attention",
          description: `L'EHR a été créé avec l'ID: ${ehrId} mais n'a pas pu être associé au patient`,
          variant: "destructive",
        });
      }
      
      // Réinitialiser le formulaire
      form.reset();
      setFiles([]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Créer un dossier médical électronique (EHR)</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour créer un EHR pour un patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientMatricule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matricule du patient</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le matricule du patient" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'EHR</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le titre de l'EHR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clé secrète</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Entrez la clé secrète pour cet EHR" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Fichiers</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingFile(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un fichier
                </Button>
              </div>
              
              {files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun fichier ajouté. Cliquez sur "Ajouter un fichier" pour commencer.
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center">
                        <FileUp className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.fileTitle}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            Hash: {file.fileHash}
                          </p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || files.length === 0}
                className="w-full sm:w-auto"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'EHR
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      
      {/* Dialog pour ajouter un fichier */}
      <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un fichier</DialogTitle>
            <DialogDescription>
              Ajoutez un fichier à l'EHR du patient
            </DialogDescription>
          </DialogHeader>
          
          <Form {...fileForm}>
            <form onSubmit={fileForm.handleSubmit(handleAddFile)} className="space-y-4">
              <FormField
                control={fileForm.control}
                name="fileTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du fichier</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez le titre du fichier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={fileForm.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fichier</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="file-upload" className="cursor-pointer">
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 transition-colors hover:border-gray-400">
                              <div className="space-y-1 text-center">
                                <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                                <div className="text-sm text-muted-foreground">
                                  {selectedFile ? (
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                  ) : (
                                    <p>
                                      <span className="font-medium text-primary">
                                        Cliquez pour sélectionner
                                      </span>{" "}
                                      ou glissez-déposez
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  PDF, images, documents (max. 10MB)
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingFile(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isFileUploading || !selectedFile}
                >
                  {isFileUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Ajouter
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Composant Label pour le formulaire de fichier
function Label({ htmlFor, className, children }: { 
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`${className} block w-full`}
    >
      {children}
    </label>
  );
}
