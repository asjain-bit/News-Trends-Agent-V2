import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/templates/AuthLayout';
import { Loader, Fingerprint } from 'lucide-react';

export default function Login() {
  const { login, user } = useAppStore();
  const navigate = useNavigate();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (role: "strategy" | "general") => {
    setIsAuthenticating(true);
    
    // Reduced loading simulation to 800ms
    setTimeout(async () => {
      await login(role);
      navigate('/');
    }, 800);
  };

  // Inline loading is handled directly on the button now

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fc] flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="text-[#0D212C] mb-4">
            <Loader className="w-10 h-10 animate-spin" />
          </div>
          <h2 className="text-[1.125rem] font-semibold text-[#0D212C] font-['Poppins'] mb-1.5">Setting up your workspace...</h2>
          <p className="text-[0.8125rem] text-gray-500">Preparing the M42 Intelligence environment.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-[1.25rem] font-semibold font-['Poppins'] text-[var(--text-primary)] mb-1.5">
        Welcome
      </h2>
      <p className="text-[var(--text-secondary)] text-[0.875rem] mb-8 leading-relaxed max-w-sm mx-auto">
        Sign in with your organisational account
      </p>
      
      <button 
        onClick={() => handleLogin('strategy')}
        className="w-full flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-left shadow-sm hover:shadow-md hover:border-[#36c0c9]/30 transition-all group"
      >
        <div className="mt-0.5 bg-gray-50 p-2 rounded-lg group-hover:bg-[#36c0c9]/10 transition-colors">
           <Fingerprint className="w-5 h-5 text-gray-500 group-hover:text-[#36c0c9] transition-colors" />
        </div>
        <div>
          <div className="font-semibold text-[0.9375rem] text-[var(--text-primary)] group-hover:text-[#36c0c9] transition-colors">
            Sign in with SSO
          </div>
          <div className="text-[0.8125rem] text-gray-500 mt-0.5">Authenticate via your enterprise network</div>
        </div>
      </button>

    </AuthLayout>
  );
}