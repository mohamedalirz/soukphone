import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getListingById } from "../services/api"; // You'll need to add this function
import Slider from "react-slick";
import { FaHeart, FaUser, FaCalendar, FaTag } from "react-icons/fa";

const PhoneDetails = () => {
  const { id } = useParams();
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        setLoading(true);
        const data = await getListingById(id);
        console.log("Fetched phone details:", data);
        setPhone(data);
        setError("");
      } catch (err) {
        console.error("Error fetching phone details:", err);
        setError(err.response?.data?.msg || "Failed to load phone details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhone();
  }, [id]);

  const handleContact = () => {
    if (phone && phone.seller && phone.seller._id) {
      navigate(`/chat/${phone.seller._id}`);
    } else {
      console.error("No seller ID found");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading phone details...</div>
      </div>
    );
  }

  if (error || !phone) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Phone not found"}
        </div>
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#eef5ff] to-[#dfe9f7] px-16 py-16">

    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-10 flex gap-10">

      {/* IMAGES */}
      <div className="flex-1">
        <img
          src={phone.images?.[0]}
          className="w-full h-[400px] object-cover rounded-2xl"
        />
      </div>

      {/* INFO */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-blue-900">
          {phone.title}
        </h1>

        <p className="text-gray-500 mt-2">{phone.condition}</p>

        <p className="text-3xl font-bold text-blue-600 mt-4">
          {phone.price} TND
        </p>

        <p className="mt-6 text-gray-600">
          {phone.description}
        </p>

        <button
          onClick={handleContact}
          className="mt-8 bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition"
        >
          Contact Seller
        </button>
      </div>
    </div>

  </div>
);
};

export default PhoneDetails;