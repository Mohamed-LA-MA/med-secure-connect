import axios from 'axios';
import { API_CONFIG, BlockchainService } from './BlockchainService';

export interface EHRFile {
  fileTitle: string;
  fileHash: string;
}

export interface EHRData {
  title: string;
  matricule: number;
  hash: string;
  ipfs: EHRFile[];
  secretKey: string;
}

export class EHRService {
  static async createEHR(ehrData: EHRData, username: string, orgName: string): Promise<string> {
    try {
      console.log("🔹 Création d'un EHR pour le patient...");
      
      // Obtenir le token d'authentification
      const token = await BlockchainService.loginAdmin(username, orgName);
      if (!token) {
        throw new Error("Impossible d'obtenir un token d'authentification");
      }
      
      // Préparer les arguments pour la création de l'EHR
      const filesJson = JSON.stringify(ehrData.ipfs);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/ehr`,
        {
          fcn: "AddEHRAbstract",
          args: [
            ehrData.title,
            ehrData.matricule.toString(),
            ehrData.hash,
            filesJson,
            ehrData.secretKey
          ],
          peers: ["peer0.org2.example.com"]
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data && response.data.success) {
        console.log("✅ EHR créé avec succès:", response.data);
        
        // Extraire l'ID de l'EHR de la réponse
        // Hypothèse : l'ID est renvoyé dans un format spécifique, ajustez selon l'API réelle
        const ehrId = response.data.ehrId || "1"; // Valeur par défaut si non disponible
        
        // Mettre à jour l'ID de l'EHR pour le patient
        await this.updatePatientEHRID(ehrData.matricule, parseInt(ehrId), token);
        
        return ehrId;
      } else {
        throw new Error(`Échec de la création de l'EHR: ${response.data?.message || "Erreur inconnue"}`);
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la création de l'EHR:", error.response?.data || error.message);
      throw error;
    }
  }
  
  static async updatePatientEHRID(patientMatricule: number, ehrId: number, actorId: string): Promise<boolean> {
    try {
      console.log(`🔹 Mise à jour de l'ID EHR pour le patient avec matricule ${patientMatricule}...`);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/channels/${API_CONFIG.CHANNEL}/chaincodes/${API_CONFIG.CHAINCODE_HEALTH_PATIENT}`,
        {
          fcn: "UpdatePatientEHRIDByMatricule",
          args: [
            actorId,
            patientMatricule.toString(),
            ehrId.toString()
          ],
          peers: ["peer0.org2.example.com"]
        },
        {
          headers: {
            "Authorization": `Bearer ${await BlockchainService.getAdminToken()}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data && response.data.success) {
        console.log("✅ ID EHR mis à jour avec succès pour le patient");
        return true;
      } else {
        console.error("❌ Échec de la mise à jour de l'ID EHR:", response.data);
        return false;
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la mise à jour de l'ID EHR:", error.response?.data || error.message);
      return false;
    }
  }
}
