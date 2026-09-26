import { useState, useCallback, useEffect } from 'react';
import { getAll, add, update, remove, getById, setAll, getValue, setValue } from '../lib/storage';
import { generateId, getTodayISO, getCurrentMonth, keysToCamel, keysToSnake } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

/**
 * Generic CRUD hook for any collection
 */
function useCollection(collectionName) {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from(collectionName)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setItems(data.map(keysToCamel));
    }
  }, [collectionName, user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const refresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (data) => {
    if (!user) return null;
    const dbData = keysToSnake(data);
    dbData.user_id = user.id;

    const { data: inserted, error } = await supabase
      .from(collectionName)
      .insert(dbData)
      .select()
      .single();

    if (!error && inserted) {
      const camelItem = keysToCamel(inserted);
      setItems(prev => [...prev, camelItem]);
      return camelItem;
    }
    return null;
  }, [collectionName, user]);

  const updateItem = useCallback(async (id, updates) => {
    if (!user) return null;
    const dbUpdates = keysToSnake(updates);

    const { data: updated, error } = await supabase
      .from(collectionName)
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && updated) {
      const camelItem = keysToCamel(updated);
      setItems(prev => prev.map(item => item.id === id ? camelItem : item));
      return camelItem;
    }
    return null;
  }, [collectionName, user]);

  const removeItem = useCallback(async (id) => {
    if (!user) return;
    const { error } = await supabase
      .from(collectionName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }, [collectionName, user]);

  const replaceAll = useCallback(async (newItems) => {
    // For simplicity, we just delete all and insert all.
    // Be careful with this in production!
    if (!user) return;
    await supabase.from(collectionName).delete().eq('user_id', user.id);
    
    const dbItems = newItems.map(item => {
      const dbItem = keysToSnake(item);
      dbItem.user_id = user.id;
      // strip id so it generates a new one, or keep it if it's uuid
      return dbItem;
    });

    const { data, error } = await supabase.from(collectionName).insert(dbItems).select();
    if (!error && data) {
      setItems(data.map(keysToCamel));
    }
  }, [collectionName, user]);

  return { items, addItem, updateItem, removeItem, replaceAll, refresh };
}

// ── Transactions ──────────────────────────
export function useTransactions() {
  const { items, addItem, updateItem, removeItem, refresh } = useCollection('transactions');

  const addTransaction = (data) => addItem({
    type: data.type, // 'income' or 'expense'
    amount: parseFloat(data.amount),
    category: data.category,
    description: data.description || '',
    date: data.date || getTodayISO(),
  });

  const getByMonth = (month) => {
    return items.filter(t => t.date && t.date.startsWith(month));
  };

  const getTodayTransactions = () => {
    const today = getTodayISO();
    return items.filter(t => t.date === today);
  };

  const getMonthSummary = (month = getCurrentMonth()) => {
    const monthItems = getByMonth(month);
    const income = monthItems.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthItems.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense, count: monthItems.length };
  };

  const getTodaySummary = () => {
    const todayItems = getTodayTransactions();
    const income = todayItems.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = todayItems.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  };

  const getCategoryBreakdown = (month = getCurrentMonth()) => {
    const monthItems = getByMonth(month).filter(t => t.type === 'expense');
    const breakdown = {};
    monthItems.forEach(t => {
      if (!breakdown[t.category]) breakdown[t.category] = 0;
      breakdown[t.category] += t.amount;
    });
    return breakdown;
  };

  return {
    transactions: items,
    addTransaction,
    updateTransaction: updateItem,
    removeTransaction: removeItem,
    getByMonth,
    getTodayTransactions,
    getMonthSummary,
    getTodaySummary,
    getCategoryBreakdown,
    refresh,
  };
}

// ── Budgets ──────────────────────────────
export function useBudgets() {
  const { items, addItem, updateItem, removeItem } = useCollection('budgets');

  const addBudget = (data) => addItem({
    category: data.category,
    limitAmount: parseFloat(data.limitAmount),
    month: data.month || getCurrentMonth(),
  });

  const getCurrentBudgets = () => items.filter(b => b.month === getCurrentMonth());

  return {
    budgets: items,
    addBudget,
    updateBudget: updateItem,
    removeBudget: removeItem,
    getCurrentBudgets,
  };
}

// ── Savings Goals ────────────────────────
export function useSavingsGoals() {
  const { items, addItem, updateItem, removeItem } = useCollection('savings_goals');

  const addGoal = (data) => addItem({
    name: data.name,
    targetAmount: parseFloat(data.targetAmount),
    currentAmount: parseFloat(data.currentAmount || 0),
    deadline: data.deadline || null,
    color: data.color || '#6C63FF',
  });

  const addContribution = (goalId, amount) => {
    const goal = items.find(g => g.id === goalId);
    if (goal) {
      updateItem(goalId, { currentAmount: goal.currentAmount + parseFloat(amount) });
    }
  };

  return {
    goals: items,
    addGoal,
    updateGoal: updateItem,
    removeGoal: removeItem,
    addContribution,
  };
}

// ── Subscriptions ────────────────────────
export function useSubscriptions() {
  const { items, addItem, updateItem, removeItem } = useCollection('subscriptions');

  const addSubscription = (data) => addItem({
    name: data.name,
    amount: parseFloat(data.amount),
    billingDate: parseInt(data.billingDate),
    category: data.category || 'entertainment',
    isActive: true,
  });

  const toggleActive = (id) => {
    const sub = items.find(s => s.id === id);
    if (sub) updateItem(id, { isActive: !sub.isActive });
  };

  const getActiveSubs = () => items.filter(s => s.isActive);
  const getTotalMonthly = () => getActiveSubs().reduce((sum, s) => sum + s.amount, 0);

  return {
    subscriptions: items,
    addSubscription,
    updateSubscription: updateItem,
    removeSubscription: removeItem,
    toggleActive,
    getActiveSubs,
    getTotalMonthly,
  };
}

// ── Tasks ────────────────────────────────
export function useTasks() {
  const { items, addItem, updateItem, removeItem } = useCollection('tasks');

  const addTask = (data) => addItem({
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'medium',
    status: data.status || 'todo',
    category: data.category || 'personal',
    dueDate: data.dueDate || null,
    isRecurring: data.isRecurring || false,
    recurrenceRule: data.recurrenceRule || null,
    completedAt: null,
  });

  const toggleComplete = (id) => {
    const task = items.find(t => t.id === id);
    if (!task) return;
    if (task.status === 'done') {
      updateItem(id, { status: 'todo', completedAt: null });
    } else {
      updateItem(id, { status: 'done', completedAt: new Date().toISOString() });
    }
  };

  const moveTask = (id, newStatus) => {
    updateItem(id, {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null,
    });
  };

  const getByStatus = (status) => items.filter(t => t.status === status);
  const getTodayTasks = () => {
    const today = getTodayISO();
    return items.filter(t => t.status !== 'done' && (!t.dueDate || t.dueDate <= today));
  };

  return {
    tasks: items,
    addTask,
    updateTask: updateItem,
    removeTask: removeItem,
    toggleComplete,
    moveTask,
    getByStatus,
    getTodayTasks,
  };
}

// ── Habits ───────────────────────────────
export function useHabits() {
  const habitCollection = useCollection('habits');
  const logCollection = useCollection('habit_logs');

  const addHabit = (data) => habitCollection.addItem({
    name: data.name,
    emoji: data.emoji || '✅',
    color: data.color || '#6C63FF',
    frequency: data.frequency || 'daily',
    type: data.type || 'binary', // 'binary' or 'quantitative'
    target: data.target || null, // for quantitative
    unit: data.unit || '', // for quantitative
  });

  const logHabit = (habitId, date = getTodayISO(), value = 1) => {
    // Check if already logged today
    const existing = logCollection.items.find(
      l => l.habitId === habitId && l.date === date
    );
    if (existing) {
      // Update the value
      logCollection.updateItem(existing.id, { value });
    } else {
      logCollection.addItem({ habitId, date, value });
    }
  };

  const unlogHabit = (habitId, date = getTodayISO()) => {
    const existing = logCollection.items.find(
      l => l.habitId === habitId && l.date === date
    );
    if (existing) {
      logCollection.removeItem(existing.id);
    }
  };

  const isCompletedToday = (habitId) => {
    const today = getTodayISO();
    return logCollection.items.some(l => l.habitId === habitId && l.date === today);
  };

  const getTodayValue = (habitId) => {
    const today = getTodayISO();
    const log = logCollection.items.find(l => l.habitId === habitId && l.date === today);
    return log ? log.value : 0;
  };

  const getStreak = (habitId) => {
    const dates = logCollection.items
      .filter(l => l.habitId === habitId)
      .map(l => l.date);
    return calculateStreakFromDates(dates);
  };

  const getTodayProgress = () => {
    const today = getTodayISO();
    const total = habitCollection.items.length;
    const completed = habitCollection.items.filter(h => isCompletedToday(h.id)).length;
    return { completed, total };
  };

  return {
    habits: habitCollection.items,
    logs: logCollection.items,
    addHabit,
    updateHabit: habitCollection.updateItem,
    removeHabit: (id) => {
      habitCollection.removeItem(id);
      // Also remove all logs for this habit
      const logsToRemove = logCollection.items.filter(l => l.habitId === id);
      logsToRemove.forEach(l => logCollection.removeItem(l.id));
    },
    logHabit,
    unlogHabit,
    isCompletedToday,
    getTodayValue,
    getStreak,
    getTodayProgress,
  };
}

function calculateStreakFromDates(dates) {
  if (!dates || dates.length === 0) return { current: 0, best: 0 };
  const sorted = [...new Set(dates)].sort().reverse();
  const today = getTodayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let current = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (prev - curr) / 86400000;
      if (diff === 1) current++;
      else break;
    }
  }

  let best = 1, streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}

// ── Daily Routine ────────────────────────
export function useRoutine() {
  const templateCollection = useCollection('routine_templates');
  const logCollection = useCollection('routine_logs');

  const getTemplate = () => {
    if (templateCollection.items.length > 0) {
      return templateCollection.items[0];
    }
    return null;
  };

  const saveTemplate = (template) => {
    if (templateCollection.items.length > 0) {
      templateCollection.updateItem(templateCollection.items[0].id, { blocks: template });
    } else {
      templateCollection.addItem({ blocks: template });
    }
  };

  const toggleRoutineItem = (blockId, itemId, date = getTodayISO()) => {
    const existing = logCollection.items.find(
      l => l.blockId === blockId && l.itemId === itemId && l.date === date
    );
    if (existing) {
      logCollection.removeItem(existing.id);
      return false; // unchecked
    } else {
      logCollection.addItem({ blockId, itemId, date });
      return true; // checked
    }
  };

  const isItemCompleted = (blockId, itemId, date = getTodayISO()) => {
    return logCollection.items.some(
      l => l.blockId === blockId && l.itemId === itemId && l.date === date
    );
  };

  const getDayProgress = (date = getTodayISO()) => {
    const template = getTemplate();
    if (!template || !template.blocks) return { completed: 0, total: 0 };
    let total = 0;
    let completed = 0;
    Object.entries(template.blocks).forEach(([blockId, block]) => {
      (block.items || []).forEach(item => {
        total++;
        if (isItemCompleted(blockId, item.id, date)) completed++;
      });
    });
    return { completed, total };
  };

  return {
    template: getTemplate(),
    logs: logCollection.items,
    saveTemplate,
    toggleRoutineItem,
    isItemCompleted,
    getDayProgress,
  };
}

// ── Notes / Journal ──────────────────────
export function useNotes() {
  const { items, addItem, updateItem, removeItem } = useCollection('notes');

  const addNote = (data) => addItem({
    title: data.title || '',
    content: data.content || '',
    date: data.date || getTodayISO(),
    mood: data.mood || null,
    tags: data.tags || [],
  });

  const getTodayNote = () => {
    const today = getTodayISO();
    return items.find(n => n.date === today) || null;
  };

  const getByDate = (date) => items.find(n => n.date === date) || null;

  return {
    notes: items,
    addNote,
    updateNote: updateItem,
    removeNote: removeItem,
    getTodayNote,
    getByDate,
  };
}

// ── Settings ─────────────────────────────
export function useSettings() {
  const [settings, setSettingsState] = useState(() => {
    return getValue('settings') || {
      name: '',
      pomodoroWork: 25,
      pomodoroBreak: 5,
      pomodoroLongBreak: 15,
      notifications: true,
      scrollAnimationsEnabled: true,
      scrollAnimationIntensity: 'prominent',
      themeMode: 'dark',
      accentColor: 'blue',
      glassIntensity: 'frosted',
      layoutSpacing: 'normal',
      typography: 'Inter',
      dashboardBgType: 'none',
      dashboardBgPreset: 'mesh',
      dashboardBgCustomUrl: '',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      dashboardWidgets: {
        tasks: true,
        habits: true,
        bills: true,
        transactions: true,
        monthlyOverview: true,
        routine: true
      },
      sidebarPages: {
        finance: true,
        tasks: true,
        routine: true,
        habits: true,
        calendar: true,
        notes: true
      }
    };
  });

  const updateSettings = (updates) => {
    const newSettings = { ...settings, ...updates };
    setValue('settings', newSettings);
    setSettingsState(newSettings);
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: newSettings }));
    return newSettings;
  };

  useEffect(() => {
    const handleSettingsUpdate = (e) => {
      setSettingsState(e.detail);
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate);
  }, []);

  return { settings, updateSettings };
}

// ── Monthly Earning Goals ────────────────
export function useMonthlyEarningGoals() {
  const { items, addItem, updateItem, removeItem } = useCollection('monthly_earning_goals');

  const setMonthlyGoal = (data) => {
    const month = data.month || getCurrentMonth();
    const existing = items.find(g => g.month === month);
    if (existing) {
      return updateItem(existing.id, { targetAmount: parseFloat(data.targetAmount) });
    }
    return addItem({
      month,
      targetAmount: parseFloat(data.targetAmount),
    });
  };

  const getMonthlyGoal = (month = getCurrentMonth()) => {
    return items.find(g => g.month === month) || null;
  };

  return {
    monthlyGoals: items,
    setMonthlyGoal,
    getMonthlyGoal,
  };
}

// ── Daily Earning Goals ──────────────────
export function useDailyEarningGoals() {
  const { items, addItem, updateItem, removeItem } = useCollection('daily_earning_goals');

  const addDailyGoal = (data) => addItem({
    date: data.date || getTodayISO(),
    targetAmount: parseFloat(data.targetAmount || 0),
    achievedAmount: parseFloat(data.achievedAmount || 0),
    note: data.note || '',
  });

  const getGoalByDate = (date = getTodayISO()) => {
    return items.find(g => g.date === date) || null;
  };
  
  const getGoalsByMonth = (month = getCurrentMonth()) => {
    return items.filter(g => g.date && g.date.startsWith(month));
  };

  return {
    dailyGoals: items,
    addDailyGoal,
    updateDailyGoal: updateItem,
    removeDailyGoal: removeItem,
    getGoalByDate,
    getGoalsByMonth,
  };
}
