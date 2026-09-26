import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiPlus, HiTrash, HiPencil, HiFilter } from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTransactions, useBudgets, useSavingsGoals, useSubscriptions, useMonthlyEarningGoals } from '../../hooks/useData';
import { formatCurrency, formatDate, getCurrentMonth, percentage, getProgressColor, getNextBillingDate, daysUntil, generateId } from '../../lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/constants';
import Modal from '../../components/ui/Modal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';
import { AnimatePresence, motion } from 'framer-motion';
import './FinancePage.css';

const CHART_COLORS = ['#6C63FF', '#00E5A0', '#FF6B6B', '#FFB347', '#4FC3F7', '#FF6EAA', '#FFD93D', '#00D4FF', '#8B83FF', '#00B4D8'];

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'transactions';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('transaction');
  const [editItem, setEditItem] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonth());

  const { transactions, addTransaction, removeTransaction, getMonthSummary, getCategoryBreakdown } = useTransactions();
  const { budgets, addBudget, removeBudget, getCurrentBudgets } = useBudgets();
  const { goals, addGoal, updateGoal, removeGoal, addContribution } = useSavingsGoals();
  const { subscriptions, addSubscription, removeSubscription, toggleActive, getActiveSubs, getTotalMonthly, updateSubscription } = useSubscriptions();
  const { monthlyGoals, setMonthlyGoal, getMonthlyGoal } = useMonthlyEarningGoals();

  const currentMonthlyGoal = getMonthlyGoal(selectedMonth);
  const currentMonthGoals = useMemo(() => {
    const dailyNet = {};
    transactions.forEach(t => {
      if (t.date && t.date.startsWith(selectedMonth)) {
        if (!dailyNet[t.date]) dailyNet[t.date] = { date: t.date, achievedAmount: 0, id: t.date };
        if (t.type === 'income') dailyNet[t.date].achievedAmount += t.amount;
        else if (t.type === 'expense') dailyNet[t.date].achievedAmount -= t.amount;
      }
    });
    return Object.values(dailyNet);
  }, [transactions, selectedMonth]);
  
  const monthlyGoalStats = useMemo(() => {
    if (!currentMonthlyGoal) return null;
    
    const totalEarned = currentMonthGoals.reduce((sum, g) => sum + g.achievedAmount, 0);
    const target = currentMonthlyGoal.targetAmount;
    const remainingTarget = target - totalEarned;
    
    const today = new Date();
    const [yearStr, monthStr] = selectedMonth.split('-');
    const currentMonth = parseInt(monthStr, 10) - 1;
    const currentYear = parseInt(yearStr, 10);
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let remainingDays;
    if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
      remainingDays = Math.max(1, daysInMonth - today.getDate() + 1);
    } else {
      remainingDays = daysInMonth;
    }
    
    const minRequiredPerDay = remainingTarget > 0 ? (remainingTarget / remainingDays) : 0;
    
    return { target, totalEarned, remainingTarget, remainingDays, minRequiredPerDay };
  }, [currentMonthlyGoal, currentMonthGoals, selectedMonth]);

  const monthSummary = useMemo(() => getMonthSummary(), [transactions]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(), [transactions]);
  const currentBudgets = useMemo(() => getCurrentBudgets(), [budgets]);
  
  const pendingSubscriptions = useMemo(() => {
    const today = new Date();
    const currentMonthStr = getCurrentMonth();
    const currentDay = today.getDate();
    return subscriptions.filter(sub => {
      return sub.isActive && sub.billingDate <= currentDay && sub.lastPaidMonth !== currentMonthStr;
    });
  }, [subscriptions]);

  const tabs = [
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'savings', label: 'Savings Goals' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'earning-goals', label: 'Daily Earning Goals' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const openAddModal = (type) => {
    setModalType(type);
    setEditItem(null);
    setShowAddModal(true);
  };

  // Pie chart data
  const pieData = useMemo(() => {
    return Object.entries(categoryBreakdown).map(([category, amount]) => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === category || c.name === category);
      return { name: cat ? cat.name : category, value: amount };
    }).sort((a, b) => b.value - a.value);
  }, [categoryBreakdown]);

  // Monthly trend data (last 6 months)
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const summary = getMonthSummary(month);
      months.push({
        month: formatDate(d, 'MMM'),
        income: summary.income,
        expense: summary.expense,
      });
    }
    return months;
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  return (
    <div className="finance-page animate-fadeIn">
      <div className="page-header">
        <h1>💰 Finance</h1>
        <p className="page-subtitle">Track your income, expenses, and financial goals</p>
      </div>

      {/* Summary Cards */}
      <div className="finance-summary">
        <div className="glass-card finance-summary-card">
          <span className="summary-label">Monthly Income</span>
          <span className="summary-value text-green"><AnimatedNumber value={monthSummary.income} format={formatCurrency} /></span>
        </div>
        <div className="glass-card finance-summary-card">
          <span className="summary-label">Monthly Expenses</span>
          <span className="summary-value text-red"><AnimatedNumber value={monthSummary.expense} format={formatCurrency} /></span>
        </div>
        <div className="glass-card finance-summary-card">
          <span className="summary-label">Net Savings</span>
          <span className={`summary-value ${monthSummary.net >= 0 ? 'text-green' : 'text-red'}`}>
            {monthSummary.net >= 0 ? '+' : ''}<AnimatedNumber value={Math.abs(monthSummary.net)} format={formatCurrency} />
          </span>
        </div>
        <div className="glass-card finance-summary-card">
          <span className="summary-label">Active Subscriptions</span>
          <span className="summary-value text-blue"><AnimatedNumber value={getTotalMonthly()} format={formatCurrency} />/mo</span>
        </div>
      </div>

      {/* Pending Subscriptions Alert */}
      {pendingSubscriptions.length > 0 && (
        <div className="glass-card mb-4" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Pending Subscriptions
          </h4>
          <p className="text-muted" style={{ marginBottom: '16px' }}>These subscriptions are due. Log them to keep your balance accurate.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingSubscriptions.map(sub => (
              <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div>
                  <strong>{sub.name}</strong> <span className="text-muted">({formatCurrency(sub.amount)})</span>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => {
                  addTransaction({ type: 'expense', amount: sub.amount, date: getTodayISO(), category: sub.category || 'Bills', description: sub.name });
                  updateSubscription(sub.id, { lastPaidMonth: getCurrentMonth() });
                }}>
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <div className="finance-tab-content animate-fadeInUp">
          <div className="tab-header">
            <h3>All Transactions</h3>
            <button className="btn btn-primary" onClick={() => openAddModal('transaction')}>
              <HiPlus /> Add Transaction
            </button>
          </div>
          {sortedTransactions.length === 0 ? (
            <div className="glass-card empty-state">
              <span className="empty-icon">📊</span>
              <span className="empty-title">No transactions yet</span>
              <span className="empty-text">Start tracking your income and expenses</span>
              <button className="btn btn-primary" onClick={() => openAddModal('transaction')}>
                <HiPlus /> Add First Transaction
              </button>
            </div>
          ) : (
            <div className="glass-card transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                  {sortedTransactions.map(t => {
                    const allCats = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
                    const cat = allCats.find(c => c.id === t.category || c.name === t.category);
                    return (
                      <motion.tr 
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="text-muted">{formatDate(t.date, 'MMM dd')}</td>
                        <td>{t.description || '-'}</td>
                        <td>
                          <span className="badge badge-category">
                            {cat ? `${cat.emoji} ${cat.name}` : t.category}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${t.type === 'income' ? 'badge-low' : 'badge-high'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={t.type === 'income' ? 'text-green' : 'text-red'}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                        <td>
                          <button className="btn btn-icon btn-sm btn-ghost" onClick={() => removeTransaction(t.id)}>
                            <HiTrash />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="finance-tab-content animate-fadeInUp">
          <div className="tab-header">
            <h3>Monthly Budgets</h3>
            <button className="btn btn-primary" onClick={() => openAddModal('budget')}>
              <HiPlus /> Set Budget
            </button>
          </div>
          {currentBudgets.length === 0 ? (
            <div className="glass-card empty-state">
              <span className="empty-icon">📋</span>
              <span className="empty-title">No budgets set</span>
              <span className="empty-text">Set spending limits for each category</span>
              <button className="btn btn-primary" onClick={() => openAddModal('budget')}>
                <HiPlus /> Set First Budget
              </button>
            </div>
          ) : (
            <div className="budget-grid">
              {currentBudgets.map(budget => {
                const spent = categoryBreakdown[budget.category] || 0;
                const pct = percentage(spent, budget.amount);
                const cat = EXPENSE_CATEGORIES.find(c => c.id === budget.category || c.name === budget.category);
                return (
                  <div key={budget.id} className="glass-card budget-card interactive">
                    <div className="budget-card-header">
                      <span className="budget-category">
                        {cat ? `${cat.emoji} ${cat.name}` : budget.category}
                      </span>
                      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => removeBudget(budget.id)}>
                        <HiTrash />
                      </button>
                    </div>
                    <div className="budget-amounts">
                      <span className={pct >= 90 ? 'text-red' : pct >= 70 ? 'text-orange' : 'text-green'}>
                        {formatCurrency(spent)}
                      </span>
                      <span className="text-muted"> / {formatCurrency(budget.amount)}</span>
                    </div>
                    <div className="progress-container">
                      <div className={`progress-bar ${getProgressColor(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="budget-pct text-muted">{pct}% used</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="finance-tab-content animate-fadeInUp">
          <div className="tab-header">
            <h3>Savings Goals</h3>
            <button className="btn btn-primary" onClick={() => openAddModal('goal')}>
              <HiPlus /> New Goal
            </button>
          </div>
          {goals.length === 0 ? (
            <div className="glass-card empty-state">
              <span className="empty-icon">🎯</span>
              <span className="empty-title">No savings goals</span>
              <span className="empty-text">Set targets and track your progress</span>
              <button className="btn btn-primary" onClick={() => openAddModal('goal')}>
                <HiPlus /> Create First Goal
              </button>
            </div>
          ) : (
            <div className="goals-grid">
              {goals.map(goal => {
                const pct = percentage(goal.currentAmount, goal.targetAmount);
                return (
                  <div key={goal.id} className="glass-card goal-card interactive">
                    <div className="goal-header">
                      <h4>{goal.name}</h4>
                      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => removeGoal(goal.id)}>
                        <HiTrash />
                      </button>
                    </div>
                    <div className="goal-ring-wrapper">
                      <svg className="goal-ring" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={goal.color}
                          strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                          transform="rotate(-90 50 50)"
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>
                      <span className="goal-ring-pct">{pct}%</span>
                    </div>
                    <div className="goal-amounts">
                      <span style={{ color: goal.color }}>{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted"> / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    {goal.deadline && (
                      <span className="text-muted goal-deadline">
                        Deadline: {formatDate(goal.deadline)}
                      </span>
                    )}
                    <ContributionInput goalId={goal.id} onAdd={addContribution} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="finance-tab-content animate-fadeInUp">
          <div className="tab-header">
            <h3>Subscriptions & Bills</h3>
            <button className="btn btn-primary" onClick={() => openAddModal('subscription')}>
              <HiPlus /> Add Subscription
            </button>
          </div>
          <div className="glass-card sub-total-card">
            <span className="text-muted">Total Monthly</span>
            <span className="sub-total-value">{formatCurrency(getTotalMonthly())}</span>
          </div>
          {subscriptions.length === 0 ? (
            <div className="glass-card empty-state" style={{ marginTop: '16px' }}>
              <span className="empty-icon">📱</span>
              <span className="empty-title">No subscriptions</span>
              <span className="empty-text">Track your recurring bills and subscriptions</span>
            </div>
          ) : (
            <div className="sub-list">
              {subscriptions.map(sub => {
                const nextDate = getNextBillingDate(sub.billingDate);
                const days = daysUntil(nextDate);
                return (
                  <div key={sub.id} className={`glass-card sub-item ${!sub.isActive ? 'inactive' : ''}`}>
                    <div className="sub-info">
                      <span className="sub-name">{sub.name}</span>
                      <span className="text-muted sub-billing">
                        Bills on the {sub.billingDate}{['st','nd','rd'][sub.billingDate - 1] || 'th'} · {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </span>
                    </div>
                    <span className="sub-amount">{formatCurrency(sub.amount)}/mo</span>
                    <div className="sub-actions">
                      <button
                        className={`btn btn-sm ${sub.isActive ? 'btn-ghost' : 'btn-primary'}`}
                        onClick={() => toggleActive(sub.id)}
                      >
                        {sub.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => removeSubscription(sub.id)}>
                        <HiTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'earning-goals' && (
        <div className="finance-tab-content animate-fadeInUp">
          <div className="tab-header">
            <h3>Daily Earnings</h3>
            <div className="tab-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="month" className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: '4px 12px', height: '36px', minWidth: '150px' }} />
              <button className="btn btn-primary" onClick={() => openAddModal('monthly-goal')}>
                <HiPlus /> Monthly Goal
              </button>
            </div>
          </div>
          
          {monthlyGoalStats && (
            <div className="glass-card mb-4" style={{ marginBottom: '24px' }}>
              <h4>Monthly Earning Goal ({selectedMonth})</h4>
              <div className="finance-summary" style={{ marginTop: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="finance-summary-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', margin: 0 }}>
                  <span className="summary-label">Target</span>
                  <span className="summary-value text-blue">{formatCurrency(monthlyGoalStats.target)}</span>
                </div>
                <div className="finance-summary-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', margin: 0 }}>
                  <span className="summary-label">Earned So Far</span>
                  <span className={`summary-value ${monthlyGoalStats.totalEarned >= 0 ? 'text-green' : 'text-red'}`}>{formatCurrency(monthlyGoalStats.totalEarned)}</span>
                </div>
                <div className="finance-summary-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', margin: 0 }}>
                  <span className="summary-label">Remaining Target</span>
                  <span className="summary-value text-orange">{formatCurrency(monthlyGoalStats.remainingTarget)}</span>
                </div>
                <div className="finance-summary-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', margin: 0 }}>
                  <span className="summary-label">Req. Daily Avg ({monthlyGoalStats.remainingDays} days left)</span>
                  <span className="summary-value text-purple">{formatCurrency(monthlyGoalStats.minRequiredPerDay)}/day</span>
                </div>
              </div>
              <div className="progress-container" style={{ margin: '16px 0 0' }}>
                <div className={`progress-bar ${getProgressColor(monthlyGoalStats.target > 0 ? percentage(monthlyGoalStats.totalEarned, monthlyGoalStats.target) : 0)}`} style={{ width: `${monthlyGoalStats.target > 0 ? Math.min(100, Math.max(0, percentage(monthlyGoalStats.totalEarned, monthlyGoalStats.target))) : 0}%` }} />
              </div>
            </div>
          )}
          {(() => {
            const [yearStr, monthStr] = selectedMonth.split('-');
            const currentMonth = parseInt(monthStr, 10) - 1;
            const currentYear = parseInt(yearStr, 10);
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
              const dateStr = `${selectedMonth}-${String(i + 1).padStart(2, '0')}`;
              const existingRecord = currentMonthGoals.find(g => g.date === dateStr);
              return {
                date: dateStr,
                id: existingRecord?.id,
                achievedAmount: existingRecord?.achievedAmount || 0,
                note: existingRecord?.note || ''
              };
            }).reverse(); // Show latest days first

            return (
              <div className="glass-card transactions-table-wrapper" style={{ marginTop: '24px' }}>
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Target (Avg)</th>
                      <th>Earned</th>
                      <th style={{ minWidth: '150px' }}>Progress</th>
                      <th>Log Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthDays.map(dayData => {
                      const target = monthlyGoalStats?.minRequiredPerDay || 0;
                      const pct = target > 0 ? percentage(dayData.achievedAmount, target) : 0;
                      return (
                        <tr key={dayData.date}>
                          <td style={{ fontWeight: '500' }}>{formatDate(dayData.date, 'MMM dd, yyyy')}</td>
                          <td className="text-muted">{formatCurrency(target)}</td>
                          <td className={dayData.achievedAmount >= 0 ? 'text-green' : 'text-red'}>
                            {formatCurrency(dayData.achievedAmount)}
                          </td>
                          <td>
                            <div className="progress-container" style={{ marginBottom: '4px' }}>
                              <div className={`progress-bar ${getProgressColor(pct)}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-muted" style={{ fontSize: '12px' }}>{pct}%</span>
                          </td>
                          <td>
                            <ContributionInput 
                              goalId={dayData.date} 
                              onAdd={(id, amount) => {
                                if (amount > 0) {
                                  addTransaction({ type: 'income', amount, date: dayData.date, category: 'Freelance', description: 'Daily Earning' });
                                } else if (amount < 0) {
                                  addTransaction({ type: 'expense', amount: Math.abs(amount), date: dayData.date, category: 'Other', description: 'Daily Loss/Expense' });
                                }
                              }} 
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="finance-tab-content animate-fadeInUp">
          <div className="analytics-grid">
            {/* Spending by Category - Pie */}
            <div className="glass-card chart-card">
              <h3>Spending by Category</h3>
              {pieData.length === 0 ? (
                <div className="empty-mini"><p className="text-muted">No expense data yet</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <defs>
                      <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.2" />
                      </filter>
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={95}
                      cornerRadius={8}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {pieData.map((_, i) => (
                        <Cell 
                          key={i} 
                          fill={CHART_COLORS[i % CHART_COLORS.length]} 
                          style={{ filter: 'url(#pieGlow)' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        background: 'rgba(18, 18, 20, 0.9)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px', 
                        color: '#E2E2E2',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                      }}
                      itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="chart-legend">
                {pieData.slice(0, 6).map((item, i) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income vs Expense Trend - Bar */}
            <div className="glass-card chart-card" delay={0.2}>
              <h3>Income vs Expenses (6 months)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={trendData} barGap={8} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8EB8E5" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#8EB8E5" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D98A8A" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#D98A8A" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ 
                      background: 'rgba(12, 12, 14, 0.85)', 
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '12px', 
                      color: '#E2E2E2',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '12px', color: '#9494A0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                  
                  {/* Glassy Bars */}
                  <Bar dataKey="income" name="Income" fill="url(#incomeGradient)" radius={[6, 6, 0, 0]} barSize={32} animationDuration={1200} />
                  <Bar dataKey="expense" name="Expenses" fill="url(#expenseGradient)" radius={[6, 6, 0, 0]} barSize={32} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddFinanceModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
        type={modalType}
        onAddTransaction={addTransaction}
        onAddBudget={addBudget}
        onAddGoal={addGoal}
        onAddSubscription={addSubscription}
        onSetMonthlyGoal={setMonthlyGoal}
      />
    </div>
  );
}

// Contribution input for savings goals
function ContributionInput({ goalId, onAdd }) {
  const [amount, setAmount] = useState('');
  const handleAdd = () => {
    if (amount && !isNaN(parseFloat(amount))) {
      onAdd(goalId, parseFloat(amount));
      setAmount('');
    }
  };
  return (
    <div className="contribution-input">
      <input
        type="number"
        className="input-field"
        placeholder="Add amount (+ or -)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button className="btn btn-sm btn-success" onClick={handleAdd}>+ Add</button>
    </div>
  );
}

// Add Finance Modal
function AddFinanceModal({ isOpen, onClose, type, onAddTransaction, onAddBudget, onAddGoal, onAddSubscription, onSetMonthlyGoal }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = () => {
    switch (type) {
      case 'transaction':
        if (formData.amount && formData.category) {
          onAddTransaction(formData);
          onClose();
          setFormData({});
        }
        break;
      case 'budget':
        if (formData.category && formData.amount) {
          onAddBudget(formData);
          onClose();
          setFormData({});
        }
        break;
      case 'goal':
        if (formData.name && formData.targetAmount) {
          onAddGoal(formData);
          onClose();
          setFormData({});
        }
        break;
      case 'subscription':
        if (formData.name && formData.amount && formData.billingDate) {
          onAddSubscription(formData);
          onClose();
          setFormData({});
        }
        break;
      case 'monthly-goal':
        if (formData.targetAmount) {
          onSetMonthlyGoal(formData);
          onClose();
          setFormData({});
        }
        break;
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const titles = {
    transaction: 'Add Transaction',
    budget: 'Set Budget',
    goal: 'New Savings Goal',
    subscription: 'Add Subscription',
    'monthly-goal': 'Set Monthly Earning Goal',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titles[type]}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
        </>
      }
    >
      {type === 'transaction' && (
        <>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${formData.type === 'income' ? 'active income' : ''}`}
              onClick={() => updateField('type', 'income')}
            >Income</button>
            <button
              className={`toggle-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
              onClick={() => updateField('type', 'expense')}
            >Expense</button>
          </div>
          <div className="input-group">
            <label className="input-label">Amount (₹)</label>
            <input type="number" className="input-field" placeholder="0" value={formData.amount || ''} onChange={(e) => updateField('amount', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input-field" value={formData.category || ''} onChange={(e) => updateField('category', e.target.value)}>
              <option value="">Select category</option>
              {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input type="text" className="input-field" placeholder="What was this for?" value={formData.description || ''} onChange={(e) => updateField('description', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Date</label>
            <input type="date" className="input-field" value={formData.date || new Date().toISOString().split('T')[0]} onChange={(e) => updateField('date', e.target.value)} />
          </div>
        </>
      )}

      {type === 'budget' && (
        <>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input-field" value={formData.category || ''} onChange={(e) => updateField('category', e.target.value)}>
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Monthly Limit (₹)</label>
            <input type="number" className="input-field" placeholder="0" value={formData.amount || ''} onChange={(e) => updateField('amount', e.target.value)} />
          </div>
        </>
      )}

      {type === 'goal' && (
        <>
          <div className="input-group">
            <label className="input-label">Goal Name</label>
            <input type="text" className="input-field" placeholder="e.g., Vacation Fund" value={formData.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Target Amount (₹)</label>
            <input type="number" className="input-field" placeholder="0" value={formData.targetAmount || ''} onChange={(e) => updateField('targetAmount', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Deadline (Optional)</label>
            <input type="date" className="input-field" value={formData.deadline || ''} onChange={(e) => updateField('deadline', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Color</label>
            <input type="color" value={formData.color || '#6C63FF'} onChange={(e) => updateField('color', e.target.value)} style={{ width: '50px', height: '36px', cursor: 'pointer', border: 'none', borderRadius: '8px' }} />
          </div>
        </>
      )}

      {type === 'subscription' && (
        <>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input type="text" className="input-field" placeholder="e.g., Netflix" value={formData.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Monthly Amount (₹)</label>
            <input type="number" className="input-field" placeholder="0" value={formData.amount || ''} onChange={(e) => updateField('amount', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Billing Date (Day of Month)</label>
            <input type="number" className="input-field" placeholder="1-31" min="1" max="31" value={formData.billingDate || ''} onChange={(e) => updateField('billingDate', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input-field" value={formData.category || ''} onChange={(e) => updateField('category', e.target.value)}>
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {type === 'monthly-goal' && (
        <>
          <div className="input-group">
            <label className="input-label">Month</label>
            <input type="month" className="input-field" value={formData.month || getCurrentMonth()} onChange={(e) => updateField('month', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Target Amount (₹)</label>
            <input type="number" className="input-field" placeholder="0" value={formData.targetAmount || ''} onChange={(e) => updateField('targetAmount', e.target.value)} />
          </div>
        </>
      )}
    </Modal>
  );
}
