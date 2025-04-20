
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Organization {
  name: string;
  code: string;
}

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
  login: (email: string, password: string, organization: string) => Promise<boolean>;
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

// Helper function to convert string organization to Organization object
const getOrganizationObject = (org: string): Organization => {
  if (org === 'HCA') {
    return { name: 'Hôpital HCA', code: 'org2' };
  } else if (org === 'HQA') {
    return { name: 'Hôpital HQA', code: 'org3' };
  }
  return { name: 'Unknown', code: 'unknown' };
};

// Context provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Fonction pour ajouter un nouvel utilisateur
  const addUser = (email: string, password: string, newUser: User) => {
    const users = getStoredUsers();
    users[email.toLowerCase()] = { password, user: newUser };
    localStorage.setItem('medSecureUsers', JSON.stringify(users));
  };

  // À l'initialisation, on crée les utilisateurs admin par défaut s'ils n'existent pas
  useEffect(() => {
    const users = getStoredUsers();
    
    // Création des utilisateurs admin par défaut s'ils n'existent pas
    if (!users['admin@hca.com']) {
      addUser('admin@HCA.com', 'admin', {
        id: 'admin1',
        email: 'admin@HCA.com',
        name: 'Admin HCA',
        role: 'admin',
        organization: { name: 'Hôpital HCA', code: 'org2' },
      });
      console.log("✅ Admin HCA créé avec succès");
    }
    
    if (!users['admin@hqa.com']) {
      addUser('admin@HQA.com', 'admin', {
        id: 'admin2',
        email: 'admin@HQA.com',
        name: 'Admin HQA',
        role: 'admin',
        organization: { name: 'Hôpital HQA', code: 'org3' },
      });
      console.log("✅ Admin HQA créé avec succès");
    }
  }, []);

  // Fonction pour rediriger l'utilisateur selon son rôle
  const redirectUserBasedOnRole = () => {
    // Navigation will be handled by the component using this function
    // We just return the path where the user should be redirected
    if (!user) return;
  };

  // Fonction d'authentification
  const login = async (email: string, password: string, org: string): Promise<boolean> => {
    console.log("Login attempt:", { email, password, org });
    const users = getStoredUsers();
    const normalizedEmail = email.toLowerCase();
    
    // Log des utilisateurs disponibles pour le débogage
    console.log("Available users:", Object.keys(users));
    
    // Vérification si l'email existe
    if (users[normalizedEmail]) {
      console.log("User found:", users[normalizedEmail]);
      
      // Vérifier le mot de passe
      if (users[normalizedEmail].password === password) {
        console.log("Password correct");
        
        // Vérifier l'organisation
        const userOrg = users[normalizedEmail].user.organization.name;
        const selectedOrg = org === 'HCA' ? 'Hôpital HCA' : 'Hôpital HQA';
        
        console.log("User org:", userOrg, "Selected org:", selectedOrg);
        
        if (userOrg.includes(selectedOrg)) {
          console.log("Organization valid");
          const loggedInUser = users[normalizedEmail].user;
          
          setUser(loggedInUser);
          setOrganization(loggedInUser.organization);
          
          // Sauvegarde dans le localStorage
          localStorage.setItem('medSecureUser', JSON.stringify(loggedInUser));
          localStorage.setItem('medSecureOrg', JSON.stringify(loggedInUser.organization));
          
          return true;
        } else {
          console.log("Organization mismatch");
        }
      } else {
        console.log("Password incorrect");
      }
    } else {
      console.log("User not found with email:", normalizedEmail);
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
    const storedOrg = localStorage.getItem('medSecureOrg');
    
    if (storedUser && storedOrg) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedOrg = JSON.parse(storedOrg);
        
        console.log("📱 Session utilisateur trouvée:", parsedUser.name, "Organisation:", parsedOrg.name);
        
        setUser(parsedUser);
        setOrganization(parsedOrg);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid storage data
        localStorage.removeItem('medSecureUser');
        localStorage.removeItem('medSecureOrg');
      }
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
  users[email.toLowerCase()] = { password, user: userData };
  localStorage.setItem('medSecureUsers', JSON.stringify(users));
}
