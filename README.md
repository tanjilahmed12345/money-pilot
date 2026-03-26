<p align="center">
  <img src="https://img.shields.io/badge/MoneyPilot-Personal%20Finance-2563eb?style=for-the-badge&logoColor=white" alt="MoneyPilot" />
</p>

<h1 align="center">MoneyPilot</h1>

<p align="center">
  <strong>A modern, fully client-side personal finance dashboard built with Next.js</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-443e38?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Recharts-3-ff7300?style=flat-square" alt="Recharts" />
  <img src="https://img.shields.io/badge/Claude_AI-Powered-d97706?style=flat-square" alt="Claude AI" />
</p>

---

## Overview

**MoneyPilot** is a privacy-first personal finance tracker that runs entirely in your browser. No backend, no database, no sign-up required -- all your data stays on your device via LocalStorage.

Track income & expenses, set budgets, save toward goals, monitor net worth, visualize spending patterns, detect anomalies, import bank statements, export PDF reports, and stay in control of your finances -- with AI-powered insights along the way.

---

## Features

### Core

| Feature | Description |
|---|---|
| **Dashboard** | At-a-glance balance, income, expenses, savings rate, monthly comparison, top spending categories, stats bar, budget alerts, spending anomaly alerts, and recent transactions |
| **Transactions** | Add, edit, delete, and duplicate transactions with category tagging, date, notes, and configurable pagination (10/20/50/100 per page) |
| **Search & Filter** | Advanced filter panel with type, category, date range, amount range -- sort by date or amount -- search by title -- URL state sync for shareable filters |
| **Analytics** | Pie chart (category breakdown), bar chart (monthly overview), line chart (spending trend), category spending trends (12 months), and categories above average detection |
| **Budget Tracker** | Set overall or per-category monthly budgets with progress bars and multi-level alerts (75% warning, 90% critical, 100% exceeded). Copy budgets from last month |
| **Calendar View** | See daily expenses on a calendar grid with color-coded category indicators -- click any date to view its transactions |

### Financial Planning

| Feature | Description |
|---|---|
| **Recurring Transactions** | Create templates for repeating income/expenses (rent, salary, subscriptions) with daily/weekly/monthly/yearly frequency. Auto-apply on due dates, one-click **Apply Now**, pause/resume toggle, and tag-based grouping (subscription, bill, income, other) |
| **Savings Goals** | Set financial targets with custom name, icon, color, and deadline. Add or withdraw funds, track progress with circular progress rings, monthly pace calculation, estimated completion date, and behind-pace warnings |
| **Net Worth** | Track assets (bank, investment, property, cash) and liabilities (loan, credit card, mortgage). Auto-snapshots monthly with a net worth over time chart |
| **Reports** | Monthly or yearly financial summaries with key metrics, top spending categories, biggest single expense, and income vs expenses bar. Export as PDF |

### AI-Powered

| Feature | Description |
|---|---|
| **Auto-Categorization** | Three-tier system: (1) keyword rules for common merchants, (2) Claude AI fallback for unknown merchants, (3) merchant memory that learns from your corrections |
| **Spending Anomaly Detection** | Alerts when any category's spending exceeds its 3-month average by more than 30% -- shown on both the Dashboard and Analytics pages |
| **AI Spending Insight** | Weekly Claude-powered financial summary with personalized observations and tips based on your recent spending patterns |

### UX & Navigation

| Feature | Description |
|---|---|
| **Global Search** | Command palette in the header (Ctrl+K) that indexes 80+ features across all pages. Shows which page each feature is on, supports keyboard navigation, and scrolls directly to the exact section with a highlight effect |
| **Dark / Light Mode Toggle** | Pill-shaped toggle switch in the sticky header for instant theme switching. Also configurable via Settings (light/dark/system). SSR-safe with no flash of unstyled content |
| **CSV Import** | Import bank statements with auto-detected date formats, duplicate detection, auto-categorization per row, preview table with selective import, and per-row type/category editing |

### Settings & Data

| Feature | Description |
|---|---|
| **Category Management** | 9 built-in categories + create, edit, and delete your own with custom name, color, and emoji icon |
| **Multi-Currency** | Switch between Taka (&#2547;), Dollar ($), and Euro (&euro;) |
| **Data Export** | Export all data as JSON (full backup) or transactions as CSV |
| **Data Import** | Import from JSON backup or CSV bank statement |
| **Reset** | One-click reset to clear all data and start fresh (with confirmation) |

---

## Pages

| Route | Page | What it does |
|---|---|---|
| `/dashboard` | Dashboard | Financial overview with stat cards, stats bar, budget alerts, anomaly alerts, monthly comparison, top spending, AI insight, spending breakdown, and recent transactions |
| `/transactions` | Transactions | Full CRUD list with search, filters, sorting, duplicate, pagination (10/20/50/100), and auto-categorization |
| `/analytics` | Analytics | Overview tab (pie, bar, line charts, anomaly cards) and Trends tab (12-month category trends, above-average table) |
| `/budget` | Budget | Monthly budget management with per-category tracking, multi-level threshold alerts, and copy from last month |
| `/recurring` | Recurring | Template manager for repeating transactions with auto-apply, pause/resume, due date tracking, and tag colors |
| `/goals` | Goals | Savings goal tracker with fund/withdraw, circular progress rings, deadlines, pace tracking, and estimated completion |
| `/net-worth` | Net Worth | Asset/liability tracker with typed entries, auto-monthly snapshots, and net worth over time chart |
| `/calendar` | Calendar | Monthly calendar grid showing daily expense totals with color-coded category dots and transaction drill-down |
| `/reports` | Reports | Monthly/yearly financial summaries with key metrics, top categories, income vs expenses, and PDF export |
| `/import` | Import CSV | CSV bank statement import with auto-detect, duplicate detection, preview table, and selective import |
| `/settings` | Settings | Appearance (theme, currency), category management, data export/import (JSON + CSV), and danger zone (reset) |

### API Routes

| Route | Purpose |
|---|---|
| `/api/categorize-merchant` | Claude AI merchant categorization (fallback when keyword rules don't match) |
| `/api/spending-summary` | Claude AI weekly spending summary with personalized financial insights |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router + Turbopack) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) with CSS custom properties |
| State Management | [Zustand 5](https://zustand.docs.pmnd.rs/) with `persist` middleware |
| Charts | [Recharts 3](https://recharts.org/) |
| AI | [Anthropic Claude API](https://docs.anthropic.com/) (`@anthropic-ai/sdk`) |
| CSV Parsing | [PapaParse](https://www.papaparse.com/) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |
| IDs | [uuid](https://www.npmjs.com/package/uuid) |
| Persistence | Browser LocalStorage (100% client-side) |

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

### Environment Variables (Optional)

For AI-powered features (auto-categorization and spending insights), set your Anthropic API key:

```bash
# Create a .env.local file
ANTHROPIC_API_KEY=your-api-key-here
```

Without this key, the app works fully -- AI features gracefully fall back to keyword-based categorization.

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
│   ├── app/                          # Next.js App Router pages
│   │   ├── dashboard/                # Dashboard with stats, alerts, charts
│   │   ├── transactions/             # Transaction management (CRUD + pagination)
│   │   ├── analytics/                # Charts, trends, and anomaly detection
│   │   ├── budget/                   # Budget tracker with threshold alerts
│   │   ├── recurring/                # Recurring transaction templates
│   │   ├── goals/                    # Savings goals with progress tracking
│   │   ├── net-worth/                # Asset/liability tracker with snapshots
│   │   ├── calendar/                 # Calendar view with daily drill-down
│   │   ├── reports/                  # Financial reports with PDF export
│   │   ├── import/                   # CSV bank statement import
│   │   ├── settings/                 # Theme, currency, categories, data management
│   │   ├── api/
│   │   │   ├── categorize-merchant/  # AI merchant categorization endpoint
│   │   │   └── spending-summary/     # AI spending insights endpoint
│   │   ├── globals.css               # Global styles and CSS variables (light + dark)
│   │   ├── layout.tsx                # Root layout with FOUC-prevention script
│   │   └── page.tsx                  # Redirects to /dashboard
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── charts/                   # Recharts chart components
│   │   │   ├── CategoryPieChart.tsx
│   │   │   ├── CategoryTrendsChart.tsx
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   ├── NetWorthChart.tsx
│   │   │   └── SpendingTrendChart.tsx
│   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── AiSpendingSummary.tsx
│   │   │   ├── BudgetAlerts.tsx
│   │   │   ├── MonthlyComparison.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   ├── SpendingAnomalyAlerts.tsx
│   │   │   ├── SpendingBreakdown.tsx
│   │   │   ├── StatCards.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── TopSpending.tsx
│   │   ├── transactions/             # Transaction components
│   │   │   ├── TransactionFilters.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionList.tsx
│   │   └── shared/                   # Layout components
│   │       ├── ClientLayout.tsx
│   │       ├── Header.tsx            # Sticky header with search bar + theme toggle
│   │       ├── Sidebar.tsx           # Desktop sidebar + mobile bottom nav
│   │       └── ThemeProvider.tsx
│   │
│   ├── store/
│   │   └── index.ts                  # Zustand store with persist middleware
│   │                                 # Slices: transactions, categories, budgets,
│   │                                 # recurring, savings, net worth, merchant map,
│   │                                 # AI summary cache, settings
│   │
│   ├── hooks/
│   │   ├── useFilteredTransactions.ts  # Transaction search/filter/sort logic
│   │   ├── useHydration.ts             # SSR hydration detection
│   │   └── useShallowStore.ts          # Shallow Zustand selector for performance
│   │
│   ├── lib/                          # Core business logic
│   │   ├── auto-categorize.ts        # Keyword rules + AI categorization + merchant memory
│   │   ├── csv-import.ts             # CSV parsing, date detection, duplicate checking
│   │   ├── anomaly.ts                # Spending anomaly detection algorithm
│   │   ├── recurring.ts              # Due date calculations, overdue checks
│   │   └── constants.ts              # Default categories, currencies, nav items
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces and types
│   │
│   └── utils/
│       └── index.ts                  # Formatting, calculations, stats, export helpers
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
3. Fill in the amount, type (income/expense/transfer), merchant name, category, date, and optional notes
4. The merchant name auto-suggests a category (via keyword rules, merchant memory, or AI)
5. Click **Add Transaction**

### Duplicating a Transaction

1. On the **Transactions** page, find the transaction you want to copy
2. Click the **copy icon** button
3. A new transaction is created with the same details but today's date

### Importing Bank Statements (CSV)

1. Go to the **Import CSV** page
2. Click the upload area and select a CSV file from your bank
3. MoneyPilot auto-detects columns (date, description, amount) and categorizes each row
4. Review the preview table -- toggle rows on/off, change types or categories per row
5. Duplicates are auto-flagged and excluded
6. Click **Import** to add selected transactions

### Setting Up Recurring Transactions

1. Go to the **Recurring** page
2. Click **Add**
3. Fill in the title, amount, type, tag (subscription/bill/income/other), category, frequency, and start date
4. Click **Create Template**
5. Transactions are auto-applied when due, or click **Apply** to log one manually

### Creating a Savings Goal

1. Go to the **Goals** page
2. Click **New Goal**
3. Enter the goal name, target amount, icon, color, optional deadline, and optional linked category
4. Click **Create Goal**
5. Use **+ Add Funds** or **- Withdraw** to update your progress over time
6. The app shows pace tracking, estimated completion, and behind-pace warnings

### Tracking Net Worth

1. Go to the **Net Worth** page
2. Click **+ Add Asset** or **+ Add Liability**
3. Enter a name, value, and type (bank/investment/property/cash or loan/credit card/mortgage)
4. Monthly snapshots are taken automatically -- view your net worth trend over time in the chart

### Setting a Budget

1. Go to the **Budget** page
2. Click **Set Budget**
3. Choose a category (or "Overall Budget" for total spending)
4. Enter the budget amount and select the month
5. Track your progress via visual progress bars
6. Warnings appear at 75%, critical alerts at 90%, and exceeded alerts at 100%
7. Use **Copy Last Month** to quickly replicate last month's budgets

### Generating Reports

1. Go to the **Reports** page
2. Toggle between **Monthly** and **Yearly** views
3. Select the period from the dropdown
4. View key metrics, top spending categories, biggest expense, and income vs expenses
5. Click **Export PDF** to download a print-ready report

### Using Global Search

1. Press **Ctrl+K** (or click the search bar in the header)
2. Type any feature name (e.g., "Category-wise Expenses", "Danger Zone", "Net Worth")
3. Results show the feature name and which page it's on
4. Click a result (or use arrow keys + Enter) to navigate directly to that section
5. The target section is highlighted briefly so you can spot it

### Switching Theme

- Use the **toggle switch** in the top-right header to instantly switch between dark and light mode
- For system theme (auto-detect), go to **Settings > Appearance > Theme** and select "System Default"

### Exporting Your Data

1. Go to **Settings**
2. Under **Data Management**, click:
   - **Export JSON** -- full backup of all data (transactions, categories, budgets, goals, assets, settings)
   - **Export CSV** -- transactions only, spreadsheet-compatible

### Importing Data

1. Go to **Settings**
2. Click **Import JSON**
3. Select a previously exported JSON file
4. Imported transactions are merged with existing data

---

## Responsive Design

| Viewport | Layout |
|---|---|
| **Desktop** (1024px+) | Fixed sidebar navigation on the left, sticky header with search + theme toggle |
| **Mobile / Tablet** (< 1024px) | Horizontally scrollable bottom navigation bar, full-width header |

All pages, cards, charts, modals, and drawers adapt to screen size automatically.

---

## Data & Privacy

- All data is stored **locally in your browser** using LocalStorage
- **No data is sent to any server** -- the app is 100% client-side
- The only external calls are to the **Anthropic Claude API** (optional) for merchant categorization and spending insights -- these send only the merchant name or aggregated spending data, never your full transaction history
- Clearing browser data or using **Reset All Data** in Settings will permanently delete everything
- Use **Export JSON** regularly to back up your data

---

## License

This project is open source and available under the [MIT License](LICENSE).
