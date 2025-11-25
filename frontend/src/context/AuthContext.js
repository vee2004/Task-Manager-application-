import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Authentication Context
 * Manages user authentication state and session storage
 */
const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Check for existing session on mount
   */
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Check if user has active session
   */
  const checkSession = () => {
    try {
      const storedUser = sessionStorage.getItem('user');
      const isAuth = sessionStorage.getItem('isAuthenticated');

      if (storedUser && isAuth === 'true') {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user and store in session
   */
  const login = (userData) => {
    try {
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('isAuthenticated', 'true');
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    try {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isAuthenticated');
      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  /**
   * Update user data
   */
  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
