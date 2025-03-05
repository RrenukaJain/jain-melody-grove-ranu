
"use client";

import { ClerkProvider as ClerkProviderOriginal } from "@clerk/clerk-react";
import { ReactNode } from "react";

// const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_dG9nZXRoZXItcHJpbWF0ZS04MC5jbGVyay5hY2NvdW50cy5kZXYk";
const publishableKey = "pk_test_dG9nZXRoZXItcHJpbWF0ZS04MC5jbGVyay5hY2NvdW50cy5kZXYk";

export function ClerkProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProviderOriginal 
      publishableKey={publishableKey}
      // Update configuration for proper SSO handling
      signInUrl="/auth?tab=login"
      signUpUrl="/auth?tab=register"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      redirectUrl="/auth/callback"
    >
      {children}
    </ClerkProviderOriginal>
  );
}
