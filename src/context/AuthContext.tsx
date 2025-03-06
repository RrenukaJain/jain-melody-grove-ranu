
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
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
  const { isLoaded: isSessionLoaded, getToken } = useClerkAuth();
  const { signOut } = useClerk();
  const [supabaseAccessToken, setSupabaseAccessToken] = useState<string | null>(null);
  
  const isLoading = !isUserLoaded || !isSessionLoaded;
  
  // Fetch Supabase token when user changes
  useEffect(() => {
    const fetchSupabaseToken = async () => {
      if (user) {
        try {
          // Get the JWT for Supabase from Clerk
          // Note: You'll need to create a "supabase" template in Clerk dashboard
          const token = await getToken({ template: "supabase" });
          console.log("Fetched Supabase token:", token ? "Token received" : "No token");
          setSupabaseAccessToken(token);
        } catch (error) {
          console.error("Failed to get Supabase token:", error);
          setSupabaseAccessToken(null);
        }
      } else {
        setSupabaseAccessToken(null);
      }
    };
    
    fetchSupabaseToken();
  }, [user, getToken]);
  
  // Extend the user object with the Supabase token
  const enhancedUser = user ? {
    ...user,
    supabaseAccessToken
  } : null;
  
  // Clerk doesn't expose the session directly like Supabase does,
  // but we can maintain the same interface for compatibility
  const value = {
    user: enhancedUser,
    session: enhancedUser ? { user: enhancedUser } : null,
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
