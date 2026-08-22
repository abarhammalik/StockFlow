import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src={logoImg}
            alt="StockFlow"
            className="w-14 h-14 rounded-2xl object-contain shadow-lg shadow-indigo-100 animate-pulse"
          />
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Authenticating workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
