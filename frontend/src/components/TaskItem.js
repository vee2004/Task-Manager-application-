import React from 'react';
import Badge from './Badge';
import Button from './Button';

/**
 * TaskItem Component - Individual task display card
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object
 * @param {Function} props.onEdit - Edit task handler
 * @param {Function} props.onDelete - Delete task handler
 * @param {Function} props.onToggle - Toggle complete status handler
 */
const TaskItem = ({ task, onEdit, onDelete, onToggle }) => {
  /**
   * Format date to readable string
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Check if task is overdue
   */
  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && !task.completed;
  };

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md p-5 mb-4 
        border-l-4 transition-all duration-200 hover:shadow-lg
        ${task.completed ? 'border-green-500 bg-gray-50' : 'border-blue-500'}
        ${isOverdue() ? 'border-red-500 bg-red-50' : ''}
      `}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Title */}
          <h3 
            className={`
              text-xl font-semibold mb-1
              ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}
            `}
          >
            {task.title}
          </h3>
          
          {/* Priority Badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge priority={task.priority} />
            
            {/* Completed Badge */}
            {task.completed && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                ✓ Completed
              </span>
            )}
            
            {/* Overdue Badge */}
            {isOverdue() && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                ⚠️ Overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className={`
          text-gray-600 mb-3 leading-relaxed
          ${task.completed ? 'line-through' : ''}
        `}>
          {task.description}
        </p>
      )}

      {/* Due Date */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <svg 
          className="w-4 h-4 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <span className="font-medium">Due:</span>
        <span className="ml-1">{formatDate(task.dueDate)}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={task.completed ? 'secondary' : 'success'}
          size="sm"
          onClick={() => onToggle(task._id)}
        >
          {task.completed ? '↩️ Mark Pending' : '✓ Mark Complete'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onEdit(task)}
          disabled={task.completed}
        >
          ✏️ Edit
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(task._id)}
        >
          🗑️ Delete
        </Button>
      </div>

      {/* Created Date (Footer) */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
        Created: {formatDate(task.createdAt)}
      </div>
    </div>
  );
};

export default TaskItem;
