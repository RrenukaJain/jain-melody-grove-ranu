
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  
  // Handle different paths including /auth/verify-email-address
  const pathName = location.pathname;
  const isVerifyEmailPath = pathName.includes('verify-email-address');

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

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isVerifyEmailPath 
            ? "Email Verification Required" 
            : "Finalizing authentication..."}
        </h2>
        <p>
          {isVerifyEmailPath
            ? "Please check your inbox and follow the instructions to verify your email."
            : "Please wait while we complete your sign-in process."}
        </p>
        {isVerifyEmailPath && (
          <div className="mt-4">
            <a href="/" className="text-[#1DB954] hover:underline">
              Return to home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
