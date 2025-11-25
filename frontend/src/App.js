import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskFilter from './components/TaskFilter';
import Modal from './components/Modal';
import Button from './components/Button';

// API base URL - update this if your backend runs on a different port
const API_URL = 'http://localhost:5000/api/tasks';

/**
 * Main App Component - Task Manager Application
 */
function App() {
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  /**
   * Debounce search query to optimize performance
   * Waits 300ms after user stops typing before applying search
   */
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    // Cleanup function to clear timeout if searchQuery changes
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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
   * Load tasks on component mount
   */
  useEffect(() => {
    fetchTasks();
  }, []);

  /**
   * Apply filters and search to tasks
   * Uses debounced search query for better performance
   */
  useEffect(() => {
    let result = [...tasks];

    // Apply priority filter
    if (filters.priority !== 'All') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Apply status filter
    if (filters.status === 'Pending') {
      result = result.filter(task => !task.completed);
    } else if (filters.status === 'Completed') {
      result = result.filter(task => task.completed);
    }

    // Apply case-insensitive search filter with debouncing
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    result = sortTasks(result, filters.sort);

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
      showSuccessMessage('Task created successfully! 🎉');
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
      showSuccessMessage('Task updated successfully! ✅');
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
      showSuccessMessage('Task deleted successfully! 🗑️');
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
      showSuccessMessage('Task status updated! ✨');
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to update task status. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Show success message
   */
  const showSuccessMessage = (message) => {
    // You can implement a toast notification here
    console.log(message);
  };

  /**
   * Handle edit task click
   */
  const handleEditClick = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteClick = (taskId) => {
    setDeleteConfirm({ show: true, taskId });
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            Task Manager
          </h1>
          <p className="text-gray-600 mt-2">Organize your tasks efficiently</p>
        </div>
      </header>

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
          onCancel={handleCancelEdit}
        />

        {/* Filter Component */}
        <TaskFilter
          filters={filters}
          onFilterChange={setFilters}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
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
    </div>
  );
}

export default App;
