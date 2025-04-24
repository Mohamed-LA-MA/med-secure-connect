
import { createContext, useContext } from 'react';

export interface User {
  id: string;
  name: string;
  role: string;
  matricule: number;
  organization: {
    id: string;
    name: string;
    code: string;
  };
  email?: string;
  ehrid?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  organization: string; // Ajout de la propriété organization
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  organization: ''
});

export const AuthProvider = AuthContext.Provider;
export const useAuth = () => useContext(AuthContext);
