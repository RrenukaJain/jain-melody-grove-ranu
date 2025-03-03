
"use client";

import { ClerkProvider as ClerkProviderOriginal } from "@clerk/clerk-react";
import { ReactNode } from "react";

// Use the publishable key from environment variables
const publishableKey = "pk_test_dG9nZXRoZXItcHJpbWF0ZS04MC5jbGVyay5hY2NvdW50cy5kZXYk";

export function ClerkProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProviderOriginal 
      publishableKey={publishableKey}
      // Use the correct property names for redirects
      signInFallbackRedirectUrl="/auth/callback"
      signInUrl="/auth?tab=login"
      signUpUrl="/auth?tab=register"
    >
      {children}
    </ClerkProviderOriginal>
  );
}
