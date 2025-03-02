
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      // Redirect to home page regardless of result
      navigate("/", { replace: true });
      
      if (error) {
        console.error("Error during auth callback:", error);
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
