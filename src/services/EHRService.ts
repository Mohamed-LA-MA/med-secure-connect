
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
      
      console.log("Arguments pour AddEHRAbstract:", [
        ehrData.title,
        ehrData.matricule.toString(),
        ehrData.hash,
        filesJson,
        ehrData.secretKey
      ]);
      
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
      
      console.log("✅ Réponse complète de la création d'EHR:", response.data);
      
      if (response.data && response.data.result) {
        // La fonction AddEHRAbstract renvoie directement l'ID de l'EHR (un nombre)
        // Nous devons extraire cet ID de la réponse
        let ehrId: string;
        
        // Analyser la réponse pour extraire l'ID
        if (typeof response.data.result === 'string') {
          // Si la réponse est une chaîne, essayer de la parser comme JSON
          try {
            const resultObj = JSON.parse(response.data.result);
            ehrId = resultObj.toString();
          } catch (e) {
            // Si ce n'est pas un JSON valide, utiliser directement la valeur
            ehrId = response.data.result;
          }
        } else if (typeof response.data.result === 'number') {
          // Si la réponse est un nombre
          ehrId = response.data.result.toString();
        } else {
          // Si la réponse est déjà un objet
          ehrId = response.data.result.toString();
        }
        
        console.log("✅ EHR créé avec succès, ID:", ehrId);
        return ehrId;
      } else if (response.data && response.data.message) {
        // Certaines API renvoient le résultat dans le champ message
        return response.data.message.toString();
      } else {
        throw new Error(`Échec de la création de l'EHR: Réponse inattendue - ${JSON.stringify(response.data)}`);
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
      
      console.log("✅ Réponse complète de la mise à jour de l'ID EHR:", response.data);
      
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
