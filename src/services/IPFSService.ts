
import axios from 'axios';

const IPFS_API_URL = 'http://192.168.56.102:5000';

export interface FileUploadResponse {
  hash: string;
}

export class IPFSService {
  static async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      console.log("🔹 Envoi du fichier à IPFS:", file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${IPFS_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("✅ Fichier envoyé avec succès à IPFS:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'envoi du fichier à IPFS:", error.response?.data || error.message);
      throw new Error(`Erreur lors de l'envoi du fichier: ${error.message}`);
    }
  }
}
