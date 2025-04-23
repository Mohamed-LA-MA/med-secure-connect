
import { User } from '@/contexts/AuthContext';
import { BlockchainService } from './BlockchainService'; // AJOUT

export interface Request {
  id: string;
  type: 'EHR_CREATION' | 'EHR_ACCESS' | 'DOCUMENT_SHARE' | 'EHR_CONSULTATION';
  patientMatricule: number;
  patientName?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actorOrganization: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  title: string;
  description?: string;
  ehrId?: number;
  files?: {
    fileTitle: string;
    fileHash: string;
  }[];
  secretKey?: string;
}

export class RequestService {
  private static getStoredRequests(): Record<string, Request> {
    const storedRequests = localStorage.getItem('medSecureRequests');
    return storedRequests ? JSON.parse(storedRequests) : {};
  }

  private static saveRequests(requests: Record<string, Request>): void {
    localStorage.setItem('medSecureRequests', JSON.stringify(requests));
  }

  static generateRequestId(): string {
    return `REQ${Date.now().toString().slice(-6)}`;
  }

  static async createRequest(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> {
    const requests = this.getStoredRequests();
    const id = this.generateRequestId();
    const now = new Date().toISOString();
    
    // S'assurer que le patientMatricule est un nombre
    const newRequest: Request = {
      ...request,
      patientMatricule: Number(request.patientMatricule),
      id,
      createdAt: now,
      updatedAt: now
    };
    
    requests[id] = newRequest;
    this.saveRequests(requests);
    
    console.log("✅ Requête créée avec succès:", newRequest);
    return newRequest;
  }

  static async createConsultationRequest(
    patientMatricule: number, 
    ehrId: number,
    actorId: string,
    actorName: string,
    actorRole: string,
    actorOrganization: string,
    description?: string
  ): Promise<Request> {
    // Appel Blockchain pour enregistrer la demande de consultation !
    let blockchainRequestId: number | null = null;
    try {
      blockchainRequestId = await BlockchainService.setEHRConsultationRequest(patientMatricule, ehrId);
      if (!blockchainRequestId) {
        throw new Error("Erreur de création côté blockchain : ID non retourné");
      }
      console.log(`✅ Demande de consultation blockchain créée, ID: ${blockchainRequestId}`);
    } catch (err: any) {
      console.error("❌ Erreur Blockchain (SetRequest consultation):", err?.message || err);
      // On continue malgré tout, pour fallback local/demo.
    }

    const consultationRequest: Omit<Request, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'EHR_CONSULTATION',
      patientMatricule,
      actorId,
      actorName,
      actorRole,
      actorOrganization,
      status: 'PENDING',
      title: 'Demande de consultation de dossier médical',
      description: description || "Demande d'accès au dossier patient pour consultation médicale",
      ehrId
    };

    // id blockchain fictif/fallback injecté dans description
    if (blockchainRequestId) {
      consultationRequest.description =
        (consultationRequest.description || "") +
        ` (ID blockchain: ${blockchainRequestId})`;
    }

    return this.createRequest(consultationRequest);
  }

  static async getRequestsByPatientMatricule(matricule: number): Promise<Request[]> {
    console.log("Recherche des requêtes pour le matricule:", matricule, "type:", typeof matricule);
    const requests = this.getStoredRequests();
    // Convertir matricule en nombre pour la comparaison si nécessaire
    const matriculeNum = Number(matricule);
    
    const filteredRequests = Object.values(requests).filter(req => {
      const reqMatricule = Number(req.patientMatricule);
      console.log("Comparaison: reqMatricule =", reqMatricule, "matriculeNum =", matriculeNum, "égal?", reqMatricule === matriculeNum);
      return reqMatricule === matriculeNum;
    });
    
    console.log("Requêtes filtrées:", filteredRequests);
    return filteredRequests;
  }

  static async getRequestsByActor(actorId: string): Promise<Request[]> {
    const requests = this.getStoredRequests();
    return Object.values(requests).filter(req => req.actorId === actorId);
  }

  static async updateRequestStatus(
    requestId: string, 
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<Request | null> {
    const requests = this.getStoredRequests();
    const request = requests[requestId];
    
    if (!request) {
      console.error(`❌ Requête avec l'ID ${requestId} non trouvée`);
      return null;
    }
    
    request.status = status;
    request.updatedAt = new Date().toISOString();

    // Si c'est une demande de consultation et qu'elle est acceptée, appel SetResponse blockchain
    if (request.type === 'EHR_CONSULTATION' && request.ehrId) {
      try {
        // Sur la blockchain, l'ID est ID blockchain (optionnel en description) ou l'index local
        // Pour la démo, on essaie de retrouver l'ID blockchain depuis la description si présent
        let blockchainId = undefined;
        if (request.description && request.description.includes('ID blockchain:')) {
          const match = request.description.match(/ID blockchain:\s*(\d+)/);
          if (match) blockchainId = Number(match[1]);
        }
        // Fallback sur un index bidon local si besoin
        const blockchainRequestId: number = blockchainId || parseInt(request.id.replace(/\D/g, '')) || 0;

        // patientMatricule côté blockchain = patientId numérique
        const patientId = String(request.patientMatricule);

        const ok = await BlockchainService.setEHRRequestResponse(
          blockchainRequestId,
          patientId,
          status // "ACCEPTED" ou "REJECTED"
        );
        if (ok) {
          console.log("✅ Statut blockchain MAJ via SetResponse");
        } else {
          throw new Error("Erreur SetResponse Blockchain");
        }
      } catch (err: any) {
        console.error("❌ Erreur Blockchain (SetResponse):", err?.message || err);
      }
    }
    
    requests[requestId] = request;
    this.saveRequests(requests);
    
    console.log(`✅ Statut de la requête ${requestId} mis à jour vers ${status}`);
    return request;
  }

  static async getRequestById(requestId: string): Promise<Request | null> {
    const requests = this.getStoredRequests();
    return requests[requestId] || null;
  }

  static async getEHRByConsultationRequest(requestId: string): Promise<any | null> {
    const request = await this.getRequestById(requestId);
    if (!request || request.type !== 'EHR_CONSULTATION' || request.status !== 'ACCEPTED') {
      console.error("❌ Requête de consultation non valide ou non acceptée");
      return null;
    }

    // Utiliser la blockchain pour récupérer l’EHR
    let blockchainEHR: any | null = null;
    try {
      const actorMatricule = Number(request.actorId) || request.patientMatricule; // fallback
      blockchainEHR = await BlockchainService.getEHRByActor(
        actorMatricule,
        Number(request.ehrId),
        "consultation"
      );
      if (blockchainEHR) {
        console.log("✅ EHR récupéré de la blockchain:", blockchainEHR);
        return {
          id: request.ehrId,
          title: blockchainEHR.title || "Dossier médical du patient",
          createdAt: blockchainEHR.createdAt || new Date().toISOString(),
          files: blockchainEHR.files || request.files || [],
          secretKey: request.secretKey || "",
          patientMatricule: request.patientMatricule,
        };
      }
    } catch (err: any) {
      console.error("❌ Erreur Blockchain (GetEHRByActor):", err?.message || err);
    }

    // Fallback local (mode démo)
    return {
      id: request.ehrId,
      title: "Dossier médical du patient",
      createdAt: new Date().toISOString(),
      files: request.files || [],
      secretKey: request.secretKey || "",
      patientMatricule: request.patientMatricule
    };
  }
}
