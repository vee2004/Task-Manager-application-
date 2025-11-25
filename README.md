# Task Manager Application

A full-stack Task Manager application built with React, Node.js, Express, and MongoDB.

## Features

- ✅ Create tasks with title, description, priority, and due date
- ✅ View all tasks with detailed information
- ✅ Edit existing tasks
- ✅ Delete tasks with confirmation
- ✅ Mark tasks as complete/pending
- ✅ Filter tasks by priority and status
- ✅ Search tasks by title
- ✅ Responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React.js (Create React App)
- Tailwind CSS
- Axios
- React Hooks (useState, useEffect)

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
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskList.js
│   │   │   └── TaskItem.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
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
6. **Search**: Type in the search box to find tasks by title

## License

MIT
