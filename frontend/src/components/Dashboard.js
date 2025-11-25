import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { elasticSearch } from '../utils/elasticSearch';
import { setupTaskAutomation, checkTasksAndNotify } from '../services/taskMailAutomation';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskFilter from './TaskFilter';
import Modal from './Modal';
import Button from './Button';
import SessionInfo from './SessionInfo';
import NotificationHistory from './NotificationHistory';

// API base URL
const API_URL = 'http://localhost:5000/api/tasks';

/**
 * Dashboard Component - Main task management interface
 * Shows after successful login
 */
const Dashboard = () => {
  const { user, logout } = useAuth();

  // State management
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null });
  
  // Filter state
  const [filters, setFilters] = useState({
    priority: 'All',
    status: 'All',
    sort: 'dueDate-asc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notification history state
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [nextAutomationRun, setNextAutomationRun] = useState(null);
  
  /**
   * Use custom debounce hook to optimize search performance
   * Delays search execution by 300ms after user stops typing
   * This prevents excessive re-renders and improves UX
   */
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * Fetch all tasks from the API
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please make sure the backend server is running.');
      setLoading(false);
    }
  };

  /**
   * Load tasks on component mount and setup task automation
   */
  useEffect(() => {
    fetchTasks();
    
    // Setup task mail automation (runs every 20 minutes)
    if (automationEnabled) {
      console.log('🤖 Initializing Task Mail Automation...');
      const cleanup = setupTaskAutomation(() => tasks, 20);
      
      // Calculate next run time
      const nextRun = new Date(Date.now() + 20 * 60 * 1000);
      setNextAutomationRun(nextRun);
      
      // Update next run time every minute
      const timerInterval = setInterval(() => {
        const nextRun = new Date(Date.now() + 20 * 60 * 1000);
        setNextAutomationRun(nextRun);
      }, 60 * 1000);
      
      // Cleanup on unmount
      return () => {
        cleanup();
        clearInterval(timerInterval);
      };
    }
  }, [automationEnabled]);

  /**
   * Apply filters and search to tasks using Elasticsearch-style search
   * Flow: Input → Debounce → Elastic Search → Filter → Sort → Render
   */
  useEffect(() => {
    console.log('🔍 Elasticsearch Flow Started');
    console.time('Search & Filter Operation');
    
    let result = [...tasks];

    // Step 1: Apply Elasticsearch-style search with debounced query
    // Features: Partial substring matching, case-insensitive, relevance scoring
    if (debouncedSearchQuery.trim()) {
      console.log('📊 Elasticsearch Query:', debouncedSearchQuery);
      
      result = elasticSearch(result, debouncedSearchQuery, {
        fields: ['title', 'description'], // Multi-field search
        minScore: 0, // Include all matches
        sortByRelevance: false, // We'll sort by user preference later
        includeHighlights: true // Get highlighted matches
      });
      
      console.log(`✅ Found ${result.length} matches with relevance scores`);
      
      // Log top matches with scores (for debugging)
      if (result.length > 0) {
        console.log('🏆 Top matches:');
        result.slice(0, 3).forEach((task, idx) => {
          console.log(`  ${idx + 1}. ${task.title} (Score: ${task._score.toFixed(2)})`);
        });
      }
    }

    // Step 2: Apply priority filter
    if (filters.priority !== 'All') {
      result = result.filter(task => task.priority === filters.priority);
      console.log(`🔖 Priority filter applied: ${filters.priority} (${result.length} tasks)`);
    }

    // Step 3: Apply status filter
    if (filters.status === 'Pending') {
      result = result.filter(task => !task.completed);
      console.log(`📋 Status filter applied: Pending (${result.length} tasks)`);
    } else if (filters.status === 'Completed') {
      result = result.filter(task => task.completed);
      console.log(`✅ Status filter applied: Completed (${result.length} tasks)`);
    }

    // Step 4: Apply sorting (user preference overrides relevance)
    result = sortTasks(result, filters.sort);
    console.log(`🔢 Sorted by: ${filters.sort}`);

    console.timeEnd('Search & Filter Operation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    setFilteredTasks(result);
  }, [tasks, filters, debouncedSearchQuery]);

  /**
   * Sort tasks based on selected criteria
   */
  const sortTasks = (tasksToSort, sortBy) => {
    const sorted = [...tasksToSort];

    switch (sortBy) {
      case 'dueDate-asc':
        return sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'dueDate-desc':
        return sorted.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      case 'priority-high':
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'priority-low':
        const priorityOrderLow = { High: 3, Medium: 2, Low: 1 };
        return sorted.sort((a, b) => priorityOrderLow[a.priority] - priorityOrderLow[b.priority]);
      case 'createdAt-desc':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'createdAt-asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return sorted;
    }
  };

  /**
   * Create a new task
   */
  const handleCreateTask = async (taskData) => {
    try {
      const response = await axios.post(API_URL, taskData);
      setTasks([response.data, ...tasks]);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Update an existing task
   */
  const handleUpdateTask = async (taskData) => {
    try {
      const response = await axios.put(`${API_URL}/${editingTask._id}`, {
        ...taskData,
        completed: editingTask.completed
      });
      
      setTasks(tasks.map(task =>
        task._id === editingTask._id ? response.data : task
      ));
      
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      setDeleteConfirm({ show: false, taskId: null });
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Toggle task completion status
   */
  const handleToggleComplete = async (taskId) => {
    try {
      const response = await axios.patch(`${API_URL}/${taskId}/toggle`);
      setTasks(tasks.map(task =>
        task._id === taskId ? response.data : task
      ));
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to update task status. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * Manually trigger task automation check
   */
  const handleManualAutomationRun = async () => {
    if (tasks.length === 0) {
      alert('No tasks available to check!');
      return;
    }
    
    console.log('🔘 Manual automation triggered by user');
    await checkTasksAndNotify(tasks, user?.email || 'demo@taskmanager.com');
    alert('✅ Automation check complete! Check console for details.');
  };

  /**
   * Toggle automation on/off
   */
  const handleToggleAutomation = () => {
    setAutomationEnabled(!automationEnabled);
    if (!automationEnabled) {
      alert('✅ Task Mail Automation Enabled! Checks will run every 20 minutes.');
    } else {
      alert('⏸️ Task Mail Automation Paused.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logout */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-3xl">📝</span>
                Task Manager
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.name || user?.email}!</p>
            </div>
            
            {/* User Info & Automation Controls */}
            <div className="flex items-center gap-3">
              {/* Automation Status Indicator */}
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${automationEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-600">
                    {automationEnabled ? '🤖 Automation Active' : '⏸️ Automation Paused'}
                  </span>
                </div>
                {automationEnabled && nextAutomationRun && (
                  <span className="text-xs text-gray-500 border-l border-gray-300 pl-2">
                    Next: {new Date(nextAutomationRun).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Notification History Button */}
              <button
                onClick={() => setShowNotificationHistory(true)}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors relative"
                title="View Notification History"
              >
                <span className="text-xl">📧</span>
              </button>

              {/* User Info */}
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              </div>

              {/* Logout Button */}
              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Automation Control Panel */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  Task Mail Automation
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    automationEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {automationEnabled ? '● ACTIVE' : '○ PAUSED'}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {automationEnabled ? (
                    <>
                      🔄 Checks pending tasks every 20 minutes • 
                      Next run: <span className="font-semibold">{nextAutomationRun ? new Date(nextAutomationRun).toLocaleTimeString() : 'Calculating...'}</span>
                    </>
                  ) : (
                    '⏸️ Automation is currently paused. Enable to receive task notifications.'
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManualAutomationRun}
                disabled={tasks.length === 0}
              >
                ⚡ Run Now
              </Button>
              <Button
                variant={automationEnabled ? "danger" : "primary"}
                size="sm"
                onClick={handleToggleAutomation}
              >
                {automationEnabled ? '⏸️ Pause' : '▶️ Enable'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNotificationHistory(true)}
              >
                📧 History
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Task Form */}
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          editTask={editingTask}
          onCancel={() => setEditingTask(null)}
        />

        {/* Filter Component */}
        <TaskFilter
          filters={filters}
          onFilterChange={setFilters}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          onEdit={(task) => {
            setEditingTask(task);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={(taskId) => setDeleteConfirm({ show: true, taskId })}
          onToggle={handleToggleComplete}
          loading={loading}
        />
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, taskId: null })}
        title="Confirm Delete"
        size="sm"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="danger"
              onClick={() => handleDeleteTask(deleteConfirm.taskId)}
            >
              Yes, Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm({ show: false, taskId: null })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-white shadow-md mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>© 2025 Task Manager | Built with React & MongoDB</p>
        </div>
      </footer>

      {/* Notification History Modal */}
      <NotificationHistory
        isOpen={showNotificationHistory}
        onClose={() => setShowNotificationHistory(false)}
      />

      {/* Session Information Component */}
      <SessionInfo />
    </div>
  );
};

export default Dashboard;
