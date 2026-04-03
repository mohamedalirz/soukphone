// pages/AddListing.jsx
import React, { useState, useRef, useEffect } from "react";
import { addListing, uploadImage, getUserListings } from "../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddListing = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [currentListingsCount, setCurrentListingsCount] = useState(0);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [planLimit, setPlanLimit] = useState({ max: 2, name: "Free" });
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Plan limits
  const planLimits = {
    free: { max: 2, name: "Free" },
    premium: { max: 10, name: "Premium" },
    enterprise: { max: Infinity, name: "Enterprise" }
  };

  // Get current user and their listings count
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        // Get user profile
        const userResponse = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = userResponse.data;
        setUserPlan(user.plan || "free");
        
        // Get user's listings count
        const listings = await getUserListings();
        const activeListingsCount = listings.length;
        setCurrentListingsCount(activeListingsCount);
        
        // Set plan limit info
        const limit = planLimits[user.plan || "free"];
        setPlanLimit(limit);
        
        setLoadingLimit(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          navigate("/auth");
        }
      }
    };
    
    fetchUserData();
  }, [navigate, planLimits]);

  // Handle file selection
  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    // Limit to 5 images
    if (images.length + fileArray.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...fileArray]);
    const urls = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => handleFiles(e.target.files);

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a listing!");
      navigate("/auth");
      return;
    }
    
    // Check listing limit based on plan
    if (currentListingsCount >= planLimit.max && planLimit.max !== Infinity) {
      setError(`You have reached your ${planLimit.name} plan limit of ${planLimit.max} active listings. Please upgrade your plan to add more listings.`);
      return;
    }
    
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    
    setUploading(true);
    setError("");
    
    try {
      // Upload images first
      const uploadedImages = [];
      for (let i = 0; i < images.length; i++) {
        console.log(`Uploading image ${i + 1}/${images.length}...`);
        const data = await uploadImage(images[i]);
        uploadedImages.push(data.url);
        console.log(`Image ${i + 1} uploaded:`, data.url);
      }

      const listingData = {
        title,
        description,
        price: parseFloat(price),
        condition,
        images: uploadedImages
      };
      
      console.log("Sending listing data:", listingData);
      const response = await addListing(listingData);
      
      console.log("Listing created:", response);
      alert("Listing added successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error creating listing:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/auth");
      } else {
        const errorMsg = err.response?.data?.msg || err.message || "Failed to add listing";
        setError(errorMsg);
        alert(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  // Calculate remaining listings
  const remainingListings = planLimit.max === Infinity ? "Unlimited" : planLimit.max - currentListingsCount;
  const isLimitReached = currentListingsCount >= planLimit.max && planLimit.max !== Infinity;

  if (loadingLimit) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        Add New Listing
      </h1>

      {/* Plan Info Card */}
      <div className={`mb-6 p-4 rounded-xl ${
        userPlan === "enterprise" ? "bg-purple-100 border border-purple-300" :
        userPlan === "premium" ? "bg-blue-100 border border-blue-300" :
        "bg-gray-100 border border-gray-300"
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold mb-1">Current Plan: {planLimit.name}</p>
            <p className="text-sm text-gray-600">
              {planLimit.max === Infinity ? (
                "✨ Unlimited listings"
              ) : (
                `📊 ${currentListingsCount} / ${planLimit.max} listings used`
              )}
            </p>
            {remainingListings !== "Unlimited" && remainingListings > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ✅ You can add {remainingListings} more {remainingListings === 1 ? 'listing' : 'listings'}
              </p>
            )}
            {remainingListings !== "Unlimited" && remainingListings === 0 && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ You have reached your listing limit. Please upgrade your plan to add more.
              </p>
            )}
          </div>
          {userPlan !== "enterprise" && (
            <button
              onClick={() => navigate("/plans")}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:scale-105 transition"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Limit Reached Warning */}
      {isLimitReached && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          <p className="font-semibold">⚠️ Listing Limit Reached</p>
          <p className="text-sm mt-1">
            You have reached your {planLimit.name} plan limit of {planLimit.max} active listings.
            Please upgrade your plan to add more listings.
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition"
          >
            View Upgrade Options
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          required
          disabled={isLimitReached}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none h-32"
          required
          disabled={isLimitReached}
        />

        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Price (DT)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            required
            disabled={isLimitReached}
          />
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            required
            disabled={isLimitReached}
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isLimitReached && inputRef.current.click()}
          className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition ${
            isLimitReached 
              ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50" 
              : "border-gray-400 cursor-pointer hover:border-blue-500"
          }`}
        >
          <p className="text-gray-500 mb-2">
            Drag & drop images here, or click to select
          </p>
          <p className="text-xs text-gray-400">Maximum 5 images</p>
          <input
            type="file"
            multiple
            ref={inputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isLimitReached}
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-full h-32 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || isLimitReached}
          className={`w-full py-4 rounded-xl transition text-lg font-semibold ${
            isLimitReached
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLimitReached 
            ? "Listing Limit Reached" 
            : uploading 
              ? "Adding Listing..." 
              : "Add Listing"}
        </button>
      </form>
    </div>
  );
};

export default AddListing;
