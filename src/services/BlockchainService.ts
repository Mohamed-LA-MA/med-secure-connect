
import axios from 'axios';

// Configuration de l'API blockchain
export const API_CONFIG = {
  BASE_URL: 'http://192.168.56.101:4000', // URL du serveur backend
  CHANNEL: 'mychannel',
  CHAINCODE_HEALTH_PATIENT: 'patient',
  CHAINCODE_HEALTH_ACTOR: 'healthactor',
  CHAINCODE_HEALTH_AUTHORITY: 'healthauthority'
};

// Mappage des organisations
export const ORG_MAPPING = {
  HCA: { orgId: "org2", peer: "peer0.org2.example.com", admin: "hospitalAdmin1", orgName: "Org2" },
  HQA: { orgId: "org3", peer: "peer0.org3.example.com", admin: "hospitalAdmin2", orgName: "Org3" }
};

// Types pour les requêtes
export interface PatientRequest {
  id?: string;
  requestId: string;
  patientId: string;
  name: string;
  matricule: string;
  ehrid: string;
  numeroOrganisation: string;
  etatRequest: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  // Additional properties for UI state
  isNew?: boolean;
  hasStateChanged?: boolean;
}

export interface HealthActorRequest {
  id?: string;
  requestId: string;
  healthActorId: string;
  nom: string;
  prenom: string;
  matriculeActor: string;
  numeroOrg: string;
  role: string; 
  etatRequest: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  // Additional properties for UI state
  isNew?: boolean;
  hasStateChanged?: boolean;
}

// Classe de service pour interagir avec la blockchain
export class BlockchainService {
  // Fonction pour obtenir le token d'authentification de l'admin
  static async getAdminToken(): Promise<string | null> {
    try {
      console.log("🔹 Connexion de l'admin en cours...");
      const authLoginResponse = await axios.post(`${API_CONFIG.BASE_URL}/users/login`, {
        username: "admin",
        orgName: "Org1"
      });

      if (!authLoginResponse.data.success || !authLoginResponse.data.message?.token) {
        console.error("❌ Échec de la connexion:", authLoginResponse.data);
        throw new Error("Échec de la connexion à l'admin");
      }

      console.log("✅ Connexion réussie, token JWT récupéré");
      return authLoginResponse.data.message.token;
    } catch (error: any) {
      console.error("❌ Erreur lors de la connexion de l'admin:", error.response?.data || error.message);
      return null;
    }
  }

  // Fonction pour récupérer les requêtes de patients depuis la blockchain
  static async getPatientRequests(organization?: string): Promise<PatientRequest[]> {
    try {
      const authToken = await this.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }

      console.log("🔹 Récupération des demandes de patients...");
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/${API_CONFIG.CHAINCODE_HEALTH_PATIENT}`, 
        {
          params: {
            fcn: "GetAllPatientRequests",
            args: '[]',
          },
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Réponse reçue:", response.data);
      
      // Traitement de la réponse
      if (response.data && response.data.result && response.data.result.data) {
        let requests = response.data.result.data as PatientRequest[];
        
        // Filtrer par organisation si spécifié
        if (organization) {
          requests = requests.filter(req => {
            // Mapping des codes d'organisation
            const orgMap: Record<string, string> = {
              'org2': 'HCA',
              'org3': 'HQA'
            };
            
            return req.numeroOrganisation === orgMap[organization];
          });
        }
        
        return requests;
      } else {
        console.error("❌ Format de réponse invalide:", response.data);
        return [];
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des requêtes:", error.response?.data || error.message);
      return [];
    }
  }

  // Fonction pour récupérer les requêtes d'acteurs de santé depuis la blockchain
  static async getHealthActorRequests(organization?: string): Promise<HealthActorRequest[]> {
    try {
      const authToken = await this.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }

      console.log("🔹 Récupération des demandes d'acteurs de santé...");
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/${API_CONFIG.CHAINCODE_HEALTH_ACTOR}`, 
        {
          params: {
            fcn: "GetAllHealthActorRequests",
            args: '[]',
          },
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Réponse reçue:", response.data);
      
      // Traitement de la réponse
      if (response.data && response.data.result && response.data.result.data) {
        let requests = response.data.result.data as HealthActorRequest[];
        
        // Filtrer par organisation si spécifié
        if (organization) {
          requests = requests.filter(req => {
            // Mapping des codes d'organisation
            const orgMap: Record<string, string> = {
              'org2': 'HCA',
              'org3': 'HQA'
            };
            
            return req.numeroOrg === orgMap[organization];
          });
        }
        
        return requests;
      } else {
        console.error("❌ Format de réponse invalide:", response.data);
        return [];
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des requêtes:", error.response?.data || error.message);
      return [];
    }
  }

  // Fonction pour générer un mot de passe sécurisé
  private static generateSecurePassword(length = 10): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Fonction pour créer des identifiants pour un patient
  static async createPatientCredentials(patientId: string, organization: string): Promise<boolean> {
    try {
      const authToken = await this.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }

      console.log("🔹 Création des identifiants pour le patient...");
      
      const orgConfig = ORG_MAPPING[organization as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Formatage des identifiants
      const username = `${patientId}@${organization.toLowerCase()}.health`;
      const password = this.generateSecurePassword();
      
      console.log(`📝 Identifiants générés - Username: ${username}`);
      
      // Ici, nous simulons l'appel à l'API d'enregistrement
      // Dans un environnement réel, nous ferions un appel API
      console.log("🔹 Enregistrement de l'utilisateur...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de délai
      
      // Stockage des identifiants (simule l'accès à une base de données)
      console.log("🔹 Stockage des identifiants...");
      const credentials = {
        entityId: patientId,
        username,
        password,
        organization,
        createdAt: new Date().toISOString()
      };
      
      // Dans une implémentation réelle, nous sauvegarderions ces informations dans une base de données
      console.log("✅ Identifiants créés avec succès:", { entityId: patientId, username });
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création des identifiants:", error);
      return false;
    }
  }

  // Fonction pour créer des identifiants pour un acteur de santé
  static async createHealthActorCredentials(actorId: string, organization: string): Promise<boolean> {
    try {
      const authToken = await this.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }

      console.log("🔹 Création des identifiants pour l'acteur de santé...");
      
      const orgConfig = ORG_MAPPING[organization as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Formatage des identifiants
      const username = `${actorId}@${organization.toLowerCase()}.health`;
      const password = this.generateSecurePassword();
      
      console.log(`📝 Identifiants générés - Username: ${username}`);
      
      // Ici, nous simulons l'appel à l'API d'enregistrement
      // Dans un environnement réel, nous ferions un appel API
      console.log("🔹 Enregistrement de l'utilisateur...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de délai
      
      // Stockage des identifiants (simule l'accès à une base de données)
      console.log("🔹 Stockage des identifiants...");
      const credentials = {
        entityId: actorId,
        username,
        password,
        organization,
        createdAt: new Date().toISOString()
      };
      
      // Dans une implémentation réelle, nous sauvegarderions ces informations dans une base de données
      console.log("✅ Identifiants créés avec succès:", { entityId: actorId, username });
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création des identifiants:", error);
      return false;
    }
  }
}
