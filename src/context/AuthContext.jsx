import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticate } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medbuddy_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('medbuddy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medbuddy_user');
    }
  }, [user]);

  const signIn = async (email, password) => {
    try {
      const userData = await authenticate(email, password);
      setUser(userData);
      return { success: true };
    } catch (err) {
      throw new Error(err.message || 'Invalid email or password');
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const userData = await authenticate(email, password, name, true);
      setUser(userData);
      return { success: true };
    } catch (err) {
      throw new Error(err.message || 'Signup failed');
    }
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signOut,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
