// pages/Plans.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Star, Zap, Shield, CreditCard, Calendar } from "lucide-react";
import axios from "axios";

const Plans = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [duration, setDuration] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const navigate = useNavigate();

  const plans = {
    free: {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      icon: Shield,
      color: "from-gray-500 to-gray-600",
      features: [
        "Up to 2 active listings",
        "Basic support",
        "Standard listing visibility",
        "Basic analytics"
      ],
      limits: {
        listings: 2,
        featuredListings: 0,
        support: "basic"
      }
    },
    premium: {
      name: "Premium",
      price: { monthly: 20, yearly: 150 },
      icon: Star,
      color: "from-blue-500 to-purple-500",
      features: [
        "Up to 10 active listings",
        "Priority support",
        "Advanced analytics",
        "Verified seller badge",
        "Promoted listings"
      ],
      limits: {
        listings: 10,
        support: "priority"
      }
    },
    enterprise: {
      name: "Enterprise",
      price: { monthly: 60, yearly: 500 },
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      features: [
        "Unlimited listings",
        "24/7 dedicated support",
        "Unlimited featured listings",
        "Verified & trusted badges",
        "API access",
        "Custom store page",
        "Bulk listing upload"
      ],
      limits: {
        listings: -1, // unlimited
        featuredListings: -1,
        support: "dedicated"
      }
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user._id) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    checkPendingRequest(user._id);
  }, []);

  const checkPendingRequest = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/plans/requests/pending/${userId}`);
      if (response.data.hasPending) {
        setHasPendingRequest(true);
      }
    } catch (error) {
      console.error("Error checking pending request:", error);
    }
  };

  const handleSelectPlan = (planName) => {
    if (currentUser?.plan === planName) {
      setError(`You are already on the ${planName} plan`);
      return;
    }
    setSelectedPlan(planName);
    setError("");
  };

  const handleSubmitRequest = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/plans/request",
        {
          requestedPlan: selectedPlan,
          duration: duration,
          currentPlan: currentUser.plan
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`Plan upgrade request sent! Admin will review your request shortly.`);
        setSelectedPlan(null);
        setHasPendingRequest(true);
        setTimeout(() => {
          navigate("/profile");
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.msg || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getYearlyDiscount = (monthlyPrice, yearlyPrice) => {
    const yearlyDiscount = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100;
    return Math.round(yearlyDiscount);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 text-lg">Upgrade your selling experience with our premium plans</p>
        {currentUser && (
          <p className="text-blue-600 mt-2">Current plan: <strong>{currentUser.plan?.toUpperCase()}</strong></p>
        )}
      </div>

      {/* Duration Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 rounded-full p-1 inline-flex">
          <button
            onClick={() => setDuration("monthly")}
            className={`px-6 py-2 rounded-full transition ${
              duration === "monthly"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setDuration("yearly")}
            className={`px-6 py-2 rounded-full transition ${
              duration === "yearly"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Yearly <span className="text-xs ml-1 text-green-500">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          {success}
        </div>
      )}
      {hasPendingRequest && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-center">
          You have a pending plan change request. Please wait for admin approval.
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(plans).map(([key, plan]) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentUser?.plan === key;
          const isSelected = selectedPlan === key;
          const price = duration === "monthly" ? plan.price.monthly : plan.price.yearly;
          const yearlyDiscount = duration === "yearly" && plan.price.monthly > 0 
            ? getYearlyDiscount(plan.price.monthly, plan.price.yearly) 
            : 0;

          return (
            <div
              key={key}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 ${
                isSelected ? "ring-4 ring-blue-500 scale-105" : ""
              } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
            >
              {isCurrentPlan && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Current Plan
                </div>
              )}
              
              {/* Header */}
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                <Icon className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold">{price} DT</span>
                  <span className="text-sm">/{duration === "monthly" ? "month" : "year"}</span>
                </div>
                {yearlyDiscount > 0 && (
                  <p className="text-sm mt-1 opacity-90">Save {yearlyDiscount}% annually</p>
                )}
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {!isCurrentPlan && !hasPendingRequest && (
                  <button
                    onClick={() => handleSelectPlan(key)}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold transition transform hover:scale-105 ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {selectedPlan && !hasPendingRequest && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleSubmitRequest}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition transform duration-300 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Submit Upgrade Request
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default Plans;