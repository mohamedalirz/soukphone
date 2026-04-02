// pages/Home.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getListings, getAllSponsors } from "../services/api";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import heroImage from "../assets/13pro.png";
import TrustedUsersCarousel from "../components/TrustedUsersCarousel";

// Cache for listings data
let cachedListings = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Cache for sponsors
let cachedSponsors = null;
let sponsorsCacheTime = null;

const Home = () => {
  const [listings, setListings] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0
  });
  const [visibleCount, setVisibleCount] = useState(4);
  
  const fetchedRef = useRef(false);
  const sponsorsFetchedRef = useRef(false);

  // Fetch listings with caching
  const fetchListings = useCallback(async () => {
    if (cachedListings && cacheTime && (Date.now() - cacheTime) < CACHE_DURATION) {
      setListings(cachedListings);
      setLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    try {
      setLoading(true);
      setError("");
      const data = await getListings();
      cachedListings = data || [];
      cacheTime = Date.now();
      setListings(cachedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      if (cachedListings) {
        setListings(cachedListings);
        setError("Unable to refresh listings. Showing cached data.");
      } else {
        setError(err.response?.data?.msg || "Failed to load listings");
      }
    } finally {
      setLoading(false);
      fetchedRef.current = false;
    }
  }, []);

  // pages/Home.jsx - Update the fetchSponsors function
const fetchSponsors = useCallback(async () => {
  if (cachedSponsors && sponsorsCacheTime && (Date.now() - sponsorsCacheTime) < CACHE_DURATION) {
    setSponsors(cachedSponsors);
    return;
  }

  if (sponsorsFetchedRef.current) return;
  sponsorsFetchedRef.current = true;
  
  try {
    const response = await getAllSponsors();
    console.log("Sponsors API response:", response);
    
    // Handle different response structures
    let sponsorsData = [];
    
    // Check the response structure
    if (response.sponsors && Array.isArray(response.sponsors)) {
      sponsorsData = response.sponsors;
    } else if (response.data && response.data.sponsors) {
      sponsorsData = response.data.sponsors;
    } else if (Array.isArray(response)) {
      sponsorsData = response;
    } else if (response.success && response.sponsors) {
      sponsorsData = response.sponsors;
    }
    
    // Filter only active sponsors (though the API already filters)
    const activeSponsors = sponsorsData.filter(sponsor => sponsor.isActive !== false);
    
    cachedSponsors = activeSponsors;
    sponsorsCacheTime = Date.now();
    setSponsors(activeSponsors);
    
    console.log(`Loaded ${activeSponsors.length} sponsors`);
  } catch (err) {
    console.error("Error fetching sponsors:", err);
    // Set empty array instead of default sponsors
    setSponsors([]);
  } finally {
    sponsorsFetchedRef.current = false;
  }
}, []);

  useEffect(() => {
    fetchListings();
    fetchSponsors();
  }, [fetchListings, fetchSponsors]);

  // Countdown timer for hot deals
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter listings based on search
  const filteredListings = listings.filter(listing =>
    listing?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get visible listings (based on visibleCount)
  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  // Load more function
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, filteredListings.length));
  };

  // Get hot deals (featured listings)
  const hotDealPhones = listings
    .filter(listing => listing.featured === true)
    .slice(0, 4);

  // Loading skeleton
  if (loading && !listings.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef5ff] to-[#dfe9f7]">
        {/* Hero Skeleton */}
        <div className="px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded-lg w-2/3 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded-lg w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="px-4 sm:px-8 lg:px-16">
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-300 rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded-lg w-64"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-300 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !listings.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef5ff] to-[#dfe9f7] flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur p-8 rounded-2xl shadow-lg max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => {
              cachedListings = null;
              cacheTime = null;
              fetchListings();
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef5ff] to-[#dfe9f7]">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
          <div className="max-w-xl text-center lg:text-left mb-10 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 leading-tight">
              Buy & Sell Your <br /> Favorite Phones
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              Discover the best deals on new and used smartphones.
            </p>
            <Link to="/add">
              <button className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition transform duration-300">
                Shop Now
              </button>
            </Link>
          </div>
          
          {/* Right Image */}
          <div className="hidden lg:block">
            <img
              src={heroImage}
              alt="Smartphone"
              className="w-[450px] animate-float"
            />
          </div>
        </div>
      </div>

      <TrustedUsersCarousel />
      {/* HOT DEALS SECTION - Featured Products */}
      {hotDealPhones.length > 0 && (
        <div className="px-4 sm:px-8 lg:px-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">
                🔥 Hot Deals
              </h2>
              <p className="text-gray-500 mt-1">Limited time offers on popular smartphones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotDealPhones.map((phone) => (
              <div key={phone._id} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                
                {/* Hot Deal Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold animate-pulse">
                    🔥 HOT
                  </div>
                </div>
                
                {/* Featured Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    ⭐ Featured
                  </div>
                </div>
                
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                  {phone.images && phone.images[0] ? (
                    <img
                      src={phone.images[0]}
                      alt={phone.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{phone.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-600 font-semibold">{phone.condition}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-red-600">{phone.price} DT</span>
                  </div>
                  
                  {/* Action Button */}
                  <Link to={`/phone/${phone._id}`}>
                    <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition transform hover:scale-105 duration-300">
                      Grab Deal →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="px-4 sm:px-8 lg:px-16 -mt-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for phones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none shadow-lg text-lg"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ALL PRODUCTS SECTION */}
      <div className="px-4 sm:px-8 lg:px-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">
              All Products
            </h2>
            <p className="text-gray-500 mt-1">
              Showing {visibleListings.length} of {filteredListings.length} phones
            </p>
          </div>
          {searchTerm && filteredListings.length > 0 && (
            <button 
              onClick={() => setSearchTerm("")}
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Clear Search
            </button>
          )}
        </div>

        {visibleListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleListings.map((item) => (
                <Card key={item._id} phone={item} />
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-105 duration-300 shadow-lg flex items-center gap-2"
                >
                  <span>Load More</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching "{searchTerm}"</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* TRUSTED BY - SPONSORS SECTION */}
      {sponsors.length > 0 && (
        <div className="px-4 sm:px-8 lg:px-16 mt-20 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">
              Trusted By
            </h2>
            <p className="text-gray-500 mt-2">Our trusted partners and sponsors</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor._id}
                className="bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center group cursor-pointer"
              >
                <div className="mb-3 overflow-hidden rounded-lg h-16 flex items-center justify-center">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150x80/4F46E5/ffffff?text=" + sponsor.name.substring(0, 3);
                    }}
                  />
                </div>
                <h3 className="font-semibold text-sm text-gray-800 truncate">{sponsor.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sponsor.description}</p>
                {sponsor.website && (
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Join our trusted partners program
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;