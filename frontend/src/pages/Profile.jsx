// Profile.jsx - Update the handleDeleteListing function
import React, { useState, useEffect } from "react";
import { getProfile, getUserListings, updateProfile, deleteListing } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaSave, FaTimes, FaTrash, FaUser, FaEnvelope, FaCalendar } from "react-icons/fa";
import SubscriptionStatus from "../components/SubscriptionStatus";



const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which listing is being deleted
  const navigate = useNavigate();
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Clean up any corrupted token first
    const cleanupToken = () => {
      const token = localStorage.getItem("token");
      if (token === "[object Object]" || token === "undefined" || (token && token.includes('[object'))) {
        console.log("Cleaning up corrupted token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }
      return true;
    };
    
    const isValid = cleanupToken();
    if (!isValid) {
      navigate("/auth");
      return;
    }
    
    // Get token directly from localStorage
    const token = localStorage.getItem("token");
    console.log("=== Profile Component Debug ===");
    console.log("Raw token from localStorage:", token);
    console.log("Token type:", typeof token);
    console.log("Token length:", token?.length);
    
    if (!token) {
      console.log("No token found, redirecting to auth");
      navigate("/auth");
      return;
    }
    
    fetchProfileAndListings();
  }, [navigate]);

  const fetchProfileAndListings = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching profile...");
      const profileData = await getProfile();
      console.log("Profile data received:", profileData);
      
      console.log("Fetching user listings...");
      const listingsData = await getUserListings();
      console.log("Listings data received:", listingsData);
      
      setProfile(profileData);
      setListings(listingsData);
      setEditForm({
        username: profileData.username,
        email: profileData.email,
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Error details:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      if (err.response?.status === 401) {
        console.log("Unauthorized - clearing token and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
      } else {
        setError(err.response?.data?.msg || "Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (editForm.password !== editForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const updateData = {
        username: editForm.username,
        email: editForm.email,
      };
      
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const updatedProfile = await updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setError("");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.msg || "Failed to update profile");
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      setDeletingId(id);
      try {
        await deleteListing(id);
        // Remove the deleted listing from state
        setListings(listings.filter(listing => listing._id !== id));
        alert("Listing deleted successfully!");
      } catch (err) {
        console.error("Error deleting listing:", err);
        alert(err.response?.data?.msg || "Failed to delete listing");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">
          {error || "Failed to load profile"}
          <button 
            onClick={fetchProfileAndListings}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
              <FaEdit /> Edit
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-600"
            >
              <FaTimes /> Cancel
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isEditing ? (
          // Display Mode
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FaUser /> Username
              </label>
              <p className="text-lg">{profile.username}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FaEnvelope /> Email
              </label>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FaCalendar /> Member Since
              </label>
              <p className="text-lg">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {profile.userID && (
              <div>
                <label className="font-semibold text-gray-600 dark:text-gray-400">User ID</label>
                <p className="text-sm text-gray-500">{profile.userID}</p>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
              <SubscriptionStatus />
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">New Password (optional)</label>
              <input
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleEditChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Leave blank to keep current password"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="block font-semibold mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={editForm.confirmPassword}
                onChange={handleEditChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <FaSave /> Save Changes
            </button>
          </form>
        )}
      </div>

      {/* My Listings Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">My Listings ({listings.length})</h2>
        
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't posted any listings yet</p>
            <Link
              to="/add"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="border rounded-lg p-4 hover:shadow-md transition relative"
              >
                <div className="flex gap-4">
                  {listing.images && listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <Link to={`/phone/${listing._id}`}>
                      <h3 className="font-semibold hover:text-blue-500">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-green-600 font-bold">${listing.price}</p>
                    <p className="text-sm text-gray-500">{listing.condition}</p>
                    <p className="text-xs text-gray-400">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteListing(listing._id)}
                    disabled={deletingId === listing._id}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === listing._id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;