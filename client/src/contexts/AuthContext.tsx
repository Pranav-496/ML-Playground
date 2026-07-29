import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api from "@/lib/api";

export interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_google_user: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleAuth: (credential: string) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "valoris_token";
const USER_KEY = "valoris_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Set/remove the Authorization header on the Axios instance
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Validate token on mount by calling /me
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      } catch {
        // Token is invalid or expired — logout
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthResponse = useCallback((data: { access_token: string; user: User }) => {
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await api.post("/auth/login", { identifier, password });
    handleAuthResponse(res.data);
  }, [handleAuthResponse]);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post("/auth/register", data);
    handleAuthResponse(res.data);
  }, [handleAuthResponse]);

  const googleAuth = useCallback(async (credential: string) => {
    const res = await api.post("/auth/google", { credential });
    handleAuthResponse(res.data);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common["Authorization"];
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        googleAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
