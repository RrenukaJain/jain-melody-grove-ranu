
import { createContext, useContext, ReactNode } from "react";
import { 
  useUser, 
  useAuth as useClerkAuth, 
  useClerk,
  SignedIn,
  SignedOut 
} from "@clerk/clerk-react";

interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isSessionLoaded } = useClerkAuth();
  const { signOut } = useClerk();
  
  const isLoading = !isUserLoaded || !isSessionLoaded;
  
  // Clerk doesn't expose the session directly like Supabase does,
  // but we can maintain the same interface for compatibility
  const value = {
    user: user,
    session: user ? { user } : null,
    isLoading,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export these for convenience when building UI components
export { SignedIn, SignedOut };
