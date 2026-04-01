import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shared/AppShell";

export const metadata: Metadata = {
  title: "MoneyPilot - Personal Finance Dashboard",
  description: "Track your income, expenses, and budgets with MoneyPilot",
  icons: {
    icon: "/favicon.svg",
  },
};

// Detect system preference before React hydration to prevent FOUC.
const themeScript = `
(function() {
  try {
    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
