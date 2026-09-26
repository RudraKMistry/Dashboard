// Default expense categories with emoji and colors
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', emoji: '🍔', color: '#FFB347' },
  { id: 'transport', name: 'Transport / Fuel', emoji: '🚗', color: '#4FC3F7' },
  { id: 'rent', name: 'Rent / Housing', emoji: '🏠', color: '#FF6EAA' },
  { id: 'utilities', name: 'Utilities', emoji: '💡', color: '#FFD93D' },
  { id: 'shopping', name: 'Shopping / Clothing', emoji: '🛍️', color: '#FF6B6B' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#6C63FF' },
  { id: 'health', name: 'Health & Medical', emoji: '🏥', color: '#00E5A0' },
  { id: 'education', name: 'Education', emoji: '📚', color: '#4FC3F7' },
  { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#00E5A0' },
  { id: 'personal', name: 'Personal Care', emoji: '💅', color: '#FF6EAA' },
  { id: 'gifts', name: 'Gifts & Donations', emoji: '🎁', color: '#FFB347' },
  { id: 'travel', name: 'Travel / Vacation', emoji: '✈️', color: '#00D4FF' },
  { id: 'emi', name: 'EMI / Loan Payments', emoji: '🏦', color: '#FF6B6B' },
  { id: 'investments', name: 'Investments / SIP', emoji: '📈', color: '#6C63FF' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary / Wages', emoji: '💰', color: '#00E5A0' },
  { id: 'freelance', name: 'Freelance / Side Hustle', emoji: '💻', color: '#4FC3F7' },
  { id: 'business', name: 'Business Revenue', emoji: '🏢', color: '#6C63FF' },
  { id: 'dividends', name: 'Investments / Dividends', emoji: '📊', color: '#FFB347' },
];

export const TASK_CATEGORIES = [
  { id: 'work', name: 'Work', emoji: '💼', color: '#4FC3F7' },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#FFB347' },
  { id: 'health', name: 'Health & Fitness', emoji: '💪', color: '#00E5A0' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#FFD93D' },
  { id: 'learning', name: 'Learning / Study', emoji: '📖', color: '#6C63FF' },
  { id: 'home', name: 'Home / Chores', emoji: '🧹', color: '#FF6EAA' },
  { id: 'side_project', name: 'Side Project', emoji: '🚀', color: '#00D4FF' },
  { id: 'social', name: 'Social', emoji: '👥', color: '#FF6B6B' },
];

export const PRIORITIES = [
  { id: 'high', name: 'High', color: '#FF6B6B' },
  { id: 'medium', name: 'Medium', color: '#FFB347' },
  { id: 'low', name: 'Low', color: '#00E5A0' },
];

export const TASK_STATUSES = [
  { id: 'todo', name: 'To Do' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'done', name: 'Done' },
];

export const DEFAULT_HABITS = [
  { id: 'water', name: 'Drink Water', emoji: '💧', color: '#4FC3F7', frequency: 'daily', type: 'quantitative', target: 8, unit: 'glasses' },
  { id: 'exercise', name: 'Exercise', emoji: '🏃', color: '#00E5A0', frequency: 'daily', type: 'binary' },
  { id: 'read', name: 'Read 30 min', emoji: '📖', color: '#6C63FF', frequency: 'daily', type: 'binary' },
  { id: 'meditate', name: 'Meditate', emoji: '🧘', color: '#FFB347', frequency: 'daily', type: 'binary' },
  { id: 'vitamins', name: 'Take Vitamins', emoji: '💊', color: '#FF6EAA', frequency: 'daily', type: 'binary' },
  { id: 'sleep', name: 'Sleep by 11 PM', emoji: '😴', color: '#4FC3F7', frequency: 'daily', type: 'binary' },
  { id: 'journal', name: 'Journal', emoji: '📝', color: '#FFD93D', frequency: 'daily', type: 'binary' },
  { id: 'no_social', name: 'No Social Media', emoji: '🚫', color: '#FF6B6B', frequency: 'daily', type: 'binary' },
  { id: 'eat_healthy', name: 'Eat Healthy', emoji: '🍎', color: '#00E5A0', frequency: 'daily', type: 'binary' },
  { id: 'wake_early', name: 'Wake Up Early', emoji: '🌅', color: '#FFB347', frequency: 'daily', type: 'binary' },
];

export const DEFAULT_ROUTINE = {
  morning: {
    label: 'Morning Routine',
    emoji: '🌅',
    color: '#FFB347',
    items: [
      { id: 'wake', text: 'Wake Up', time: '6:00 AM' },
      { id: 'brush', text: 'Brush & Freshen Up', time: '6:10 AM' },
      { id: 'exercise_r', text: 'Exercise / Workout', time: '6:30 AM' },
      { id: 'shower', text: 'Shower', time: '7:15 AM' },
      { id: 'breakfast', text: 'Breakfast', time: '7:45 AM' },
    ],
  },
  afternoon: {
    label: 'Afternoon Routine',
    emoji: '☀️',
    color: '#FFD93D',
    items: [
      { id: 'lunch', text: 'Lunch', time: '1:00 PM' },
      { id: 'nap', text: 'Power Nap', time: '2:00 PM' },
      { id: 'review', text: 'Review Tasks', time: '2:30 PM' },
    ],
  },
  evening: {
    label: 'Evening Routine',
    emoji: '🌆',
    color: '#FF6EAA',
    items: [
      { id: 'dinner', text: 'Dinner', time: '8:00 PM' },
      { id: 'journal_r', text: 'Journal / Reflect', time: '9:00 PM' },
      { id: 'prep', text: 'Prepare for Tomorrow', time: '9:30 PM' },
      { id: 'wind_down', text: 'Wind Down', time: '10:00 PM' },
    ],
  },
  night: {
    label: 'Night / Sleep Routine',
    emoji: '🌙',
    color: '#6C63FF',
    items: [
      { id: 'no_screens', text: 'No Screens', time: '10:30 PM' },
      { id: 'read_r', text: 'Read', time: '10:30 PM' },
      { id: 'sleep_r', text: 'Sleep by 11 PM', time: '11:00 PM' },
    ],
  },
};

export const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Great', value: 5, color: '#00E5A0' },
  { emoji: '🙂', label: 'Good', value: 4, color: '#4FC3F7' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#FFD93D' },
  { emoji: '😞', label: 'Bad', value: 2, color: '#FFB347' },
  { emoji: '😢', label: 'Terrible', value: 1, color: '#FF6B6B' },
];

export const RECURRENCE_OPTIONS = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
];

export const CURRENCY = {
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN',
};

export const NAV_ITEMS = [
  { id: 'home', path: '/', label: 'Home', icon: 'HiHome' },
  { id: 'finance', path: '/finance', label: 'Finance', icon: 'HiCurrencyRupee' },
  { id: 'tasks', path: '/tasks', label: 'Tasks', icon: 'HiClipboardList' },
  { id: 'routine', path: '/routine', label: 'Daily Routine', icon: 'HiSun' },
  { id: 'habits', path: '/habits', label: 'Habits', icon: 'HiFire' },
  { id: 'calendar', path: '/calendar', label: 'Calendar', icon: 'HiCalendar' },
  { id: 'notes', path: '/notes', label: 'Notes', icon: 'HiPencilAlt' },
  { id: 'settings', path: '/settings', label: 'Settings', icon: 'HiCog' },
];
