
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
          console.log("Fetching Supabase token for user:", user.id);
          
          // Get the JWT for Supabase from Clerk
          // Note: You'll need to create a "supabase" template in Clerk dashboard
          const token = await getToken({ template: "supabase" });
          
          if (token) {
            console.log("Supabase token received successfully");
            // Log the first 10 characters of the token for debugging
            console.log("Token preview:", token.substring(0, 10) + "...");
            
            // Parse the token to check its contents (JWT is base64 encoded)
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log("Token payload:", payload);
                
                // Check if the token has the expected claims
                if (!payload.aud) console.warn("Token missing 'aud' claim");
                if (!payload.role) console.warn("Token missing 'role' claim");
                if (!payload.user_id) console.warn("Token missing 'user_id' claim");
              }
            } catch (parseError) {
              console.error("Error parsing JWT token:", parseError);
            }
          } else {
            console.error("No token received from Clerk");
          }
          
          setSupabaseAccessToken(token);
        } catch (error) {
          console.error("Failed to get Supabase token:", error);
          setSupabaseAccessToken(null);
        }
      } else {
        console.log("No user logged in, clearing Supabase token");
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
