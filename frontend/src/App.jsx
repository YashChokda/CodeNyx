import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './context/AppContext';
import Auth from './pages/Auth';
import DomainSelect from './pages/DomainSelect';
import IdeaSubmit from './pages/IdeaSubmit';
import MainEngines from './pages/MainEngines';
import Refinement from './pages/Refinement';
import CostAndGovGuide from './pages/CostAndGovGuide';
import Dashboard from './pages/Dashboard';


function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" replace />;
}

function AuthRoute() {
  const { currentUser, logout } = useAuth();
  const [searchParams] = useSearchParams();

  // If ?logout is in the URL, sign out automatically
  useEffect(() => {
    if (searchParams.get('logout') !== null && currentUser) {
      logout();
    }
  }, [searchParams, currentUser, logout]);

  // Always show the Auth page — it handles the logged-in state internally
  return <Auth />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route path="/domain" element={<PrivateRoute><DomainSelect /></PrivateRoute>} />
      <Route path="/idea" element={<PrivateRoute><IdeaSubmit /></PrivateRoute>} />
      <Route path="/engines" element={<PrivateRoute><MainEngines /></PrivateRoute>} />
      <Route path="/refine" element={<PrivateRoute><Refinement /></PrivateRoute>} />
      <Route path="/tools" element={<PrivateRoute><CostAndGovGuide /></PrivateRoute>} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}
