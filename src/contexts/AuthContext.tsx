
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  redirectUserBasedOnRole: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Récupération des utilisateurs du localStorage
const getStoredUsers = (): Record<string, { password: string, user: User }> => {
  const storedUsers = localStorage.getItem('medSecureUsers');
  return storedUsers ? JSON.parse(storedUsers) : {};
};

// Context provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Fonction pour ajouter un nouvel utilisateur
  const addUser = (email: string, password: string, newUser: User) => {
    const users = getStoredUsers();
    users[email] = { password, user: newUser };
    localStorage.setItem('medSecureUsers', JSON.stringify(users));
  };

  // À l'initialisation, on crée les utilisateurs admin par défaut s'ils n'existent pas
  useEffect(() => {
    const users = getStoredUsers();
    
    // Création des utilisateurs admin par défaut s'ils n'existent pas
    if (!users['admin@HCA.com']) {
      addUser('admin@HCA.com', 'admin', {
        id: 'admin1',
        email: 'admin@HCA.com',
        name: 'Admin HCA',
        role: 'admin',
        organization: 'HCA',
      });
    }
    
    if (!users['admin@HQA.com']) {
      addUser('admin@HQA.com', 'admin', {
        id: 'admin2',
        email: 'admin@HQA.com',
        name: 'Admin HQA',
        role: 'admin',
        organization: 'HQA',
      });
    }
  }, []);

  // Fonction pour rediriger l'utilisateur selon son rôle
  const redirectUserBasedOnRole = () => {
    // Navigation will be handled by the component using this function
    // We just return the path where the user should be redirected
    if (!user) return;
  };

  // Fonction d'authentification
  const login = async (email: string, password: string, org: Organization): Promise<boolean> => {
    const users = getStoredUsers();
    
    // Vérification si l'email existe et si le mot de passe correspond
    if (users[email] && users[email].password === password && users[email].user.organization === org) {
      const loggedInUser = users[email].user;
      
      setUser(loggedInUser);
      setOrganization(org);
      
      // Sauvegarde dans le localStorage
      localStorage.setItem('medSecureUser', JSON.stringify(loggedInUser));
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

  // Vérification s'il existe un utilisateur connecté
  useEffect(() => {
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
        redirectUserBasedOnRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Fonction exportée pour ajouter un nouvel utilisateur (utilisée par les composants)
export function addNewUser(email: string, password: string, userData: User) {
  const users = getStoredUsers();
  users[email] = { password, user: userData };
  localStorage.setItem('medSecureUsers', JSON.stringify(users));
}
