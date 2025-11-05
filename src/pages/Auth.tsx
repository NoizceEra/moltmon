import { useState } from "react";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignInForm } from "@/components/auth/SignInForm";

const Auth = () => {
  const [showSignUp, setShowSignUp] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {showSignUp ? (
        <SignUpForm onToggle={() => setShowSignUp(false)} />
      ) : (
        <SignInForm onToggle={() => setShowSignUp(true)} />
      )}
    </div>
  );
};

export default Auth;
