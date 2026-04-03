// components/TrustedUsersCarousel.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shield, Store } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import UserBadge from "./UserBadge";

const TrustedUsersCarousel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrustedUsers();
  }, []);

  const fetchTrustedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/badge/verified");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error("Error fetching trusted users:", err);
      setError("Failed to load trusted users");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 4 >= users.length ? 0 : prevIndex + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 4 < 0 ? Math.max(0, users.length - 4) : prevIndex - 4
    );
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-8 lg:px-16 mb-16">
        <div className="text-center py-8">
          <div className="animate-pulse flex justify-center">
            <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || users.length === 0) {
    return null;
  }

  const visibleUsers = users.slice(currentIndex, currentIndex + 4);

  return (
    <div className="px-4 sm:px-8 lg:px-16 mb-16">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Trusted Sellers
          </h2>
          <p className="text-gray-500 mt-1">Verified and trusted phone sellers on our platform</p>
        </div>
        
        {users.length > 4 && (
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="p-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              </div>
              
              {/* User Info */}
              <h3 className="font-bold text-lg mt-3">{user.username}</h3>
              
              {/* Badge */}
              <div className="mt-2">
                <UserBadge badge={user.badge} size="md" />
              </div>
              
              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-center gap-4">
                  {user.totalSales > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{user.totalSales}</p>
                      <p className="text-xs text-gray-500">Sales</p>
                    </div>
                  )}
                  {user.rating > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-500">{user.rating}★</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(user.createdAt).getFullYear()}
                    </p>
                    <p className="text-xs text-gray-500">Member since</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Button */}
              <Link to={`/seller/${user._id}`}>
                <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl font-semibold hover:scale-105 transition transform duration-300 flex items-center justify-center gap-2">
                    <Store className="w-4 h-4" />
                    View Store
                </button>
                </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedUsersCarousel;
