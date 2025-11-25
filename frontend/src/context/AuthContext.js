import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Authentication Context
 * Manages user authentication state with sessionStorage and JWT simulation
 * 
 * Features:
 * - Session persists until browser tab closes
 * - Auto session expiry after inactivity
 * - JWT token simulation
 * - Activity tracking
 * - Secure session management
 */
const AuthContext = createContext(null);

// Session configuration
const SESSION_CONFIG = {
  EXPIRY_TIME: 30 * 60 * 1000, // 30 minutes in milliseconds
  WARNING_TIME: 5 * 60 * 1000,  // 5 minutes warning before expiry
  CHECK_INTERVAL: 60 * 1000,    // Check session every 60 seconds
  STORAGE_KEYS: {
    USER: 'task_manager_user',
    TOKEN: 'task_manager_token',
    AUTHENTICATED: 'task_manager_auth',
    TIMESTAMP: 'task_manager_timestamp',
    LAST_ACTIVITY: 'task_manager_last_activity'
  }
};

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
 * Wraps the app and provides authentication state with enhanced session management
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);

  /**
   * Check for existing session on mount and set up activity tracking
   */
  useEffect(() => {
    checkSession();
    setupActivityTracking();
    setupSessionMonitoring();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  /**
   * Generate simulated JWT token
   * In production, this would come from backend
   */
  const generateToken = (userData) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      email: userData.email,
      name: userData.name,
      iat: Date.now(),
      exp: Date.now() + SESSION_CONFIG.EXPIRY_TIME
    }));
    const signature = btoa(`signature_${Date.now()}`); // Simulated signature
    
    return `${header}.${payload}.${signature}`;
  };

  /**
   * Decode JWT token
   */
  const decodeToken = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  /**
   * Check if session is valid and not expired
   */
  const isSessionValid = () => {
    try {
      const token = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.TOKEN);
      const lastActivity = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
      
      if (!token || !lastActivity) return false;
      
      const payload = decodeToken(token);
      if (!payload) return false;
      
      // Check token expiry
      if (Date.now() > payload.exp) {
        console.log('🔒 Session expired (token)');
        return false;
      }
      
      // Check inactivity timeout
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceActivity > SESSION_CONFIG.EXPIRY_TIME) {
        console.log('🔒 Session expired (inactivity)');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  };

  /**
   * Check for existing session on mount
   */
  const checkSession = () => {
    try {
      const storedUser = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.USER);
      const isAuth = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.AUTHENTICATED);
      const token = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.TOKEN);

      if (storedUser && isAuth === 'true' && token) {
        // Validate session before restoring
        if (isSessionValid()) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          updateLastActivity(); // Update activity timestamp
          console.log('✅ Session restored from sessionStorage');
        } else {
          // Session expired, clear it
          clearSession();
          console.log('⚠️ Session expired, cleared sessionStorage');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update last activity timestamp
   */
  const updateLastActivity = () => {
    sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  };

  /**
   * Clear session storage
   */
  const clearSession = () => {
    Object.values(SESSION_CONFIG.STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
    // Also clear legacy keys for backward compatibility
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAuthenticated');
  };

  /**
   * Login user and store in session with JWT token
   */
  const login = (userData) => {
    try {
      const token = generateToken(userData);
      const timestamp = Date.now();
      
      // Store user data
      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.AUTHENTICATED, 'true');
      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.TOKEN, token);
      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.TIMESTAMP, timestamp.toString());
      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, timestamp.toString());
      
      setUser(userData);
      setIsAuthenticated(true);
      setSessionExpiring(false);
      
      console.log('✅ Login successful');
      console.log('🔑 JWT Token:', token.substring(0, 50) + '...');
      console.log('⏰ Session expires in:', SESSION_CONFIG.EXPIRY_TIME / 1000 / 60, 'minutes');
      
      return true;
    } catch (error) {
      console.error('❌ Error during login:', error);
      return false;
    }
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    try {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpiring(false);
      setSessionTimeLeft(null);
      
      console.log('✅ Logout successful, session cleared');
      return true;
    } catch (error) {
      console.error('❌ Error during logout:', error);
      return false;
    }
  };

  /**
   * Update user data in session
   */
  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
      updateLastActivity();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  /**
   * Extend session (refresh activity)
   */
  const extendSession = () => {
    if (!isAuthenticated) return false;
    
    try {
      updateLastActivity();
      setSessionExpiring(false);
      console.log('✅ Session extended');
      return true;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  };

  /**
   * Get session info
   */
  const getSessionInfo = () => {
    try {
      const lastActivity = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
      const token = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.TOKEN);
      
      if (!lastActivity || !token) return null;
      
      const payload = decodeToken(token);
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      const timeUntilExpiry = SESSION_CONFIG.EXPIRY_TIME - timeSinceActivity;
      
      return {
        issuedAt: new Date(payload.iat).toLocaleString(),
        expiresAt: new Date(payload.exp).toLocaleString(),
        lastActivity: new Date(parseInt(lastActivity)).toLocaleString(),
        timeUntilExpiry: Math.max(0, Math.floor(timeUntilExpiry / 1000 / 60)), // minutes
        isExpiring: timeUntilExpiry <= SESSION_CONFIG.WARNING_TIME
      };
    } catch (error) {
      console.error('Error getting session info:', error);
      return null;
    }
  };

  /**
   * Setup activity tracking
   * Tracks user interactions to update last activity timestamp
   */
  const setupActivityTracking = () => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (isAuthenticated) {
        updateLastActivity();
      }
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Store for cleanup
    window._activityTracking = { events: activityEvents, handler: handleActivity };
  };

  /**
   * Setup session monitoring
   * Periodically checks session validity and warns before expiry
   */
  const setupSessionMonitoring = () => {
    const interval = setInterval(() => {
      if (!isAuthenticated) return;
      
      const sessionInfo = getSessionInfo();
      if (!sessionInfo) return;
      
      setSessionTimeLeft(sessionInfo.timeUntilExpiry);
      
      // Check if session is expired
      if (!isSessionValid()) {
        console.log('⚠️ Session expired, logging out...');
        logout();
        alert('Your session has expired due to inactivity. Please login again.');
        return;
      }
      
      // Warn user if session is about to expire
      if (sessionInfo.isExpiring && !sessionExpiring) {
        setSessionExpiring(true);
        console.log(`⚠️ Session expiring in ${sessionInfo.timeUntilExpiry} minutes`);
      }
    }, SESSION_CONFIG.CHECK_INTERVAL);
    
    // Store for cleanup
    window._sessionMonitoring = interval;
  };

  /**
   * Cleanup event listeners and intervals
   */
  const cleanup = () => {
    // Remove activity tracking
    if (window._activityTracking) {
      const { events, handler } = window._activityTracking;
      events.forEach(event => {
        window.removeEventListener(event, handler);
      });
    }
    
    // Clear session monitoring
    if (window._sessionMonitoring) {
      clearInterval(window._sessionMonitoring);
    }
  };

  // Context value with enhanced session management
  const value = {
    user,
    isAuthenticated,
    loading,
    sessionExpiring,
    sessionTimeLeft,
    login,
    logout,
    updateUser,
    checkSession,
    extendSession,
    getSessionInfo,
    isSessionValid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
