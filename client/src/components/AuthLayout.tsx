import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MarketTicker } from "./MarketTicker";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <MarketTicker />
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SignedIn>
  );
}
