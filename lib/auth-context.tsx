'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './api';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    weight: number;
    height: number;
    activityLevel: string;
    fitnessGoal: string;
    dietaryPreferences: string[];
    allergies: string[];
    dailyCalorieGoal: number;
    dailyProteinGoal: number;
    dailyCarbGoal: number;
    dailyFatGoal: number;
  };
  preferences: {
    units: string;
    notifications: {
      meals: boolean;
      water: boolean;
      workouts: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authAPI.me();
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('auth-token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('auth-token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      const { user, token } = response.data;
      
      localStorage.setItem('auth-token', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('auth-token');
      setUser(null);
    }
  };

  const updateUser = async (data: any) => {
    // This would typically call an update user API
    // For now, we'll refetch the user data
    await checkAuth();
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}