
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
type Organization = 'HCA' | 'HQA';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'healthActor' | 'patient';
  organization: Organization;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  login: (email: string, password: string, organization: Organization) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Fake authentication function
  const login = async (email: string, password: string, org: Organization): Promise<boolean> => {
    // For demo purposes, check hardcoded admin credentials
    if (
      (email === 'admin@HCA.com' && password === 'admin' && org === 'HCA') ||
      (email === 'admin@HQA.com' && password === 'admin' && org === 'HQA')
    ) {
      // Create user object for admin
      const newUser = {
        id: '1',
        email,
        name: `Admin ${org}`,
        role: 'admin' as const,
        organization: org,
      };
      
      setUser(newUser);
      setOrganization(org);
      
      // Save to local storage for persistence
      localStorage.setItem('medSecureUser', JSON.stringify(newUser));
      localStorage.setItem('medSecureOrg', org);
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('medSecureUser');
    localStorage.removeItem('medSecureOrg');
  };

  // Check for existing user on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('medSecureUser');
    const storedOrg = localStorage.getItem('medSecureOrg') as Organization | null;
    
    if (storedUser && storedOrg) {
      setUser(JSON.parse(storedUser));
      setOrganization(storedOrg);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
