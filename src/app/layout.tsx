import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shared/AppShell";

export const metadata: Metadata = {
  title: "MoneyPilot - Personal Finance Dashboard",
  description: "Track your income, expenses, and budgets with MoneyPilot",
};

// Blocking script that runs before React hydration to prevent FOUC.
// Reads the stored theme from localStorage and applies the dark class immediately.
const themeScript = `
(function() {
  try {
    var stored = JSON.parse(localStorage.getItem('money-pilot-storage') || '{}');
    var theme = stored.state && stored.state.settings && stored.state.settings.theme;
    var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
