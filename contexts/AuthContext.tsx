import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApolloClient, useLazyQuery } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import { CURRENT_USER } from '../graphql/queries';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const client = useApolloClient();
  const [getCurrentUser] = useLazyQuery(CURRENT_USER, {
    onCompleted: (data) => {
      if (data.me) {
        setUser(data.me);
      } else {
        // If me returns null, clear auth state
        logout();
      }
      setInitialized(true);
    },
    onError: () => {
      logout();
      setInitialized(true);
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check token expiration
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // Token expired
          logout();
          setInitialized(true);
        } else {
          // Valid token, fetch current user
          getCurrentUser();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
        setInitialized(true);
      }
    } else {
      setInitialized(true);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    client.resetStore();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initialized,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};