import React from 'react';
import TaskItem from './TaskItem';

/**
 * TaskList Component - Display list of tasks
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onEdit - Edit task handler
 * @param {Function} props.onDelete - Delete task handler
 * @param {Function} props.onToggle - Toggle complete status handler
 * @param {boolean} props.loading - Loading state
 */
const TaskList = ({ tasks, onEdit, onDelete, onToggle, loading = false }) => {
  /**
   * Calculate task statistics
   */
  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => {
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && !task.completed;
    }).length;

    return { total, completed, pending, overdue };
  };

  const stats = getStats();

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <svg 
            className="mx-auto h-24 w-24 text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Tasks Found
          </h3>
          <p className="text-gray-500">
            Start by creating your first task above!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Task Statistics */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>

          {/* Pending Tasks */}
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>

          {/* Completed Tasks */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          {/* Overdue Tasks */}
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Tasks ({tasks.length})
        </h2>
        
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
