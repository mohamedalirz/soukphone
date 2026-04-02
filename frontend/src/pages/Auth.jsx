import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login
        const userData = await loginUser({ email, password });
        
        if (userData && userData.token) {
          localStorage.setItem("token", userData.token);
          localStorage.setItem("user", JSON.stringify({
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            plan: userData.plan,
            isVerified: userData.isVerified
          }));
          navigate("/");
        } else {
          setError("Login failed: No token received");
        }
      } else {
        // Register
        const userData = await registerUser({ username, email, password });
        
        if (userData && userData.token) {
          // Auto-login after successful registration
          localStorage.setItem("token", userData.token);
          localStorage.setItem("user", JSON.stringify({
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            plan: userData.plan,
            isVerified: userData.isVerified
          }));
          navigate("/");
        } else {
          // Registration succeeded but no token (shouldn't happen with new code)
          setError("Registration successful! Please login.");
          setIsLogin(true);
          setEmail("");
          setPassword("");
          setUsername("");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err.response?.data?.msg || 
                          err.response?.data?.message || 
                          err.message || 
                          "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded shadow bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        {isLogin ? "Login" : "Signup"}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              minLength="3"
              maxLength="20"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            minLength="6"
          />
          {!isLogin && (
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : (isLogin ? "Login" : "Signup")}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
        >
          {isLogin ? "Signup" : "Login"}
        </span>
      </p>
    </div>
  );
};

export default Auth;