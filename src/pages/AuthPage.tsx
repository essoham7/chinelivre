import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { InstallPrompt } from "../components/pwa/InstallPrompt";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleSuccess = () => {
    // Redirect to dashboard or home after successful authentication
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen">
      {isLogin ? (
        <LoginForm onSuccess={handleSuccess} onToggleForm={handleToggleForm} />
      ) : (
        <RegisterForm
          onSuccess={handleSuccess}
          onToggleForm={handleToggleForm}
        />
      )}
      <InstallPrompt triggerOnMount />
    </div>
  );
}
