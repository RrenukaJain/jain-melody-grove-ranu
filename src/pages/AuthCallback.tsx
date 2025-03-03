
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  const { client } = useClerk();
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Handle different paths
  const pathName = location.pathname;
  const isVerifyEmailPath = pathName.includes('verify-email-address');
  const isSsoCallbackPath = pathName.includes('sso-callback');
  
  // Extract email from URL params if present
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || "";

  useEffect(() => {
    console.log("Auth callback path:", pathName);
    console.log("Is verify email path:", isVerifyEmailPath);
    console.log("Is SSO callback path:", isSsoCallbackPath);
    
    if (isLoaded) {
      // Handle SSO callback
      if (isSsoCallbackPath) {
        console.log("Handling SSO callback flow");
        // The SSO callback is handled automatically by Clerk
        // Just show a message and wait for the redirect
        toast.success("Completing authentication...");
        return;
      }
      
      // Handle email verification flow
      if (isVerifyEmailPath) {
        console.log("Handling email verification flow");
        toast.success("Please check your email to complete verification");
        return;
      }
      
      // For normal auth callback
      if (isSignedIn) {
        toast.success("Successfully authenticated!");
        navigate("/", { replace: true });
      } else if (!isVerifyEmailPath && !isSsoCallbackPath) {
        // Only redirect for regular auth callbacks if not in verification or SSO flow
        navigate("/", { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, navigate, pathName, isVerifyEmailPath, isSsoCallbackPath]);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code from your email");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Check if we have pending verification
      if (client && client.signUp && client.signUp.status !== "complete") {
        // Complete the signup process with the verification code
        await client.signUp.attemptEmailAddressVerification({ code: verificationCode });
        console.log("Email verification successful");
        
        toast.success("Email verified and registration complete!");
        navigate("/", { replace: true });
      } else {
        console.log("No active sign-up session found");
        setError("Invalid or expired verification code. Please try signing up again.");
        toast.error("Invalid or expired verification code.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify email. Please try again.");
      toast.error(err.message || "Verification failed. Please check the code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-white text-center p-6 max-w-md w-full bg-[#1a1a1a] rounded-lg shadow-lg">
        {isSsoCallbackPath ? (
          // SSO Callback UI
          <>
            <h2 className="text-2xl font-bold mb-4">Completing Authentication</h2>
            <p className="mb-6">
              Please wait while we complete your sign-in process...
            </p>
            <div className="animate-pulse flex justify-center">
              <div className="h-4 w-24 bg-gray-600 rounded"></div>
            </div>
          </>
        ) : isVerifyEmailPath ? (
          // Email Verification UI
          <>
            <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
            <p className="mb-6">
              Please check your inbox and enter the verification code we sent to your email.
            </p>
            
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="bg-[#262626] border-none text-white w-full p-3 text-center text-lg tracking-widest"
                  maxLength={6}
                />
                {error && <p className="text-red-400 text-sm text-left">{error}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
            
            <div className="mt-4">
              <a href="/" className="text-[#1DB954] hover:underline">
                Return to home
              </a>
            </div>
          </>
        ) : (
          // Default Callback UI
          <>
            <h2 className="text-2xl font-bold mb-4">Finalizing authentication...</h2>
            <p>
              Please wait while we complete your sign-in process.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
