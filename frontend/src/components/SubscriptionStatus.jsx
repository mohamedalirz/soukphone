// components/SubscriptionStatus.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const refreshStatus = () => {
  fetchSubscriptionStatus();
};

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Subscription response:", response.data);
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError("Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Handle different date formats
      let date;
      if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (dateString instanceof Date) {
        date = dateString;
      } else if (dateString && typeof dateString === 'object' && dateString.$date) {
        date = new Date(dateString.$date);
      } else {
        return "N/A";
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return "N/A";
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      console.error("Date parsing error:", e);
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!subscription || subscription.plan === "free" || subscription.status === "expired" || subscription.status === "inactive") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg">
        <div className="text-center">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Free Plan</h3>
          <p className="text-gray-600 mb-4">Upgrade to Premium or Enterprise for more features</p>
          <Link to="/plans">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:scale-105 transition">
              View Plans
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getDaysColor = (days) => {
    if (days <= 3) return "text-red-600";
    if (days <= 7) return "text-orange-500";
    return "text-green-600";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold capitalize text-gray-800">
            {subscription.plan === "premium" ? "🌟 Premium Plan" : "👑 Enterprise Plan"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className={`font-semibold ${subscription.status === "active" ? "text-green-600" : "text-red-600"}`}>
              {subscription.status === "active" ? "Active" : "Expired"}
            </span>
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {subscription.duration === "monthly" ? "Monthly" : "Yearly"}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Started: {formatDate(subscription.startDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Expires: {formatDate(subscription.endDate)}</span>
        </div>

        {subscription.daysRemaining > 0 && subscription.status === "active" && (
          <div className={`flex items-center gap-2 text-sm font-semibold ${getDaysColor(subscription.daysRemaining)}`}>
            <AlertCircle className="w-4 h-4" />
            <span>{subscription.daysRemaining} days remaining</span>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          ⚠️ When your subscription expires, you will be downgraded to the Free plan. 
          To continue enjoying premium features, please submit a new plan upgrade request before expiration.
        </p>
        <button 
  onClick={refreshStatus}
  className="text-blue-500 text-sm hover:underline mt-2"
>
  Refresh Status
</button>
        <Link to="/plans">
          <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold">
            View Plans →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatus;