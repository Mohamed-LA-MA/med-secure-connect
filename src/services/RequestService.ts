
import { User } from '@/contexts/AuthContext';

export interface Request {
  id: string;
  type: 'EHR_CREATION' | 'EHR_ACCESS' | 'DOCUMENT_SHARE';
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

  static async getRequestsByPatientMatricule(matricule: number): Promise<Request[]> {
    const requests = this.getStoredRequests();
    // Convertir matricule en nombre pour la comparaison si nécessaire
    const matriculeNum = Number(matricule);
    return Object.values(requests).filter(req => Number(req.patientMatricule) === matriculeNum);
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
    
    requests[requestId] = request;
    this.saveRequests(requests);
    
    console.log(`✅ Statut de la requête ${requestId} mis à jour vers ${status}`);
    return request;
  }

  static async getRequestById(requestId: string): Promise<Request | null> {
    const requests = this.getStoredRequests();
    return requests[requestId] || null;
  }
}
