
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
  
  // Handle different paths including /auth/verify-email-address
  const pathName = location.pathname;
  const isVerifyEmailPath = pathName.includes('verify-email-address');

  // Extract email from URL params if present
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || "";

  useEffect(() => {
    console.log("Auth callback path:", pathName);
    console.log("Is verify email path:", isVerifyEmailPath);
    
    if (isLoaded) {
      // Handle email verification flow
      if (isVerifyEmailPath) {
        console.log("Handling email verification flow");
        // This is the email verification flow, show appropriate message
        toast.success("Please check your email to complete verification");
        // Don't redirect immediately for verification flow
        return;
      }
      
      // For normal auth callback
      if (isSignedIn) {
        toast.success("Successfully authenticated!");
      }
      
      // Redirect to home page after authentication if not in verification flow
      if (!isVerifyEmailPath) {
        navigate("/", { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, navigate, pathName, isVerifyEmailPath]);

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
      if (!client.signUp.status || client.signUp.status === "complete") {
        // Try to get the attempt from the email verification process
        await client.signUp.attemptEmailAddressVerification({ code: verificationCode });
        console.log("Email verification successful");
        
        toast.success("Email verified successfully!");
        navigate("/", { replace: true });
      } else {
        // Complete the signup process with the verification code
        await client.signUp.attemptEmailAddressVerification({ code: verificationCode });
        toast.success("Email verified and registration complete!");
        navigate("/", { replace: true });
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
        <h2 className="text-2xl font-bold mb-4">
          {isVerifyEmailPath 
            ? "Email Verification Required" 
            : "Finalizing authentication..."}
        </h2>
        
        {isVerifyEmailPath ? (
          <>
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
          <p>
            Please wait while we complete your sign-in process.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
