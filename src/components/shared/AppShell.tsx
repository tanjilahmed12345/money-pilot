"use client";

import { usePathname } from "next/navigation";
import { ClientLayout } from "./ClientLayout";

const AUTH_PATHS = ["/auth"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}
