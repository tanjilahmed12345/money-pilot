import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/shared/ClientLayout";

export const metadata: Metadata = {
  title: "MoneyPilot - Personal Finance Dashboard",
  description: "Track your income, expenses, and budgets with MoneyPilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
