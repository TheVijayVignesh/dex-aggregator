import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { ReactNode } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Swap from "@/pages/Swap";
import History from "@/pages/History";
import Login from "@/pages/Login";
import ExchangeRoute from "@/pages/ExchangeRoute";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/swap" component={() => <ProtectedRoute><Swap /></ProtectedRoute>} />
      <Route path="/history" component={() => <ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/exchange" component={() => <ProtectedRoute><ExchangeRoute /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    window.location.href = "/login";
    return null;
  }
  
  return <>{children}</>;
}

function App() {
  const { isSignedIn, isLoaded } = useUser();

  console.log("Auth state:", { isSignedIn, isLoaded, pathname: window.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>DEX Aggregator</h1>
          <SignedOut>
            <SignInButton forceRedirectUrl="/" />
            <SignUpButton forceRedirectUrl="/" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
