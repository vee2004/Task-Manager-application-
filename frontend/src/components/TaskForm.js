import React, { useState, useEffect } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';

/**
 * TaskForm Component - Form for adding and editing tasks
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Object} props.editTask - Task object to edit (null for new task)
 * @param {Function} props.onCancel - Cancel handler for edit mode
 */
const TaskForm = ({ onSubmit, editTask = null, onCancel }) => {
  // Form state management
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Priority options for select dropdown
  const priorityOptions = [
    { value: 'Low', label: 'Low Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'High', label: 'High Priority' }
  ];

  /**
   * Populate form when editing existing task
   */
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || '',
        description: editTask.description || '',
        priority: editTask.priority || 'Medium',
        dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : ''
      });
    }
  }, [editTask]);

  /**
   * Handle input field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Description validation (optional but with length limit)
    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit form data
    onSubmit(formData);

    // Clear form after successful submission (only if not editing)
    if (!editTask) {
      clearForm();
    }
  };

  /**
   * Clear form fields and errors
   */
  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: ''
    });
    setErrors({});
  };

  /**
   * Handle cancel action in edit mode
   */
  const handleCancel = () => {
    clearForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {editTask ? 'Edit Task' : 'Add New Task'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <Input
          type="text"
          name="title"
          label="Task Title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title..."
          required
          error={errors.title}
        />

        {/* Description Textarea */}
        <div className="mb-4">
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description..."
            rows="3"
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.description ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Priority and Due Date in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Select */}
          <Select
            name="priority"
            label="Priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            required
          />

          {/* Due Date Input */}
          <Input
            type="date"
            name="dueDate"
            label="Due Date"
            value={formData.dueDate}
            onChange={handleChange}
            required
            error={errors.dueDate}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
          >
            {editTask ? '✏️ Update Task' : '➕ Add Task'}
          </Button>

          {editTask && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCancel}
            >
              ✖️ Cancel
            </Button>
          )}

          {!editTask && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={clearForm}
            >
              🔄 Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
