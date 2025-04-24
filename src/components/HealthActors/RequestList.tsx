import React, { useState, useEffect } from 'react';
import { RequestService, Request } from '@/services/RequestService';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequestListProps {
  onConsultEHR: (requestId: string) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ onConsultEHR }) => {
  const [requests, useState] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requests = await RequestService.getAllRequests();
        useState(requests);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Liste des Requêtes</h2>
      {requests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.actorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{request.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button onClick={() => onConsultEHR(request.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Aucune requête trouvée.</p>
      )}
    </div>
  );
};
