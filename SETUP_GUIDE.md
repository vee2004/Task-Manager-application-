# Task Manager - Setup Instructions

## ✅ Project Setup Complete!

All code files have been created successfully. Follow these steps to run the application:

---

## 📋 Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Install locally or use MongoDB Atlas
   - **Local MongoDB**: [Download here](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas**: [Sign up here](https://www.mongodb.com/cloud/atlas)

---

## 🚀 Installation & Running Instructions

### Step 1: Install Backend Dependencies

Open a terminal/command prompt and run:

```bash
cd c:\Users\VEERESHA\OneDrive\Desktop\TaskManager\backend
npm install
```

This will install:
- express
- mongoose
- cors
- dotenv
- nodemon (dev dependency)

### Step 2: Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas:**
- Update the `.env` file in the backend folder with your MongoDB Atlas connection string
- Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager`

### Step 3: Start Backend Server

```bash
cd c:\Users\VEERESHA\OneDrive\Desktop\TaskManager\backend
npm start
```

You should see:
- ✅ Successfully connected to MongoDB
- 📦 Database: taskmanager
- 🚀 Server is running on port 5000

**Keep this terminal running!**

---

### Step 4: Install Frontend Dependencies

Open a **NEW terminal/command prompt** and run:

```bash
cd c:\Users\VEERESHA\OneDrive\Desktop\TaskManager\frontend
npm install
```

This will install:
- react
- react-dom
- react-scripts
- axios
- tailwindcss
- autoprefixer
- postcss

**Note:** This may take 3-5 minutes depending on your internet connection.

### Step 5: Start Frontend Application

```bash
cd c:\Users\VEERESHA\OneDrive\Desktop\TaskManager\frontend
npm start
```

The application will automatically open in your browser at:
**http://localhost:3000**

---

## 🎯 Using the Application

### 1. **Add a Task**
   - Fill in the form at the top:
     - Title (required, 3-100 characters)
     - Description (optional, max 500 characters)
     - Priority (Low, Medium, High)
     - Due Date (required, cannot be in the past)
   - Click "➕ Add Task"

### 2. **View Tasks**
   - All tasks are displayed below the form
   - See task statistics (Total, Pending, Completed, Overdue)
   - Each task shows:
     - Title and description
     - Priority badge (🟢 Low, 🟡 Medium, 🔴 High)
     - Due date
     - Completion status
     - Action buttons

### 3. **Filter & Search**
   - **Search**: Type in the search box to find tasks by title
   - **Filter by Priority**: Select Low/Medium/High
   - **Filter by Status**: Show All/Pending/Completed tasks
   - **Sort**: By due date, priority, or creation date
   - **Reset Filters**: Click "🔄 Reset All Filters"

### 4. **Edit a Task**
   - Click "✏️ Edit" button on any task
   - The form will populate with the task data
   - Make changes and click "✏️ Update Task"
   - Click "✖️ Cancel" to cancel editing

### 5. **Delete a Task**
   - Click "🗑️ Delete" button
   - Confirm deletion in the popup modal
   - Task will be permanently deleted

### 6. **Toggle Completion**
   - Click "✓ Mark Complete" to mark task as done
   - Click "↩️ Mark Pending" to mark completed task as pending
   - Completed tasks are grayed out with a strikethrough

---

## 📁 Project Structure

```
TaskManager/
├── backend/                    # Node.js/Express backend
│   ├── models/
│   │   └── Task.js            # MongoDB Task schema
│   ├── routes/
│   │   └── tasks.js           # API routes
│   ├── server.js              # Express server setup
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.js       # Priority badge component
│   │   │   ├── Button.js      # Reusable button
│   │   │   ├── Input.js       # Reusable input field
│   │   │   ├── Select.js      # Reusable dropdown
│   │   │   ├── Modal.js       # Reusable modal
│   │   │   ├── TaskForm.js    # Add/Edit task form
│   │   │   ├── TaskFilter.js  # Filter & search
│   │   │   ├── TaskList.js    # Task list container
│   │   │   └── TaskItem.js    # Individual task card
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles + Tailwind
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── postcss.config.js      # PostCSS configuration
│
└── README.md                   # Project documentation
```

---

## 🔌 API Endpoints

The backend provides these REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem:** "MongoDB connection error"
- **Solution:** Ensure MongoDB is running
  - For local: Run `mongod` in a terminal
  - For Atlas: Check your connection string in `.env`

**Problem:** "Port 5000 already in use"
- **Solution:** Change port in `backend/.env`:
  ```
  PORT=5001
  ```
  Then update `frontend/src/App.js` API_URL to match

### Frontend Issues

**Problem:** "npm install" fails
- **Solution:** 
  - Delete `node_modules` folder and `package-lock.json`
  - Run `npm install` again
  - Make sure you have internet connection

**Problem:** "Failed to load tasks"
- **Solution:** 
  - Ensure backend server is running on port 5000
  - Check browser console for errors
  - Verify API_URL in `frontend/src/App.js`

**Problem:** Tailwind styles not working
- **Solution:**
  - Make sure all config files exist:
    - `tailwind.config.js`
    - `postcss.config.js`
  - Restart the frontend server: `npm start`

---

## 🎨 Features Implemented

✅ **CRUD Operations**
- Create tasks with validation
- Read/Display all tasks
- Update existing tasks
- Delete with confirmation

✅ **Task Properties**
- Title (required)
- Description (optional)
- Priority (Low/Medium/High)
- Due Date (required)
- Completion Status

✅ **UI/UX Features**
- Responsive design with Tailwind CSS
- Reusable components (Button, Input, Select, Modal, Badge)
- Form validation with error messages
- Loading states
- Empty states
- Task statistics dashboard

✅ **Filtering & Search**
- Filter by priority
- Filter by status (All/Pending/Completed)
- Search by title
- Multiple sort options
- Active filter indicators

✅ **Additional Features**
- Overdue task detection
- Delete confirmation modal
- Edit mode with cancel option
- Task count statistics
- Clean, modern UI design
- Smooth animations and transitions

---

## 💡 Usage Tips

1. **Start with the backend** - Always start the backend server first before the frontend
2. **Keep terminals open** - You need two terminals running simultaneously
3. **Check MongoDB** - Ensure MongoDB is running before starting the backend
4. **Clear browser cache** - If you see stale data, clear your browser cache
5. **Use Chrome DevTools** - Check the Network tab for API call issues

---

## 📝 Notes

- All code is well-commented for easy understanding
- Components are reusable and follow React best practices
- The application uses React Hooks (useState, useEffect)
- Tailwind CSS is configured for responsive design
- Error handling is implemented on both frontend and backend

---

## 🎓 Learning Objectives Met

This project demonstrates:
- ✅ React fundamentals and hooks
- ✅ Component structure and reusability
- ✅ Props and state management
- ✅ REST API integration with Axios
- ✅ MongoDB/Mongoose schema design
- ✅ Express.js server setup
- ✅ CORS configuration
- ✅ Form validation
- ✅ Tailwind CSS styling
- ✅ Clean code with proper naming and comments

---

## 🚀 Next Steps

To enhance the application further, consider adding:
- User authentication
- Task categories/tags
- Due date reminders
- Task assignment to users
- File attachments
- Comments on tasks
- Dark mode
- Export tasks to CSV/PDF

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check browser console for errors
5. Review terminal output for error messages

---

**Enjoy using your Task Manager! 🎉**
