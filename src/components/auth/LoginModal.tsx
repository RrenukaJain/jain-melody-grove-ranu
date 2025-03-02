
import { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LoginModalProps {
  onClose: () => void;
  songId?: string;
}

const LoginModal = ({ onClose, songId }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Logged in successfully");
      onClose();
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message || "Please check your credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // Redirect will be handled by the provider
    } catch (error: any) {
      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed`, {
        description: error.message || "Please try again",
      });
      setLoading(false);
    }
  };

  const goToFullLoginPage = () => {
    navigate("/auth", { state: { from: window.location.pathname, songId } });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-none text-white">
      <DialogHeader>
        <DialogTitle className="text-xl">Login Required</DialogTitle>
        <DialogDescription className="text-gray-400">
          Please sign in to play this song
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleEmailLogin} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-[#262626] border-none"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 bg-[#262626] border-none"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#1a1a1a] px-2 text-gray-400">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 py-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleOAuthLogin('google')}
          disabled={loading}
          className="bg-[#262626] hover:bg-[#333] text-white border-none"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Google
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleOAuthLogin('facebook')}
          disabled={loading}
          className="bg-[#262626] hover:bg-[#333] text-white border-none"
        >
          <Facebook className="h-5 w-5 mr-2 text-[#1877F2]" />
          Facebook
        </Button>
      </div>
      
      <DialogFooter className="flex flex-col sm:justify-start">
        <Button 
          variant="link" 
          className="text-gray-400 hover:text-white" 
          onClick={goToFullLoginPage}
        >
          Don't have an account? Sign up
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default LoginModal;
