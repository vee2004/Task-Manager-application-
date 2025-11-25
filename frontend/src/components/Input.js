import React from 'react';

/**
 * Reusable Input Component
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, email, date, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 */
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  label,
  error,
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
      
      {/* Input Field */}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...rest}
      />
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
