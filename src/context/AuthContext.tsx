import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextValue, User, UsersData } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users data on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/data/users.json');
        const data: UsersData = await response.json();
        setAllUsers(data.users);

        // Check if there's a saved user in localStorage
        const savedUserId = localStorage.getItem('loggedInUserId');
        if (savedUserId) {
          const savedUser = data.users.find((u) => u.id === savedUserId);
          if (savedUser) {
            setUser(savedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const login = (userId: string) => {
    const selectedUser = allUsers.find((u) => u.id === userId);
    if (selectedUser) {
      setUser(selectedUser);
      localStorage.setItem('loggedInUserId', userId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUserId');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
