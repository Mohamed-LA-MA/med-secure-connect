
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RequestService } from '@/services/RequestService';
import { FileText, Send } from 'lucide-react';

const consultationFormSchema = z.object({
  patientMatricule: z.string().min(1, "Le matricule du patient est requis"),
  ehrId: z.string().min(1, "L'identifiant de l'EHR est requis"),
  description: z.string().optional(),
});

type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

export function ConsultationRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      patientMatricule: "",
      ehrId: "",
      description: "",
    },
  });

  const onSubmit = async (data: ConsultationFormValues) => {
    if (!user) {
      toast({
        description: "Vous devez être connecté pour envoyer une demande de consultation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir les données en nombres
      const patientMatricule = Number(data.patientMatricule);
      const ehrId = Number(data.ehrId);

      if (isNaN(patientMatricule) || isNaN(ehrId)) {
        throw new Error("Le matricule et l'identifiant EHR doivent être des nombres");
      }

      // Créer la requête de consultation
      const request = await RequestService.createConsultationRequest(
        patientMatricule,
        ehrId,
        user.id,
        user.name,
        user.role,
        user.organization?.name || "Organisation inconnue",
        data.description
      );

      console.log("✅ Demande de consultation créée:", request);

      toast({
        description: "Demande de consultation envoyée avec succès",
      });

      // Réinitialiser le formulaire
      form.reset();
    } catch (error: any) {
      console.error("❌ Erreur lors de la création de la demande:", error);
      toast({
        description: `Erreur: ${error.message || "Impossible de créer la demande"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Demande de consultation EHR
        </CardTitle>
        <CardDescription>
          Envoyer une demande pour consulter le dossier médical électronique d'un patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="patientMatricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule du Patient</FormLabel>
                    <FormControl>
                      <Input placeholder="Matricule" {...field} />
                    </FormControl>
                    <FormDescription>
                      Entrez le matricule unique du patient
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ehrId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifiant EHR</FormLabel>
                    <FormControl>
                      <Input placeholder="ID EHR" {...field} />
                    </FormControl>
                    <FormDescription>
                      L'identifiant du dossier médical électronique
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description de la demande</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la raison de votre demande d'accès..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Expliquez le motif de votre demande de consultation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">◌</span>
                  Envoi en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Envoyer la demande
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
