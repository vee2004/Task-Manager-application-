const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * Defines the structure of a task document in MongoDB
 */
const taskSchema = new mongoose.Schema({
  // Task title - required field
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  // Task description - optional but recommended
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Priority level - Low, Medium, or High
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Priority must be Low, Medium, or High'
    },
    default: 'Medium'
  },
  
  // Due date for the task
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  // Task completion status
  completed: {
    type: Boolean,
    default: false
  },
  
  // Timestamp for when task was created
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Enable automatic timestamps
  timestamps: true
});

// Create and export the Task model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
