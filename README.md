<p align="center">
  <img src="https://img.shields.io/badge/MoneyPilot-Personal%20Finance-2563eb?style=for-the-badge&logoColor=white" alt="MoneyPilot" />
</p>

<h1 align="center">MoneyPilot</h1>

<p align="center">
  <strong>A modern, fully client-side personal finance dashboard built with Next.js</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-443e38?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Recharts-3-ff7300?style=flat-square" alt="Recharts" />
</p>

---

## Overview

**MoneyPilot** is a privacy-first personal finance tracker that runs entirely in your browser. No backend, no database, no sign-up required -- all your data stays on your device via LocalStorage.

Track income & expenses, set budgets, save toward goals, visualize spending patterns, and stay in control of your finances.

---

## Features

### Core

| Feature | Description |
|---|---|
| **Dashboard** | At-a-glance balance, income, expenses, monthly comparison, top spending categories, stats bar, and recent transactions |
| **Transactions** | Add, edit, delete, and **duplicate** transactions with category tagging, date, and notes |
| **Search & Filter** | Filter by type, category, date range -- sort by date or amount -- search by title |
| **Analytics** | Pie chart (category breakdown), Bar chart (monthly overview), Line chart (spending trend) |
| **Budget Tracker** | Set overall or per-category monthly budgets with progress bars and alerts at 80% / 100% |
| **Calendar View** | See daily expenses on a calendar grid -- click any date to view its transactions |

### New

| Feature | Description |
|---|---|
| **Recurring Transactions** | Create templates for repeating income/expenses (rent, salary, subscriptions) with daily/weekly/monthly/yearly frequency. One-click **Apply Now** to instantly log a transaction from any template |
| **Savings Goals** | Set financial targets (vacation, emergency fund, new gadget) with custom name, icon, color, and deadline. Add or withdraw funds and track progress with visual bars. Summary cards show total saved, total target, and overall progress |
| **Monthly Comparison** | Dashboard widget comparing this month vs last month for both income and expense, with percentage change indicators (green/red arrows) |
| **Top Spending** | Dashboard widget showing your top 5 spending categories for the current month with proportional progress bars |
| **Statistics Bar** | Dashboard widget with total transaction count, average daily spend, projected monthly expense, and highest single expense |
| **Duplicate Transaction** | One-click duplicate button on every transaction -- copies all fields with today's date for quick re-entry |

### Settings & Data

| Feature | Description |
|---|---|
| **Category Management** | 9 built-in categories + create, edit, and delete your own with custom name, color, and icon |
| **Dark / Light Mode** | Toggle between themes -- preference is saved automatically |
| **Multi-Currency** | Switch between Taka, Dollar, and Euro |
| **Data Export** | Export all data as JSON or transactions as CSV |
| **Data Import** | Import transactions from a JSON file |
| **Reset** | One-click reset to clear all data and start fresh |

---

## Pages

| Route | Page | What it does |
|---|---|---|
| `/dashboard` | Dashboard | Financial overview with stat cards, stats bar, monthly comparison, top spending, recent transactions, and expense chart |
| `/transactions` | Transactions | Full CRUD list with search, filters, sorting, duplicate, and color-coded income/expense |
| `/analytics` | Analytics | Pie, Bar, and Line charts powered by Recharts |
| `/budget` | Budget | Monthly budget management with per-category tracking and threshold alerts |
| `/recurring` | Recurring | Template manager for repeating transactions with one-click apply |
| `/goals` | Goals | Savings goal tracker with fund/withdraw, deadlines, and progress visualization |
| `/calendar` | Calendar | Monthly calendar grid showing daily expense totals with drill-down |
| `/settings` | Settings | Theme, currency, category management, data export/import, and reset |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| State Management | [Zustand](https://zustand.docs.pmnd.rs/) with `persist` middleware |
| Charts | [Recharts](https://recharts.org/) |
| IDs | [uuid](https://www.npmjs.com/package/uuid) |
| Persistence | Browser LocalStorage |

---

## Getting Started

### Prerequisites

- **Node.js** 18.18 or later -- [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/money-pilot.git
cd money-pilot

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Build for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

---

## Project Structure

```
money-pilot/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── dashboard/              # Dashboard with stats, comparison, top spending
│   │   ├── transactions/           # Transaction management (CRUD + duplicate)
│   │   ├── analytics/              # Charts and analytics
│   │   ├── budget/                 # Budget tracker
│   │   ├── recurring/              # Recurring transaction templates
│   │   ├── goals/                  # Savings goals tracker
│   │   ├── calendar/               # Calendar view
│   │   ├── settings/               # Settings and data management
│   │   ├── globals.css             # Global styles and CSS variables
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Redirects to /dashboard
│   │
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Select.tsx
│   │   ├── charts/                 # Recharts chart components
│   │   │   ├── CategoryPieChart.tsx
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   └── SpendingTrendChart.tsx
│   │   ├── dashboard/              # Dashboard widgets
│   │   │   ├── MonthlyComparison.tsx
│   │   │   ├── QuickExpenseChart.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   ├── StatCards.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── TopSpending.tsx
│   │   ├── transactions/           # Transaction components
│   │   │   ├── TransactionFilters.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionList.tsx
│   │   └── shared/                 # Layout components
│   │       ├── ClientLayout.tsx
│   │       ├── Sidebar.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── store/
│   │   └── index.ts                # Zustand store (6 slices: transactions,
│   │                               #   categories, budgets, recurring, savings, settings)
│   ├── hooks/
│   │   ├── useFilteredTransactions.ts
│   │   └── useHydration.ts
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces and types
│   │
│   ├── utils/
│   │   └── index.ts                # Formatting, calculations, stats, export helpers
│   │
│   └── lib/
│       └── constants.ts            # Default categories, currencies, nav items
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Usage Guide

### Adding a Transaction

1. Go to the **Transactions** page
2. Click the **Add** button (top right)
3. Fill in the title, amount, type (income/expense), category, date, and optional notes
4. Click **Add Transaction**

### Duplicating a Transaction

1. On the **Transactions** page, find the transaction you want to copy
2. Click the **copy icon** button (first action button)
3. A new transaction is created with the same details but today's date

### Setting Up Recurring Transactions

1. Go to the **Recurring** page
2. Click **Add Template**
3. Fill in the title, amount, type, category, frequency (daily/weekly/monthly/yearly), and notes
4. Click **Create Template**
5. Whenever you need to log that transaction, click **Apply Now** on the template card

### Creating a Savings Goal

1. Go to the **Goals** page
2. Click **New Goal**
3. Enter the goal name, target amount, icon, color, and optional deadline
4. Click **Create Goal**
5. Use **+ Add Funds** or **- Withdraw** to update your progress over time

### Setting a Budget

1. Go to the **Budget** page
2. Click **Set Budget**
3. Choose a category (or "Overall Budget" for total spending)
4. Enter the budget amount and select the month
5. Track your progress via the visual progress bar
6. Warnings appear at 80% and alerts at 100%

### Exporting Your Data

1. Go to **Settings**
2. Under **Data Management**, click:
   - **Export JSON** -- full backup of all data (transactions, categories, budgets, settings)
   - **Export CSV** -- transactions only, spreadsheet-compatible

### Importing Data

1. Go to **Settings**
2. Click **Import JSON**
3. Select a previously exported JSON file
4. Imported transactions are merged with existing data

### Switching Theme or Currency

1. Go to **Settings**
2. Use the **Theme** dropdown to switch between Light and Dark
3. Use the **Currency** dropdown to switch between Taka, Dollar, and Euro

---

## Responsive Design

| Viewport | Layout |
|---|---|
| **Desktop** (1024px+) | Fixed sidebar navigation on the left |
| **Mobile / Tablet** (< 1024px) | Bottom navigation bar |

All pages, cards, charts, and modals adapt to screen size automatically.

---

## Data & Privacy

- All data is stored **locally in your browser** using LocalStorage
- **No data is sent to any server** -- the app is 100% client-side
- Clearing browser data or using **Reset All Data** in Settings will permanently delete everything
- Use **Export JSON** regularly to back up your data

---

## License

This project is open source and available under the [MIT License](LICENSE).
