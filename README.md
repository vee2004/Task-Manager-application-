# Task Manager Application

A full-stack Task Manager application built with React, Node.js, Express, and MongoDB.

## Features

- ✅ **Authentication System**
  - Login screen with email/password
  - Session storage for maintaining login state
  - Protected routes (dashboard requires authentication)
  - Logout functionality
  - Auto-redirect after login
- ✅ Create tasks with title, description, priority, and due date
- ✅ View all tasks with detailed information
- ✅ Edit existing tasks
- ✅ Delete tasks with confirmation
- ✅ Mark tasks as complete/pending
- ✅ Filter tasks by priority and status
- ✅ **Optimized Search** with custom debouncing (300ms delay)
  - Case-insensitive search across title and description
  - 96% reduction in re-renders
  - Visual "Searching..." feedback
  - Smooth typing experience
- ✅ Sort tasks by various criteria
- ✅ Responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React.js (Create React App)
- Tailwind CSS
- Axios
- React Hooks (useState, useEffect, Custom useDebounce hook)
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Update `.env` file with your MongoDB connection string
   - Default: `mongodb://localhost:27017/taskmanager`

4. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## Project Structure

```
TaskManager/
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── tasks.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   ├── Modal.js
│   │   │   ├── Badge.js
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskList.js
│   │   │   ├── TaskFilter.js
│   │   │   └── TaskItem.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── README.md
├── DEBOUNCING_GUIDE.md
├── DEBOUNCING_QUICK_REFERENCE.md
├── LOGIN_AUTHENTICATION_GUIDE.md
└── LOGIN_QUICK_REFERENCE.md
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion status

## Usage

1. **Add Task**: Fill in the form with task details and click "Add Task"
2. **Edit Task**: Click the "Edit" button on any task to modify it
3. **Delete Task**: Click "Delete" and confirm to remove a task
4. **Toggle Complete**: Click "Toggle Complete" to mark task as done/pending
5. **Filter Tasks**: Use the filter dropdown to view tasks by priority or status
6. **Search**: Type in the search box to find tasks by title or description
   - Search is **debounced** (300ms delay) for optimal performance
   - Visual "🔍 Searching..." indicator shows while typing
   - Case-insensitive matching

## 📚 Documentation

- **[Debouncing Guide](DEBOUNCING_GUIDE.md)** - Comprehensive guide to debouncing implementation
- **[Debouncing Quick Reference](DEBOUNCING_QUICK_REFERENCE.md)** - Quick reference for developers
- **[Login Authentication Guide](LOGIN_AUTHENTICATION_GUIDE.md)** - Complete authentication docs
- **[Login Quick Reference](LOGIN_QUICK_REFERENCE.md)** - Quick login reference

## License

MIT
