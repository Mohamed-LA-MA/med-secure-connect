import { createContext, useContext } from 'react';

export interface User {
  id: string;
  name: string;
  role: string;
  matricule: number;
  organization?: {
    id: string;
    name: string;
  };
  ehrid?: string;        // Ajout du champ ehrid
  dateOfBirth?: string;  // Ajout du champ dateOfBirth
  createdAt?: string;    // Ajout du champ createdAt
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider = AuthContext.Provider;

export const useAuth = () => useContext(AuthContext);
