import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRoleQuick: (role: UserRole) => void;
}

const USERS_DB: Record<string, { pass: string; user: User }> = {
  operador: {
    pass: 'operador123',
    user: {
      id: 'usr-op-01',
      username: 'operador',
      name: 'Carlos Oliveira',
      role: 'operador',
      cargo: 'Operador de Produção Industrial',
      avatarColor: 'from-amber-500 to-orange-600',
    },
  },
  mecanico: {
    pass: 'mecanico123',
    user: {
      id: 'usr-mec-01',
      username: 'mecanico',
      name: 'Roberto Silveira',
      role: 'mecanico',
      cargo: 'Mecânico de Manutenção Sênior',
      avatarColor: 'from-blue-600 to-indigo-700',
    },
  },
};

const STORAGE_AUTH_USER = 'manutencao_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_AUTH_USER);
    }
  }, [user]);

  const login = (username: string, pass: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const entry = USERS_DB[trimmedUser];

    if (!entry) {
      return { success: false, error: 'Usuário não encontrado. Use "operador" ou "mecanico".' };
    }

    if (entry.pass !== pass) {
      return { success: false, error: 'Senha incorreta para este usuário.' };
    }

    setUser(entry.user);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRoleQuick = (role: UserRole) => {
    const entry = USERS_DB[role];
    if (entry) {
      setUser(entry.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRoleQuick,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
