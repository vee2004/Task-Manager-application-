import React from 'react';

/**
 * Reusable Badge Component for displaying priority levels
 * @param {Object} props - Component props
 * @param {string} props.priority - Priority level (Low, Medium, High)
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({ priority, className = '' }) => {
  // Priority-specific styles
  const priorityStyles = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200'
  };

  // Priority icons
  const priorityIcons = {
    Low: '🟢',
    Medium: '🟡',
    High: '🔴'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full 
        text-xs font-semibold border
        ${priorityStyles[priority] || priorityStyles.Medium}
        ${className}
      `}
    >
      <span>{priorityIcons[priority]}</span>
      <span>{priority}</span>
    </span>
  );
};

export default Badge;
