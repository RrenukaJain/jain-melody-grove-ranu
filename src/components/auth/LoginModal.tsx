
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";

interface LoginModalProps {
  onClose: () => void;
  songId?: string;
}

const LoginModal = ({ onClose, songId }: LoginModalProps) => {
  const navigate = useNavigate();

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
      
      <div className="py-4">
        <SignIn 
          routing="path" 
          path="/auth" 
          signUpUrl="/auth?tab=register"
          afterSignInUrl={window.location.pathname}
          redirectUrl="/auth/callback"
          // Add SSO specific handling
          afterSocialSignInUrl={window.location.pathname}
          socialButtonsPlacement="bottom"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              header: "hidden",
              formButtonPrimary: "bg-[#1DB954] hover:bg-[#1ed760] text-black",
              formFieldLabel: "text-white",
              formFieldInput: "bg-[#262626] border-none text-white",
              footerActionLink: "text-[#1DB954]",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-[#1DB954]",
              formFieldAction: "text-[#1DB954]",
              formFieldInputShowPasswordButton: "text-white",
              dividerLine: "bg-gray-700",
              dividerText: "text-gray-400 bg-[#1a1a1a]",
              socialButtonsBlockButton: "bg-[#262626] hover:bg-[#333] text-white border-none",
              formFieldErrorText: "text-red-400",
              alertText: "text-red-400",
            }
          }}
        />
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
