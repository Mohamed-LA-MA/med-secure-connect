
export interface OrganizationConfig {
  displayName: string;  // HCA or HQA
  orgId: string;       // org2 or org3
  peer: string;        // peer0.org2.example.com or peer0.org3.example.com
  admin: string;       // hospitalAdmin1 or hospitalAdmin2
  orgName: string;     // Org2 or Org3
}

export type OrganizationCode = 'HCA' | 'HQA';

export const ORG_MAPPING: Record<OrganizationCode, OrganizationConfig> = {
  HCA: {
    displayName: 'HCA',
    orgId: 'org2',
    peer: 'peer0.org2.example.com',
    admin: 'hospitalAdmin1',
    orgName: 'Org2'
  },
  HQA: {
    displayName: 'HQA',
    orgId: 'org3',
    peer: 'peer0.org3.example.com',
    admin: 'hospitalAdmin2',
    orgName: 'Org3'
  }
};

export const getDisplayName = (orgId: string): string => {
  const entry = Object.values(ORG_MAPPING).find(org => org.orgId === orgId);
  return entry?.displayName || orgId;
};

export const getBlockchainOrgId = (displayName: OrganizationCode): string => {
  return ORG_MAPPING[displayName]?.orgId || displayName;
};

// Convert blockchain orgId to organization code (HCA or HQA)
export const getOrganizationCode = (orgId: string): OrganizationCode => {
  if (orgId === 'org2') return 'HCA';
  if (orgId === 'org3') return 'HQA';
  // Default fallback - should be handled with proper validation
  return 'HCA';
};
