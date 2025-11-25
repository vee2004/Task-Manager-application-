import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

/**
 * SessionInfo Component
 * Displays session information and warnings
 * 
 * Features:
 * - Shows time until session expiry
 * - Warns when session is about to expire
 * - Allows session extension
 * - Shows session details
 */
const SessionInfo = () => {
  const { 
    isAuthenticated, 
    sessionExpiring, 
    sessionTimeLeft,
    extendSession,
    getSessionInfo 
  } = useAuth();
  
  const [showDetails, setShowDetails] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);

  /**
   * Update session details periodically
   */
  useEffect(() => {
    if (isAuthenticated) {
      updateSessionDetails();
      
      const interval = setInterval(updateSessionDetails, 10000); // Update every 10s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const updateSessionDetails = () => {
    const info = getSessionInfo();
    setSessionDetails(info);
  };

  const handleExtendSession = () => {
    const success = extendSession();
    if (success) {
      updateSessionDetails();
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Session Expiry Warning Banner */}
      {sessionExpiring && sessionTimeLeft !== null && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-50 border-b-2 border-yellow-400 px-4 py-3 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-800 font-semibold">
                  Session Expiring Soon!
                </p>
                <p className="text-yellow-700 text-sm">
                  Your session will expire in {sessionTimeLeft} minute{sessionTimeLeft !== 1 ? 's' : ''} due to inactivity.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExtendSession}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              🔄 Extend Session
            </Button>
          </div>
        </div>
      )}

      {/* Session Info Toggle Button */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-all flex items-center space-x-2 text-sm"
          title="Session Information"
        >
          <span>🔐</span>
          {sessionDetails && sessionDetails.timeUntilExpiry !== undefined && (
            <span className="font-mono">
              {Math.max(0, sessionDetails.timeUntilExpiry)}m
            </span>
          )}
        </button>
      </div>

      {/* Session Details Modal */}
      {showDetails && sessionDetails && (
        <div className="fixed bottom-20 right-4 z-30 bg-white rounded-lg shadow-2xl border border-gray-200 p-5 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="mr-2">🔐</span>
              Session Info
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Time Until Expiry */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-gray-600 text-xs mb-1">Time Until Expiry</p>
              <p className="text-2xl font-bold text-blue-600">
                {sessionDetails.timeUntilExpiry} min
              </p>
            </div>

            {/* Session Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${sessionDetails.isExpiring ? 'text-yellow-600' : 'text-green-600'}`}>
                  {sessionDetails.isExpiring ? '⚠️ Expiring Soon' : '✅ Active'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Session Started:</span>
                <span className="text-gray-800 font-mono text-xs">
                  {new Date(sessionDetails.issuedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Last Activity:</span>
                <span className="text-gray-800 font-mono text-xs">
                  {new Date(sessionDetails.lastActivity).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Expires At:</span>
                <span className="text-gray-800 font-mono text-xs">
                  {new Date(sessionDetails.expiresAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Storage Type:</span>
                <span className="text-gray-800 font-semibold">
                  sessionStorage
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <Button
                onClick={handleExtendSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              >
                🔄 Extend Session (30min)
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                💡 Activity tracking is enabled. Your session extends automatically with each interaction.
              </p>
            </div>
          </div>

          {/* Session Features */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">JWT Token</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Auto Expiry</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Activity Track</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Tab Close Clear</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionInfo;
