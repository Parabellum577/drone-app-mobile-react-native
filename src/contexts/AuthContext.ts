import { createContext } from 'react';

interface AuthContextType {
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  checkAuth: async () => {},
  isAuthenticated: false,
}); 