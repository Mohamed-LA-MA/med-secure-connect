import { ORG_MAPPING, OrganizationCode, getOrganizationCode, getBlockchainOrgId } from '@/utils/organizationMapping';
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
  
  // Fonction pour se connecter avec un compte administrateur spécifique
  static async loginAdmin(username: string, orgName: string): Promise<string | null> {
    try {
      console.log(`🔹 Connexion de l'admin ${username} en cours...`);
      
      const loginResponse = await axios.post(`${API_CONFIG.BASE_URL}/users/login`, {
        username: username,
        orgName: orgName
      });
      
      if (loginResponse.data.success) {
        console.log(`✅ Admin ${username} connecté avec succès`);
        const token = loginResponse.data.message.token;
        console.log('Token JWT de l\'admin:', token);
        return token;
      } else {
        console.log(`❌ Échec de la connexion de l'admin : ${loginResponse.data.message}`);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion de l\'admin:', error.response?.data || error.message);
      return null;
    }
  }

  // Récupérer les requêtes de patients depuis la blockchain
  static async getPatientRequests(organization?: OrganizationCode | string): Promise<PatientRequest[]> {
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
      
      if (response.data && response.data.result && response.data.result.data) {
        // Formatage des données - conversion de snake_case en camelCase et mapping des champs
        let requests = response.data.result.data.map((item: any) => ({
          requestId: item.request_id,
          patientId: item.patient_id,
          name: item.name,
          matricule: item.matricule ? item.matricule.toString() : '',
          ehrid: item.ehr_id ? item.ehr_id.toString() : '',
          numeroOrganisation: item.numero_organisation,
          etatRequest: item.etat_request || 'PENDING'
        }));
        
        // Normalize organization values: convert blockchain orgIds to frontend org codes
        requests = requests.map(req => ({
          ...req,
          numeroOrganisation: getOrganizationCode(req.numeroOrganisation)
        }));
        
        // Filtrer par organisation si spécifié
        if (organization) {
          // Ensure we're working with a valid organization code (HCA/HQA)
          const orgCode = getOrganizationCode(organization as string);
          console.log(`🔍 Filtrage des requêtes pour l'organisation: ${orgCode}`);
          
          requests = requests.filter(req => {
            // La comparaison doit se faire avec le code d'organisation frontend standardisé
            return req.numeroOrganisation === orgCode;
          });
          
          console.log(`📊 ${requests.length} requêtes trouvées pour l'organisation ${orgCode}`);
        }
        
        return requests;
      }
      
      console.error("❌ Format de réponse invalide:", response.data);
      return [];
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des requêtes:", error.response?.data || error.message);
      return [];
    }
  }

  // Récupérer les requêtes d'acteurs de santé depuis la blockchain
  static async getHealthActorRequests(organization?: OrganizationCode | string): Promise<HealthActorRequest[]> {
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
      
      if (response.data && response.data.result && response.data.result.data) {
        // Formatage des données - conversion de snake_case en camelCase
        let requests = response.data.result.data.map((item: any) => ({
          requestId: item.request_id,
          healthActorId: item.health_actor_id,
          nom: item.nom,
          prenom: item.prenom,
          matriculeActor: item.matricule_actor ? item.matricule_actor.toString() : '',
          numeroOrg: item.numero_org,
          role: item.role,
          etatRequest: item.etat_request || 'PENDING'
        }));
        
        // Normalize organization values: convert blockchain orgIds to frontend org codes
        requests = requests.map(req => ({
          ...req,
          numeroOrg: getOrganizationCode(req.numeroOrg)
        }));
        
        // Filtrer par organisation si spécifié
        if (organization) {
          // Ensure we're working with a valid organization code
          const orgCode = getOrganizationCode(organization as string);
          console.log(`🔍 Filtrage des requêtes pour l'organisation: ${orgCode}`);
          
          requests = requests.filter(req => {
            // La comparaison doit se faire avec le code d'organisation frontend standardisé
            return req.numeroOrg === orgCode;
          });
          
          console.log(`📊 ${requests.length} requêtes trouvées pour l'organisation ${orgCode}`);
        }
        
        return requests;
      }
      
      console.error("❌ Format de réponse invalide:", response.data);
      return [];
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

  // Fonction pour enregistrer un nouvel utilisateur
  static async registerUser(token: string, username: string, orgName: string): Promise<boolean> {
    try {
      console.log(`🔹 Enregistrement de l'utilisateur ${username} dans ${orgName}...`);
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/users`, {
        username: username,
        orgName: orgName
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.data.success) {
        console.log(`✅ Utilisateur ${username} enregistré avec succès dans ${orgName}`);
        return true;
      } else {
        console.log(`❌ Échec de l'enregistrement : ${response.data.message}`);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'enregistrement de l\'utilisateur:', error.response?.data || error.message);
      return false;
    }
  }

  // Fonction pour créer des identifiants pour un patient
  static async createPatientCredentials(patientId: string, organization: string): Promise<boolean> {
    try {
      console.log("🔹 Création des identifiants pour le patient...");
      
      const orgConfig = ORG_MAPPING[organization as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Formatage des identifiants
      const username = `${patientId}@${organization.toLowerCase()}.health`;
      const password = this.generateSecurePassword();
      
      console.log(`📝 Identifiants générés - Username: ${username}`);
      
      // Appel à l'API d'enregistrement blockchain
      const adminToken = await this.loginAdmin("admin", orgConfig.orgName);
      if (!adminToken) {
        throw new Error("Impossible d'obtenir le token d'authentification admin");
      }
      
      // Enregistrer l'utilisateur dans la blockchain
      const registrationSuccess = await this.registerUser(adminToken, username, orgConfig.orgName);
      if (!registrationSuccess) {
        throw new Error("Échec de l'enregistrement de l'utilisateur dans la blockchain");
      }
      
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
      // Pour la démo, on utilise localStorage
      const patientCredentials = JSON.parse(localStorage.getItem('medSecurePatientCredentials') || '{}');
      patientCredentials[patientId] = credentials;
      localStorage.setItem('medSecurePatientCredentials', JSON.stringify(patientCredentials));
      
      console.log("✅ Identifiants créés avec succès:", { entityId: patientId, username });
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création des identifiants:", error);
      return false;
    }
  }

  // Fonction pour créer des identifiants cryptographiques pour un patient
  static async createPatientCryptoMaterial(patientId: string, email: string, password: string): Promise<boolean> {
    try {
      console.log("🔹 Création du matériel cryptographique pour le patient...");
      
      // Récupérer les informations du patient depuis la base de données locale
      const patientRequests = await this.getPatientRequests();
      const patient = patientRequests.find(p => p.patientId === patientId);
      
      if (!patient) {
        throw new Error("Patient non trouvé");
      }
      
      const orgConfig = ORG_MAPPING[patient.numeroOrganisation as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Appel à l'API d'enregistrement blockchain
      const adminToken = await this.loginAdmin("admin", orgConfig.orgName);
      if (!adminToken) {
        throw new Error("Impossible d'obtenir le token d'authentification admin");
      }
      
      // Enregistrer l'utilisateur dans la blockchain avec l'email fourni par l'utilisateur
      const registrationSuccess = await this.registerUser(adminToken, email, orgConfig.orgName);
      if (!registrationSuccess) {
        throw new Error("Échec de l'enregistrement de l'utilisateur dans la blockchain");
      }
      
      // Stockage des identifiants (simule l'accès à une base de données)
      console.log("🔹 Stockage des identifiants...");
      const credentials = {
        entityId: patientId,
        username: email,
        password: password,
        organization: patient.numeroOrganisation,
        createdAt: new Date().toISOString()
      };
      
      // Pour la démo, on utilise localStorage
      const patientCredentials = JSON.parse(localStorage.getItem('medSecurePatientCredentials') || '{}');
      patientCredentials[patientId] = credentials;
      localStorage.setItem('medSecurePatientCredentials', JSON.stringify(patientCredentials));
      
      console.log("✅ Matériel cryptographique créé avec succès:", { entityId: patientId, username: email });
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du matériel cryptographique:", error);
      return false;
    }
  }

  // Fonction pour créer des identifiants pour un acteur de santé
  static async createHealthActorCredentials(actorId: string, organization: string): Promise<boolean> {
    try {
      console.log("🔹 Création des identifiants pour l'acteur de santé...");
      
      const orgConfig = ORG_MAPPING[organization as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Formatage des identifiants
      const username = `${actorId}@${organization.toLowerCase()}.health`;
      const password = this.generateSecurePassword();
      
      console.log(`📝 Identifiants générés - Username: ${username}`);
      
      // Appel à l'API d'enregistrement blockchain
      const adminToken = await this.loginAdmin("admin", orgConfig.orgName);
      if (!adminToken) {
        throw new Error("Impossible d'obtenir le token d'authentification admin");
      }
      
      // Enregistrer l'utilisateur dans la blockchain
      const registrationSuccess = await this.registerUser(adminToken, username, orgConfig.orgName);
      if (!registrationSuccess) {
        throw new Error("Échec de l'enregistrement de l'utilisateur dans la blockchain");
      }
      
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
      // Pour la démo, on utilise localStorage
      const healthActorCredentials = JSON.parse(localStorage.getItem('medSecureHealthActorCredentials') || '{}');
      healthActorCredentials[actorId] = credentials;
      localStorage.setItem('medSecureHealthActorCredentials', JSON.stringify(healthActorCredentials));
      
      console.log("✅ Identifiants créés avec succès:", { entityId: actorId, username });
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création des identifiants:", error);
      return false;
    }
  }

  // Fonction pour créer des identifiants cryptographiques pour un acteur de santé
  static async createHealthActorCryptoMaterial(actorId: string, email: string, password: string): Promise<boolean> {
    try {
      console.log("🔹 Création du matériel cryptographique pour l'acteur de santé...");
      
      // Récupérer les informations de l'acteur depuis la base de données locale
      const actorRequests = await this.getHealthActorRequests();
      const actor = actorRequests.find(a => a.healthActorId === actorId);
      
      if (!actor) {
        throw new Error("Acteur de santé non trouvé");
      }
      
      const orgConfig = ORG_MAPPING[actor.numeroOrg as 'HCA' | 'HQA'];
      if (!orgConfig) {
        throw new Error("Configuration d'organisation invalide");
      }
      
      // Appel à l'API d'enregistrement blockchain
      const adminToken = await this.loginAdmin("admin", orgConfig.orgName);
      if (!adminToken) {
        throw new Error("Impossible d'obtenir le token d'authentification admin");
      }
      
      // Enregistrer l'utilisateur dans la blockchain avec l'email fourni par l'utilisateur
      const registrationSuccess = await this.registerUser(adminToken, email, orgConfig.orgName);
      if (!registrationSuccess) {
        throw new Error("Échec de l'enregistrement de l'utilisateur dans la blockchain");
      }
      
      // Stockage des identifiants (simule l'accès à une base de données)
      console.log("🔹 Stockage des identifiants...");
      const credentials = {
        entityId: actorId,
        username: email,
        password: password,
        organization: actor.numeroOrg,
        createdAt: new Date().toISOString()
      };
      
      // Pour la démo, on utilise localStorage
      const actorCredentials = JSON.parse(localStorage.getItem('medSecureHealthActorCredentials') || '{}');
      actorCredentials[actorId] = credentials;
      localStorage.setItem('medSecureHealthActorCredentials', JSON.stringify(actorCredentials));
      
      console.log("✅ Matériel cryptographique créé avec succès:", { entityId: actorId, username: email });
      
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du matériel cryptographique:", error);
      return false;
    }
  }

  /**
   * Appeler la fonction SetRequest du contrat EHR pour une demande de consultation.
   * @param matricule ID du patient (number)
   * @param ehrId ID de l'EHR concerné (number)
   * @returns L'ID de la requête créée (number) ou null en cas d'échec
   */
  static async setEHRConsultationRequest(matricule: number, ehrId: number, actorId: string): Promise<number | null> {
    try {
      const orgName = "org2";
      const UserToken = await this.getAdminToken();
      if (!UserToken) throw new Error("Impossible de récupérer le token d'user");

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/ehr`,
        {
          fcn: "SetRequest",
          args: [matricule, "consultation_EHR_8", ehrId],
          peers: ["peer0.org2.example.com"]
        },
        { 
          headers: { 
            "Authorization": `Bearer ${UserToken}`, 
            "Content-Type": "application/json" 
          } 
        }
      );

      console.log("Réponse brute:", response.data);
      const resultStr = response.data.result?.result;
      const resultNum = parseInt(resultStr, 10);

      if (isNaN(resultNum)) {
        throw new Error(`La réponse ne contient pas un nombre valide: ${resultStr}`);
      }

      console.log("✅ Valeur numérique récupérée:", resultNum);
      return resultNum;
    } 
    catch (error) {
      console.error("❌ Erreur:", error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Appeler la fonction SetResponse du contrat EHR pour accepter/refuser une requête.
   * @param requestId ID unique de la requête blockchain (number)
   * @param patientId ID du patient (string)
   * @param status String ("ACCEPTED" ou "REJECTED")
   * @returns true si l'opération est réussie
   */
  static async setEHRRequestResponse(
    requestId: number,
    patientId: string,
    status: "ACCEPTED" | "REJECTED"
  ): Promise<boolean> {
    try {
      const adminToken = await this.getAdminToken();
      if (!adminToken) throw new Error("Impossible de récupérer le token d'admin");

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/ehr`,
        {
          fcn: "SetResponse",
          args: [requestId, patientId, "APPROVED"],
          peers: ["peer0.org2.example.com"]
        },
        { headers: { "Authorization": `Bearer ${adminToken}`, "Content-Type": "application/json" } }
      );

      console.log("✅ Réponse de la requête d'accès à l'EHR envoyée avec succès:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de l'approbation de la requête d'accès à l'EHR:", error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Récupérer un EHR via la méthode GetEHRByActor du contrat EHR
   * @param matricule Matricule (ID) du patient auquel l'acteur veut accéder
   * @param ehrId ID de l'EHR
   * @param requestType Type de requête ("consultation", etc)
   * @returns Données EHR ou null si accès refusé/n'existe pas
   */
  static async getEHRByActor(
    matricule: number,
    ehrId: number,
    requestType: string
  ): Promise<any | null> {
    try {
      const adminToken = await this.getAdminToken();
      if (!adminToken) throw new Error("Impossible de récupérer le token d'admin");

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/ehr`,
        {
          params: {
            fcn: "GetEHRByActor",
            args: JSON.stringify([String(matricule), String(ehrId), requestType]),
          },
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (
        response.data &&
        response.data.result &&
        response.data.result.data
      ) {
        console.log("✅ GetEHRByActor succès:", response.data.result.data);
        return response.data.result.data;
      }

      const errMsg = response.data?.message || response.data?.error || "Données non trouvées";
      console.error("❌ Erreur GetEHRByActor:", errMsg);
      return null;
    } catch (error: any) {
      console.error("❌ Exception GetEHRByActor:", error.response?.data || error.message);
      return null;
    }
  }
}
