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

**MoneyPilot** is a privacy-first personal finance tracker that runs entirely in your browser. No backend, no database, no sign-up required — all your data stays on your device via LocalStorage.

Track income & expenses, set budgets, visualize spending patterns, and stay in control of your finances.

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | At-a-glance view of total balance, income, expenses, and this month's spending with recent transactions |
| **Transactions** | Add, edit, and delete transactions with category tagging, date, and notes |
| **Search & Filter** | Filter by type, category, date range — sort by date or amount — search by title |
| **Analytics** | Pie chart (category breakdown), Bar chart (monthly overview), Line chart (spending trend) |
| **Budget Tracker** | Set overall or per-category monthly budgets with visual progress bars and alerts at 80% and 100% |
| **Calendar View** | See daily expenses on a calendar grid — click any date to view its transactions |
| **Category Management** | 9 built-in categories + create, edit, and delete your own with custom name, color, and icon |
| **Dark / Light Mode** | Toggle between themes — preference is saved automatically |
| **Multi-Currency** | Switch between ৳ (BDT), $ (USD), and € (EUR) |
| **Data Export** | Export all data as JSON or transactions as CSV |
| **Data Import** | Import transactions from a JSON file |
| **Reset** | One-click reset to clear all data and start fresh |

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

- **Node.js** 18.18 or later — [Download](https://nodejs.org/)
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

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

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
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── transactions/       # Transaction management page
│   │   ├── analytics/          # Charts and analytics page
│   │   ├── budget/             # Budget tracker page
│   │   ├── calendar/           # Calendar view page
│   │   ├── settings/           # Settings page
│   │   ├── globals.css         # Global styles and CSS variables
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Redirects to /dashboard
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Select.tsx
│   │   ├── charts/             # Recharts chart components
│   │   │   ├── CategoryPieChart.tsx
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   └── SpendingTrendChart.tsx
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── QuickExpenseChart.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   └── StatCards.tsx
│   │   ├── transactions/       # Transaction-specific components
│   │   │   ├── TransactionFilters.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionList.tsx
│   │   └── shared/             # Layout components
│   │       ├── ClientLayout.tsx
│   │       ├── Sidebar.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── store/
│   │   └── index.ts            # Zustand store (transactions, categories, budgets, settings)
│   │
│   ├── hooks/
│   │   ├── useFilteredTransactions.ts
│   │   └── useHydration.ts
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces and types
│   │
│   ├── utils/
│   │   └── index.ts            # Formatting, calculations, export helpers
│   │
│   └── lib/
│       └── constants.ts        # Default categories, currencies, nav items
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

### Setting a Budget

1. Go to the **Budget** page
2. Click **Set Budget**
3. Choose a category (or "Overall Budget" for total spending)
4. Enter the budget amount and select the month
5. Track your progress via the visual progress bar

### Exporting Your Data

1. Go to **Settings**
2. Under **Data Management**, click:
   - **Export JSON** — full backup of all data (transactions, categories, budgets, settings)
   - **Export CSV** — transactions only, spreadsheet-compatible

### Importing Data

1. Go to **Settings**
2. Click **Import JSON**
3. Select a previously exported JSON file
4. Imported transactions are merged with existing data

### Switching Theme or Currency

1. Go to **Settings**
2. Use the **Theme** dropdown to switch between Light and Dark
3. Use the **Currency** dropdown to switch between ৳, $, and €

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
- **No data is sent to any server** — the app is 100% client-side
- Clearing browser data or using **Reset All Data** in Settings will permanently delete everything
- Use **Export JSON** regularly to back up your data

---

## License

This project is open source and available under the [MIT License](LICENSE).
