// pages/SellerProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Shield, 
  CheckCircle, 
  Package, 
  ThumbsUp,
  MessageCircle,
  Store,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import Card from "../components/Card";

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      
      // Fetch seller info
      const sellerRes = await axios.get(`https://soukphone-api.onrender.com/api/auth/user/${id}`);
      setSeller(sellerRes.data);
      
      // Fetch seller's listings
      const listingsRes = await axios.get(`https://soukphone-api.onrender.com/api/listings/user/${id}`);
      setListings(listingsRes.data);
      
    } catch (err) {
      console.error("Error fetching seller data:", err);
      setError("Failed to load seller profile");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeInfo = (badge) => {
    switch(badge) {
      case "verified":
        return { 
          icon: <CheckCircle className="w-5 h-5" />, 
          color: "bg-blue-500", 
          text: "Verified Seller",
          description: "This seller has been verified by our team"
        };
      case "trusted":
        return { 
          icon: <Shield className="w-5 h-5" />, 
          color: "bg-green-500", 
          text: "Trusted Seller",
          description: "This seller has a proven track record"
        };
      default:
        return { 
          icon: <User className="w-5 h-5" />, 
          color: "bg-gray-500", 
          text: "Member",
          description: "Regular member"
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-8 text-center">
        <div className="text-red-600 text-xl">{error || "Seller not found"}</div>
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const badgeInfo = getBadgeInfo(seller.badge);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      {/* Seller Header / Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold backdrop-blur">
            {seller.username?.[0]?.toUpperCase()}
          </div>
          
          {/* Seller Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-3xl font-bold">{seller.username}</h1>
              <div className={`${badgeInfo.color} px-2 py-1 rounded-lg text-xs flex items-center gap-1`}>
                {badgeInfo.icon}
                {badgeInfo.text}
              </div>
            </div>
            <p className="text-white/80 mt-2">{badgeInfo.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="text-sm">{listings.length} listings</span>
              </div>
              {seller.totalSales > 0 && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{seller.totalSales} sales</span>
                </div>
              )}
              {seller.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">{seller.rating} ★ rating</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member since {new Date(seller.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
          
          {/* Contact Button */}
          <Link to={`/chat/${seller._id}`}>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition transform duration-300 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Seller
            </button>
          </Link>
        </div>
      </div>

      {/* Seller Listings */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-6 h-6" />
            Seller's Listings
          </h2>
          <span className="text-gray-500">{listings.length} items</span>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No listings yet</p>
            <p className="text-sm text-gray-400">This seller hasn't posted any items</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Card key={listing._id} phone={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
