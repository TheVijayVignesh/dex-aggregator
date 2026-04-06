import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Clerk Key:", PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_YOUR_CLERK_PUBLISHABLE_KEY_HERE") {
  console.error("Clerk publishable key not configured. Please update your .env file with a real Clerk key.");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    afterSignInUrl="/"
    afterSignUpUrl="/"
  >
    <App />
  </ClerkProvider>
);
