import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, X, FileUp, CheckCircle, Loader2, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

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
import { Textarea } from '@/components/ui/textarea';
import { EHRFile } from '@/services/EHRService';
import { IPFSService } from '@/services/IPFSService';
import { useAuth } from '@/contexts/AuthContext';
import { RequestService } from '@/services/RequestService';

const formSchema = z.object({
  patientMatricule: z.string().min(1, { message: "Le matricule du patient est requis" }),
  title: z.string().min(1, { message: "Le titre de l'EHR est requis" }),
  description: z.string().optional(),
  secretKey: z.string().min(1, { message: "La clé secrète est requise" }),
});

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
  const [requestCreated, setRequestCreated] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientMatricule: '',
      title: '',
      description: '',
      secretKey: '',
    },
  });
  
  const fileForm = useForm<FileFormValues>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      fileTitle: '',
      file: undefined,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      fileForm.setValue('file', file);
    }
  };
  
  const handleAddFile = async (data: FileFormValues) => {
    try {
      setIsFileUploading(true);
      
      const response = await IPFSService.uploadFile(data.file);
      
      const newFile: EHRFile = {
        fileTitle: data.fileTitle,
        fileHash: response.hash,
      };
      
      setFiles([...files, newFile]);
      
      fileForm.reset();
      setSelectedFile(null);
      setIsAddingFile(false);
      
      toast({
        description: `Le fichier "${data.fileTitle}" a été ajouté avec succès`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsFileUploading(false);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        description: "Utilisateur non authentifié",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        variant: "destructive",
        description: "Vous devez ajouter au moins un fichier",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!user.matricule) {
        throw new Error("Le matricule de l'acteur de santé est manquant dans votre profil. Veuillez contacter l'administrateur.");
      }

      // Création d'une requête au lieu de créer directement l'EHR
      const request = await RequestService.createRequest({
        type: 'EHR_CREATION',
        patientMatricule: parseInt(data.patientMatricule),
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        actorOrganization: user.organization.code,
        status: 'PENDING',
        title: data.title,
        description: data.description,
        files: files,
        secretKey: data.secretKey
      });
      
      setRequestCreated(true);
      
      sonnerToast.success("Requête envoyée", {
        description: "Le patient a été notifié de votre demande de création d'EHR",
      });
      
      setTimeout(() => {
        form.reset();
        setFiles([]);
        setRequestCreated(false);
      }, 3000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 10
      } 
    }
  };
  
  if (requestCreated) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={successVariants}
        className="w-full flex flex-col items-center justify-center py-12"
      >
        <div className="bg-green-50 rounded-full p-6 mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Requête envoyée avec succès</h2>
        <p className="text-gray-600 text-center mb-6">
          Le patient a été notifié et vous recevrez une réponse bientôt
        </p>
        <Button
          onClick={() => {
            form.reset();
            setFiles([]);
            setRequestCreated(false);
          }}
        >
          Créer une nouvelle requête
        </Button>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle>Créer un dossier médical électronique (EHR)</CardTitle>
          <CardDescription>
            Envoyez une demande au patient pour créer un EHR
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div variants={itemVariants}>
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
              </motion.div>
              
              <motion.div variants={itemVariants}>
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
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optionnelle)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ajoutez une description de l'EHR" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
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
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium">Fichiers</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsAddingFile(true)}
                      className="transition-all duration-300 hover:bg-blue-50"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter un fichier
                    </Button>
                  </div>
                  
                  {files.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun fichier ajouté. Cliquez sur "Ajouter un fichier" pour commencer.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
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
                            className="transition-all duration-300 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants} 
                className="flex justify-end"
              >
                <Button 
                  type="submit" 
                  disabled={isSubmitting || files.length === 0}
                  className="w-full sm:w-auto group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                    <span>Envoyer la demande</span>
                  </div>
                  <div className="absolute inset-0 bg-primary/10 w-0 group-hover:w-full transition-all duration-300 z-0"></div>
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
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
                  className="relative group overflow-hidden"
                >
                  <div className="relative z-10 flex items-center">
                    {isFileUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        Ajouter
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-primary/10 w-0 group-hover:w-full transition-all duration-300 z-0"></div>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

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
