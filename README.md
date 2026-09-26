# Personal Dashboard

A comprehensive, all-in-one personal dashboard built with React, Vite, and Recharts.

## Features

- **Dashboard Home**: High-level overview of daily stats (P&L, active tasks, habit progress, upcoming bills).
- **Finance Module**: Track transactions, set budgets, manage savings goals, and track subscriptions with analytics.
- **Tasks Module**: Manage tasks via List view, Kanban board, and a built-in Pomodoro timer.
- **Daily Routine**: Template-based daily routine blocks (Morning, Afternoon, Evening, Night) with progress tracking.
- **Habits Tracker**: Track daily habits (binary or quantitative) with streak badges and 7-day visual history.
- **Calendar**: Unified view of all tasks, bills, and habit completions for any given day.
- **Journal / Notes**: Daily reflections with mood tracking and a clean rich-text editor layout.
- **Settings**: Manage profile, pomodoro defaults, and a global access password.

## Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: react-icons
- **Dates**: date-fns
- **Styling**: Vanilla CSS (Glassmorphism design system)
- **Data Storage**: `localStorage` abstraction (ready for Supabase migration)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   Open your browser to `http://localhost:5173`. 
   **Default Password:** `dashboard123`

## Progress Tracking

See `memory.md` for project decisions and phase tracking.
