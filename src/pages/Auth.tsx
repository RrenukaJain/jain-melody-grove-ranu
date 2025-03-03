
"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  
  // Get search params for tab switching
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  // Get the redirect path from the location state, or default to "/"
  const from = location.state?.from || "/";
  const songId = location.state?.songId;

  // Set active tab based on URL parameter if available
  useEffect(() => {
    if (tabParam === 'register') {
      setActiveTab('register');
    }
  }, [tabParam]);

  // Check if user is already logged in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // If there's a songId in the state, include it in the toast
      if (songId) {
        toast.success("Successfully signed in! You can now play the song.");
      } else {
        toast.success("Successfully signed in!");
      }
      navigate(from, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate, from, songId]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212] p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-none text-white">
        <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-[#262626]">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardContent>
              <SignIn 
                routing="path" 
                path="/auth" 
                signUpUrl="/auth?tab=register"
                afterSignInUrl={from}
                redirectUrl="/auth/callback"
                socialButtonsPlacement="bottom"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none",
                    headerTitle: "text-white",
                    headerSubtitle: "text-gray-400",
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
            </CardContent>
          </TabsContent>
          
          <TabsContent value="register">
            <CardContent>
              <SignUp 
                routing="path" 
                path="/auth" 
                signInUrl="/auth?tab=login"
                redirectUrl="/auth/callback"
                afterSignUpUrl="/"
                socialButtonsPlacement="bottom"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none",
                    headerTitle: "text-white",
                    headerSubtitle: "text-gray-400",
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
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
