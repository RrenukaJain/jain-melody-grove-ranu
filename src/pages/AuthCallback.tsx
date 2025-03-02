
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        toast.success("Successfully authenticated!");
      }
      
      // Redirect to home page after authentication
      navigate("/", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Finalizing authentication...</h2>
        <p>Please wait while we complete your sign-in process.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
