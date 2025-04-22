
import { User } from '@/contexts/AuthContext';

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
    const consultationRequest: Omit<Request, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'EHR_CONSULTATION',
      patientMatricule,
      actorId,
      actorName,
      actorRole,
      actorOrganization,
      status: 'PENDING',
      title: 'Demande de consultation de dossier médical',
      description: description || 'Demande d\'accès au dossier patient pour consultation médicale',
      ehrId
    };

    // Appeler la fonction du smart contract (simulée ici)
    console.log(`🔹 Simulation d'appel blockchain: SetRequest(${patientMatricule}, "consultation", ${ehrId})`);
    
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
    
    // Si c'est une demande de consultation et qu'elle est acceptée, simuler l'appel à SetResponse
    if (request.type === 'EHR_CONSULTATION' && status === 'ACCEPTED' && request.ehrId) {
      console.log(`🔹 Simulation d'appel blockchain: SetResponse(${requestId}, "${request.patientMatricule}", "ACCEPTED")`);
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
}
