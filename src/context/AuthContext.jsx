import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../constants/auth';

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
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check against demo users
    const demoUser = DEMO_USERS.find(user =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
    );

    if (demoUser) {
      const userData = {
        email: demoUser.email,
        name: demoUser.name,
        joinedAt: new Date().toISOString(),
        role: demoUser.email.includes('doctor') ? 'doctor' : 'patient'
      };
      setUser(userData);
      return { success: true };
    }

    // For demo purposes, allow any email with a simple password pattern
    if (password.length >= 6) {
      const userData = {
        email: email.toLowerCase(),
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        joinedAt: new Date().toISOString(),
        role: 'patient'
      };
      setUser(userData);
      return { success: true };
    }

    throw new Error('Invalid email or password');
  };

  const signUp = async (email, password, name) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    // Check if user already exists
    const existingUser = DEMO_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const userData = {
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      joinedAt: new Date().toISOString(),
      role: 'patient'
    };

    setUser(userData);
    return { success: true };
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
