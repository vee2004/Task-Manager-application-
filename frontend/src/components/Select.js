import React from 'react';

/**
 * Reusable Select/Dropdown Component
 * @param {Object} props - Component props
 * @param {string} props.name - Select name attribute
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler function
 * @param {Array} props.options - Array of option objects {value, label}
 * @param {string} props.label - Label text
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.className - Additional CSS classes
 */
const Select = ({
  name,
  value,
  onChange,
  options = [],
  label,
  required = false,
  className = '',
  ...rest
}) => {
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select Dropdown */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          bg-white cursor-pointer
          ${className}
        `}
        {...rest}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
