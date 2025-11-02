import React from 'react';
import { useAuth } from './contexts/AuthContext';
import App from './App';
import AuthView from './components/AuthView';

const AppWithAuth: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return session ? <App /> : <AuthView />;
};

export default AppWithAuth;
