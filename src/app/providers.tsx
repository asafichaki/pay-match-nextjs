"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Suspense, useState } from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { AttributionCapture } from "@/components/AttributionCapture";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <AnalyticsTracker />
          <AttributionCapture />
        </Suspense>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
