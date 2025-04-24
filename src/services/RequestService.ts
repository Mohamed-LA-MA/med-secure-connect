import { User } from '@/contexts/AuthContext';
import { BlockchainService } from './BlockchainService';

export interface Request {
  id: number;
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

  static generateRequestIdINt(): number {
    return parseInt(Date.now().toString().slice(-6), 10);
  }

  static async createRequest(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> {
    const requests = this.getStoredRequests();
    const id = this.generateRequestIdINt();
    const now = new Date().toISOString();
    
    const newRequest: Request = {
      ...request,
      patientMatricule: Number(request.patientMatricule),
      id,
      createdAt: now,
      updatedAt: now
    };
    
    requests[id.toString()] = newRequest;
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
    const tempRequest = await this.createRequest({
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
    });
  
    const blockchainRequestId = await BlockchainService.setEHRConsultationRequest(
      patientMatricule, 
      ehrId,
      actorId
    );
  
    if (!blockchainRequestId) {
      throw new Error("Échec de la création de la requête dans la blockchain");
    }
  
    const requests = this.getStoredRequests();
    delete requests[tempRequest.id.toString()];
    
    const finalRequest: Request = {
      ...tempRequest,
      id: blockchainRequestId
    };
    
    requests[blockchainRequestId.toString()] = finalRequest;
    this.saveRequests(requests);
  
    console.log("✅ Requête mise à jour avec l'ID de la blockchain:", finalRequest);
    return finalRequest;
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
    requestId: number, 
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<Request | null> {
    const requests = this.getStoredRequests();
    const request = requests[requestId.toString()];
    
    if (!request) {
      console.error(`❌ Requête avec l'ID ${requestId} non trouvée`);
      return null;
    }
    
    request.status = status;
    request.updatedAt = new Date().toISOString();
    
    if (request.type === 'EHR_CONSULTATION' && status === 'ACCEPTED' && request.ehrId) {
      const result = await BlockchainService.setEHRRequestResponse(requestId, "PAT002", status);
      console.log("Résultat de la mise à jour blockchain:", result);
    }
    
    requests[requestId.toString()] = request;
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
    
    // Simuler l'appel à GetEHRByActor
    console.log(`🔹 Simulation d'appel blockchain: GetEHRByActor(${request.actorId}, ${request.ehrId}, "consultation")`);
    
    // Pour la démonstration, retourner un EHR factice
    return {
      id: request.ehrId,
      title: "Dossier médical du patient",
      createdAt: new Date().toISOString(),
      files: request.files || [],
      secretKey: request.secretKey || "",
      patientMatricule: request.patientMatricule
    };
  }

  static async getAllRequests(): Promise<Request[]> {
    const requests = this.getStoredRequests();
    return Object.values(requests);
  }
}
