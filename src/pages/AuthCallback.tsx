
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clerk will handle the authentication callback automatically
    // We just need to redirect to home page
    navigate("/", { replace: true });
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
