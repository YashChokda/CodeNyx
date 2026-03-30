import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/domain" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
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
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
