
import axios from 'axios';

// Configuration de l'API blockchain
export const API_CONFIG = {
  BASE_URL: 'http://192.168.56.101:4000', // URL du serveur backend
  CHANNEL: 'mychannel',
  CHAINCODE_HEALTH_PATIENT: 'patient',
  CHAINCODE_HEALTH_ACTOR: 'healthactor',
  CHAINCODE_HEALTH_AUTHORITY: 'healthauthority'
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

  // Fonction pour créer un crypto matériel pour un patient
  static async createPatientCryptoMaterial(patientId: string, email: string, password: string): Promise<boolean> {
    try {
      const authToken = await this.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }

      console.log("🔹 Création du matériel cryptographique pour le patient...");
      
      // Ici, nous simulons l'appel à l'API blockchain pour créer le crypto matériel
      // Dans un environnement réel, cela serait un appel à l'API appropriée
      console.log("Données envoyées:", { patientId, email, password });
      
      // Simulation de délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du matériel cryptographique:", error);
      return false;
    }
  }

  // Fonction pour créer un crypto matériel pour un acteur de santé
  static async createHealthActorCryptoMaterial(actorId: string, email: string, password: string): Promise<boolean> {
    try {
      const authToken = await this.getAdminToken();
      if (!authToken) {
        throw new Error("Impossible d'obtenir le token d'authentification");
      }

      console.log("🔹 Création du matériel cryptographique pour l'acteur de santé...");
      
      // Ici, nous simulons l'appel à l'API blockchain pour créer le crypto matériel
      // Dans un environnement réel, cela serait un appel à l'API appropriée
      console.log("Données envoyées:", { actorId, email, password });
      
      // Simulation de délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du matériel cryptographique:", error);
      return false;
    }
  }
}
