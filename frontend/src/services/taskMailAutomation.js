/**
 * Task Mail Automation Service
 * Simulated cron job that runs every 20 minutes to check pending tasks
 * and send mock email notifications
 * 
 * Features:
 * - Checks for overdue tasks
 * - Checks for tasks due soon (within 24 hours)
 * - Logs notification details
 * - Simulates email sending
 * - Tracks notification history
 */

/**
 * Email notification types
 */
export const NotificationType = {
  OVERDUE: 'overdue',
  DUE_SOON: 'due_soon',
  HIGH_PRIORITY: 'high_priority',
  REMINDER: 'reminder'
};

/**
 * Email templates for different notification types
 */
const EmailTemplates = {
  overdue: (task) => ({
    subject: `⚠️ OVERDUE: ${task.title}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⚠️ Task Overdue</h2>
        </div>
        <div style="background: #fee2e2; padding: 20px; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-top: 0;">${task.title}</h3>
          <p style="color: #7f1d1d;">${task.description || 'No description provided'}</p>
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${task.priority === 'High' ? '#dc2626' : '#f59e0b'}">${task.priority}</span></p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Overdue By:</strong> ${getOverdueDuration(task.dueDate)}</p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #6b7280; margin: 0;">Please complete this task as soon as possible.</p>
        </div>
      </div>
    `,
    priority: 'high'
  }),

  due_soon: (task) => ({
    subject: `⏰ Due Soon: ${task.title}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⏰ Task Due Soon</h2>
        </div>
        <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin-top: 0;">${task.title}</h3>
          <p style="color: #78350f;">${task.description || 'No description provided'}</p>
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${task.priority === 'High' ? '#dc2626' : '#f59e0b'}">${task.priority}</span></p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Time Remaining:</strong> ${getTimeRemaining(task.dueDate)}</p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #6b7280; margin: 0;">This task is due within the next 24 hours.</p>
        </div>
      </div>
    `,
    priority: 'medium'
  }),

  high_priority: (task) => ({
    subject: `🔴 High Priority Task: ${task.title}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🔴 High Priority Task</h2>
        </div>
        <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-top: 0;">${task.title}</h3>
          <p style="color: #7f1d1d;">${task.description || 'No description provided'}</p>
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: #dc2626">High</span></p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Pending</p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #6b7280; margin: 0;">This is a high priority task that requires your attention.</p>
        </div>
      </div>
    `,
    priority: 'high'
  }),

  reminder: (task) => ({
    subject: `📋 Task Reminder: ${task.title}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">📋 Task Reminder</h2>
        </div>
        <div style="background: #dbeafe; padding: 20px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-top: 0;">${task.title}</h3>
          <p style="color: #1e3a8a;">${task.description || 'No description provided'}</p>
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Priority:</strong> ${task.priority}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Pending</p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #6b7280; margin: 0;">Reminder: Don't forget to complete this task.</p>
        </div>
      </div>
    `,
    priority: 'low'
  })
};

/**
 * Calculate overdue duration in human-readable format
 */
const getOverdueDuration = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = now - due;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
};

/**
 * Calculate time remaining in human-readable format
 */
const getTimeRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};

/**
 * Notification history storage
 */
let notificationHistory = [];

/**
 * Get notification history
 */
export const getNotificationHistory = () => {
  return [...notificationHistory];
};

/**
 * Clear notification history
 */
export const clearNotificationHistory = () => {
  notificationHistory = [];
};

/**
 * Simulate sending an email
 */
const sendMockEmail = async (to, subject, body, priority) => {
  return new Promise((resolve) => {
    // Simulate network delay (100-500ms)
    const delay = Math.floor(Math.random() * 400) + 100;
    
    setTimeout(() => {
      const notification = {
        id: Date.now() + Math.random(),
        to,
        subject,
        body,
        priority,
        sentAt: new Date().toISOString(),
        status: 'sent',
        deliveryTime: `${delay}ms`
      };
      
      // Add to history
      notificationHistory.unshift(notification);
      
      // Keep only last 100 notifications
      if (notificationHistory.length > 100) {
        notificationHistory = notificationHistory.slice(0, 100);
      }
      
      console.log('📧 Email Sent:', {
        to,
        subject,
        priority,
        deliveryTime: `${delay}ms`,
        timestamp: new Date().toLocaleString()
      });
      
      resolve(notification);
    }, delay);
  });
};

/**
 * Check for overdue tasks
 */
const checkOverdueTasks = (tasks) => {
  const now = new Date();
  return tasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < now;
  });
};

/**
 * Check for tasks due soon (within 24 hours)
 */
const checkDueSoonTasks = (tasks) => {
  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  
  return tasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate > now && dueDate <= twentyFourHoursLater;
  });
};

/**
 * Check for high priority pending tasks
 */
const checkHighPriorityTasks = (tasks) => {
  return tasks.filter(task => {
    return !task.completed && task.priority === 'High';
  });
};

/**
 * Main automation function - checks tasks and sends notifications
 */
export const checkTasksAndNotify = async (tasks, userEmail = 'demo@taskmanager.com') => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 TASK MAIL AUTOMATION TRIGGERED');
  console.log('⏰ Time:', new Date().toLocaleString());
  console.log('📊 Total Tasks:', tasks.length);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const notifications = [];
  
  // 1. Check for overdue tasks
  const overdueTasks = checkOverdueTasks(tasks);
  console.log(`⚠️  Overdue Tasks: ${overdueTasks.length}`);
  
  for (const task of overdueTasks) {
    const template = EmailTemplates.overdue(task);
    const notification = await sendMockEmail(
      userEmail,
      template.subject,
      template.body,
      template.priority
    );
    notifications.push({ ...notification, type: NotificationType.OVERDUE, task });
  }
  
  // 2. Check for tasks due soon
  const dueSoonTasks = checkDueSoonTasks(tasks);
  console.log(`⏰ Tasks Due Soon (24h): ${dueSoonTasks.length}`);
  
  for (const task of dueSoonTasks) {
    const template = EmailTemplates.due_soon(task);
    const notification = await sendMockEmail(
      userEmail,
      template.subject,
      template.body,
      template.priority
    );
    notifications.push({ ...notification, type: NotificationType.DUE_SOON, task });
  }
  
  // 3. Check for high priority tasks (not overdue or due soon)
  const highPriorityTasks = checkHighPriorityTasks(tasks)
    .filter(task => !overdueTasks.includes(task) && !dueSoonTasks.includes(task))
    .slice(0, 3); // Limit to 3 to avoid spam
  
  console.log(`🔴 High Priority Tasks: ${highPriorityTasks.length}`);
  
  for (const task of highPriorityTasks) {
    const template = EmailTemplates.high_priority(task);
    const notification = await sendMockEmail(
      userEmail,
      template.subject,
      template.body,
      template.priority
    );
    notifications.push({ ...notification, type: NotificationType.HIGH_PRIORITY, task });
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Total Notifications Sent: ${notifications.length}`);
  console.log('✅ AUTOMATION COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    timestamp: new Date().toISOString(),
    totalTasks: tasks.length,
    overdueTasks: overdueTasks.length,
    dueSoonTasks: dueSoonTasks.length,
    highPriorityTasks: highPriorityTasks.length,
    notificationsSent: notifications.length,
    notifications
  };
};

/**
 * Setup automated cron-like scheduler
 */
export const setupTaskAutomation = (getTasks, intervalMinutes = 20) => {
  console.log('🔧 Setting up Task Mail Automation...');
  console.log(`⏰ Interval: Every ${intervalMinutes} minutes`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Run immediately on setup
  const runAutomation = async () => {
    try {
      const tasks = await getTasks();
      if (tasks && tasks.length > 0) {
        await checkTasksAndNotify(tasks);
      } else {
        console.log('ℹ️  No tasks found, skipping automation run.\n');
      }
    } catch (error) {
      console.error('❌ Error in task automation:', error);
    }
  };
  
  // Run immediately
  runAutomation();
  
  // Set up interval
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(runAutomation, intervalMs);
  
  // Return cleanup function
  return () => {
    console.log('🛑 Stopping Task Mail Automation...');
    clearInterval(intervalId);
  };
};

export default {
  checkTasksAndNotify,
  setupTaskAutomation,
  getNotificationHistory,
  clearNotificationHistory,
  NotificationType
};
