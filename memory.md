# 🧠 Dashboard Project Memory

> **Rule**: NEVER delete or remove content from this file. Only append.

---

## 📅 Project Started: 2026-09-25

## 👤 Target User
- Building this dashboard **for a friend** (not personal use)
- Friend will use it on **phone + laptop**
- Needs to be accessible via a **shared URL**

---

## ✅ Decisions Made (Interview - 2026-09-25)

### Core Architecture
| Decision | Choice | Date |
|---|---|---|
| Frontend Framework | Vite + React | 2026-09-25 |
| Backend / Database | Supabase (PostgreSQL, free tier) | 2026-09-25 |
| Authentication | Simple shared password (no user accounts) | 2026-09-25 |
| Charting Library | Recharts (D3.js as backup) | 2026-09-25 |
| CSS Approach | Vanilla CSS (no framework) | 2026-09-25 |
| Currency | ₹ INR (Indian Rupee) | 2026-09-25 |

### Design
| Decision | Choice | Date |
|---|---|---|
| Theme | Dark mode + glassmorphism | 2026-09-25 |
| Navigation | Sidebar + top bar combo | 2026-09-25 |
| Mobile | Responsive + PWA (installable) | 2026-09-25 |
| Font | Inter (Google Fonts) | 2026-09-25 |

### Modules Confirmed
1. **Home / Today Overview** — greeting, quick stats, today's tasks, habit progress, upcoming bills, recent transactions
2. **Finance** — income/expense tracking, budgets, savings goals, subscriptions, daily earning/loss, analytics charts
3. **Tasks** — to-do list, kanban board, categories/tags, recurring tasks, pomodoro timer
4. **Habits** — daily habit tracker with streak counts
5. **Calendar** — unified view of tasks, bills, habits
6. **Notes / Journal** — daily journal with markdown

### Deployment
| Decision | Choice | Date |
|---|---|---|
| Frontend Hosting | Vercel or Netlify (free tier) | 2026-09-25 |
| Backend Hosting | Supabase (free tier) | 2026-09-25 |
| PWA | Yes — manifest + service worker | 2026-09-25 |

---

## 🔧 Current Progress
- [x] Plan created and reviewed
- [x] Vite + React project scaffolded (base dependencies installed)
- [x] Project dependencies installed (react-router-dom, recharts, supabase, etc.)
- [x] Design system (index.css)
- [x] Layout shell (Sidebar, TopBar, routing)
- [x] Password gate
- [x] Home page
- [x] Finance module
- [x] Task module
- [x] Habits module
- [x] Calendar module
- [x] Notes module
- [x] PWA setup
- [x] Responsive polish
- [ ] Deployment
- [ ] Supabase migration (currently using localStorage)

---

## 📝 Open Questions / To Be Clarified
- ✅ All clarified (2026-09-25)

---

## 🔍 Detailed Decisions (Deep Dive - 2026-09-25)

### Finance Details
- **Friend's profile**: Multi-income — salaried + freelance + business + trading/investing
- **Daily P&L**: Important feature given trading/variable income
- **Custom categories**: Yes — users can create custom categories with emoji + color
- **Number formatting**: English only (no Hindi/lakhs formatting)
- **Data export**: Not needed
- **Expense categories (presets)**: Food & Dining, Transport/Fuel, Rent/Housing, Utilities, Shopping/Clothing, Entertainment, Health/Medical, Education, Groceries, Personal Care, Gifts/Donations, Travel/Vacation, EMI/Loan Payments, Investments/SIP
- **Income categories (presets)**: Salary/Wages, Freelance/Side Hustle, Business Revenue, Investments/Dividends

### Task Details
- **Task categories (presets)**: Work, Personal, Health & Fitness, Finance, Learning/Study, Home/Chores, Side Project, Social
- **Pomodoro timer**: User-configurable work/break durations (no fixed default)

### Habit Details
- **Default habits (presets)**: 💧 Drink Water (8 glasses), 🏃 Exercise, 📖 Read 30min, 🧘 Meditate, 💊 Vitamins/Medicine, 😴 Sleep by 11PM, 📝 Journal, 🚫 No Social Media, 🍎 Eat Healthy, 🌅 Wake Up Early
- **Tracking style**: Both binary (done/not done) AND quantitative (e.g., 6/8 glasses)

### Daily Routine (NEW MODULE)
- **Separate tab**: Yes — dedicated "Daily Routine" tab in sidebar
- **Time blocks**: Morning, Afternoon, Evening, Night/Sleep
- **Behavior**: Template-based (set ideal routine once, checks reset daily) + ability to add one-off items on specific days
- **Examples**:
  - Morning: Wake up, Brush, Exercise, Shower, Breakfast
  - Afternoon: Lunch, Power nap, Review tasks
  - Evening: Dinner, Journal, Prepare tomorrow, Wind down
  - Night: No screens, Read, Sleep by 11

### Journal / Notes Details
- **Editor**: Rich-text editor (bold, italic, lists, headings) + Markdown editor with preview (both options)
- **Mood tracking**: Yes — emoji mood selector (😄🙂😐😞😢) on each journal entry

### Notifications
- **Type**: Browser notifications (push)
- **Triggers**: Bill due tomorrow, task overdue
- **Summaries**: Both weekly AND monthly summary cards on Home page

### Settings
- **Name**: User-configurable (set in settings, shown in greeting)
- **Layout**: Quick settings dropdown in top bar + full settings page in sidebar
- **Settings sections**: Profile (name), Pomodoro durations, Notification preferences, Password change, Category management

### Build Strategy
- **Approach**: Build all modules with localStorage first → swap in Supabase at the end
- **Supabase**: User has/will create account — will provide SQL for table setup
- **Rationale**: See full app working quickly without backend dependency

---

## 🗂️ Final Module List (7 modules + Settings)
1. **Home / Today Overview**
2. **Finance** (Transactions, Budgets, Savings Goals, Subscriptions, Analytics)
3. **Tasks** (To-do list, Kanban board, Pomodoro timer)
4. **Daily Routine** (Morning/Afternoon/Evening/Night blocks with templates)
5. **Habits** (Tracker with streaks, binary + quantitative)
6. **Calendar** (Unified view)
7. **Notes / Journal** (Rich text + Markdown, mood tracking)
8. **Settings** (Profile, Pomodoro, Notifications, Password, Categories)

---

## 🔄 Change Log
| Date | Change |
|---|---|
| 2026-09-25 | Project initiated, interview completed, plan created |
| 2026-09-25 | Memory file created |
| 2026-09-25 | Deep-dive interview completed — all details clarified, Daily Routine added as new module |
| 2026-09-25 | Implemented all core features (Layout, Home, Finance, Tasks, Routine, Habits, Calendar, Notes, Settings) with localStorage |
| 2026-09-25 | Added PWA setup (manifest.json, sw.js) and verified build |
| 2026-09-25 | Advanced Mobile Responsiveness (grid/flex stacking, table column hiding) |
| 2026-09-25 | Aesthetic Overhaul of Charts (gradients, rounded bars, glassmorphic tooltips) |
| 2026-09-25 | Automated Testing Suite (Vitest) configured & 110 tests passed (smoke, hooks, utils) |
| 2026-09-25 | Implemented global scroll animations (`whileInView` fade-ins on Finance/Tasks) |
