import React, { useState, useEffect } from 'react';
import { getNotificationHistory, clearNotificationHistory } from '../services/taskMailAutomation';
import Button from './Button';
import Modal from './Modal';

/**
 * NotificationHistory Component
 * Displays history of sent email notifications from the automation service
 */
const NotificationHistory = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, overdue, due_soon, high_priority

  /**
   * Update history every 5 seconds
   */
  useEffect(() => {
    if (isOpen) {
      updateHistory();
      const interval = setInterval(updateHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateHistory = () => {
    const notifications = getNotificationHistory();
    setHistory(notifications);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all notification history?')) {
      clearNotificationHistory();
      updateHistory();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (subject) => {
    if (subject.includes('OVERDUE')) return '⚠️';
    if (subject.includes('Due Soon')) return '⏰';
    if (subject.includes('High Priority')) return '🔴';
    return '📋';
  };

  const filteredHistory = history.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return notification.subject.includes('OVERDUE');
    if (filter === 'due_soon') return notification.subject.includes('Due Soon');
    if (filter === 'high_priority') return notification.subject.includes('High Priority');
    return true;
  });

  return (
    <>
      {/* Main Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="📧 Notification History"
        size="lg"
      >
        <div className="space-y-4">
          {/* Header Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{history.length}</p>
              <p className="text-xs text-blue-800">Total Sent</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">
                {history.filter(n => n.subject.includes('OVERDUE')).length}
              </p>
              <p className="text-xs text-red-800">Overdue</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {history.filter(n => n.subject.includes('Due Soon')).length}
              </p>
              <p className="text-xs text-yellow-800">Due Soon</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {history.filter(n => n.subject.includes('High Priority')).length}
              </p>
              <p className="text-xs text-purple-800">High Priority</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            {['all', 'overdue', 'due_soon', 'high_priority'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {f === 'all' && '📧 All'}
                {f === 'overdue' && '⚠️ Overdue'}
                {f === 'due_soon' && '⏰ Due Soon'}
                {f === 'high_priority' && '🔴 High Priority'}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📭</p>
                <p>No notifications found</p>
              </div>
            ) : (
              filteredHistory.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => setSelectedNotification(notification)}
                  className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{getTypeIcon(notification.subject)}</span>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {notification.subject}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <span>📧 {notification.to}</span>
                        <span>⏰ {new Date(notification.sentAt).toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✓ {notification.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              🗑️ Clear History
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <Modal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          title="📧 Notification Details"
          size="lg"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedNotification.subject}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">To:</p>
                  <p className="font-semibold text-gray-800">{selectedNotification.to}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sent At:</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedNotification.sentAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Priority:</p>
                  <p className={`font-semibold ${
                    selectedNotification.priority === 'high' ? 'text-red-600' :
                    selectedNotification.priority === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {selectedNotification.priority.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Delivery Time:</p>
                  <p className="font-semibold text-green-600">{selectedNotification.deliveryTime}</p>
                </div>
              </div>
            </div>

            {/* Email Body Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-gray-800 mb-3">Email Preview:</h4>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNotification.body }}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <Button onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NotificationHistory;
