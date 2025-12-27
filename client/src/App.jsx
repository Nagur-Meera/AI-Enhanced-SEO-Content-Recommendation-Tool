import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';

import Layout from './components/common/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ContentList from './components/Content/ContentList';
import ContentEditor from './components/Editor/ContentEditor';
import SEOAnalysis from './components/SEO/SEOAnalysis';
import RevisionHistory from './components/History/RevisionHistory';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ContentProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="content" element={<ContentList />} />
              <Route path="content/new" element={<ContentEditor />} />
              <Route path="content/:id" element={<ContentEditor />} />
              <Route path="content/:id/analysis" element={<SEOAnalysis />} />
              <Route path="content/:id/history" element={<RevisionHistory />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ContentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
