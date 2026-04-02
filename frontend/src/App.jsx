import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AddListing from "./pages/AddListing";
import PhoneDetails from "./pages/PhoneDetails";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ChatList from "./pages/ChatList";
import SellerProfile from "./pages/SellerProfile";
import Plans from "./pages/Plans";


function App() {
  const [dark, setDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      
      // Clean up corrupted token
      if (token === "[object Object]" || token === "undefined") {
        console.log("Cleaning up corrupted token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      // Validate token format (basic JWT check)
      if (token && typeof token === 'string' && token.split('.').length === 3) {
        try {
          // Check if token is expired
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isValid = payload.exp * 1000 > Date.now();
          setIsAuthenticated(isValid);
          
          if (!isValid) {
            // Token expired, clear it
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (e) {
          console.error("Invalid token format");
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage changes (in case token is updated in another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Public Route component (redirects to home if already authenticated)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      );
    }
    
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black transition">
        <Router>
          <Navbar dark={dark} setDark={setDark} isAuthenticated={isAuthenticated} />
          <div className="max-w-7xl mx-auto p-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Auth />
                  </PublicRoute>
                } 
              />
              <Route path="/phone/:id" element={<PhoneDetails />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route 
                path="/add" 
                element={
                  <ProtectedRoute>
                    <AddListing />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatList />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/chat/:id" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/seller/:id" 
                element={
                    <SellerProfile />
                } 
              />

              <Route 
                path="/plans" 
                element={
                  <ProtectedRoute>
                    <Plans />
                  </ProtectedRoute>
                } 
              />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;