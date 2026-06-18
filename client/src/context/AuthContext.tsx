import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<unknown>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string, avatar?: File) => Promise<any>;
  evaluateRank: (reportsCount: number) => Promise<void>;
}

/**
 * React Context for global authentication state.
 * 
 * Provides the current user data, loading state, and helper functions (login, logout, etc.)
 * to any component wrapped inside the AuthProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * On initial mount, we ping the /auth/me endpoint to see if the user has a valid session.
   * This ensures the user stays logged in across page reloads.
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.data);
          setIsAuthenticated(true);
        }
      } catch {
        // Not authenticated
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);
    if (res.success) {
      setUser(res.data);
      setIsAuthenticated(true);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    const res = await authService.register(credentials);
    // Don't auto-login — user needs to verify email first
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (name: string, email: string, avatar?: File) => {
    let payload;
    if (avatar) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('avatar', avatar);
      payload = formData;
    } else {
      payload = { name, email };
    }
    
    const res = await authService.updateProfile(payload);
    if (res.success) {
      setUser(res.data);
    }
    return res;
  };

  const evaluateRank = async (reportsCount: number) => {
    if (!user) return;
    const res = await authService.evaluateRank(reportsCount);
    if (res.success && res.data?.updated) {
      setUser(prev => prev ? { ...prev, rank: res.data!.rank } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateProfile, evaluateRank }}>
      {children}
    </AuthContext.Provider>
  );
};
