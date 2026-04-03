// pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Smartphone, 
  Trophy, 
  LogOut, 
  Menu, 
  X,
  Trash2, 
  Search,
  Shield,
  LayoutDashboard,
  Star,
  Plus,
  Edit2,
  Crown,
  CheckCircle,
  XCircle
} from "lucide-react";
import axios from "axios";

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "https://soukphone-api.onrender.com/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, totalSponsors: 0 });
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [planRequests, setPlanRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    name: "",
    logo: "",
    description: "",
    website: "",
    category: "other",
    contactEmail: "",
    contactPhone: "",
    featured: false
  });

  const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");

  // Fetch plan requests
  const fetchPlanRequests = async () => {
    setLoadingRequests(true);
    try {
      const token = getToken();
      console.log("Fetching plan requests...");
      
      const response = await axios.get(`${API_URL}/admin/plan-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Plan requests response:", response.data);
      
      if (response.data.success) {
        setPlanRequests(response.data.requests || []);
      } else {
        setPlanRequests([]);
      }
    } catch (error) {
      console.error("Error fetching plan requests:", error);
      console.error("Error response:", error.response?.data);
      setPlanRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }
    fetchData();
    fetchPlanRequests();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      console.log("Admin token:", token);
      
      if (!token) {
        console.error("No admin token found");
        navigate("/admin/login");
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log("Fetching stats...");
      const statsRes = await axios.get(`${API_URL}/admin/stats`, { headers });
      console.log("Stats response:", statsRes.data);
      setStats(statsRes.data);
      
      console.log("Fetching users...");
      const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
      console.log("Users response:", usersRes.data);
      setUsers(usersRes.data.users || []);
      
      console.log("Fetching listings...");
      const listingsRes = await axios.get(`${API_URL}/admin/listings`, { headers });
      console.log("Listings response:", listingsRes.data);
      setListings(listingsRes.data.listings || []);
      
      console.log("Fetching sponsors...");
      const sponsorsRes = await axios.get(`${API_URL}/admin/sponsors`, { headers });
      console.log("Sponsors response:", sponsorsRes.data);
      setSponsors(sponsorsRes.data.sponsors || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 401) {
        console.log("Unauthorized - clearing token and redirecting");
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        setError("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    if (window.confirm("Approve this plan upgrade request?")) {
      try {
        const token = getToken();
        const response = await axios.post(
          `${API_URL}/admin/plan-requests/${requestId}/approve`,
          { adminNote },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          alert("Request approved successfully!");
          fetchPlanRequests();
          fetchData();
          setSelectedRequest(null);
          setAdminNote("");
        }
      } catch (error) {
        console.error("Error approving request:", error);
        alert(error.response?.data?.message || "Failed to approve request");
      }
    }
  };

  const handleDeclineRequest = async (requestId) => {
    if (window.confirm("Decline this plan upgrade request?")) {
      try {
        const token = getToken();
        const response = await axios.post(
          `${API_URL}/admin/plan-requests/${requestId}/decline`,
          { adminNote },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          alert("Request declined");
          fetchPlanRequests();
          setSelectedRequest(null);
          setAdminNote("");
        }
      } catch (error) {
        console.error("Error declining request:", error);
        alert(error.response?.data?.message || "Failed to decline request");
      }
    }
  };

  const handleUpdateBadge = async (userId, badge) => {
    try {
      const token = getToken();
      console.log("Updating badge with token:", token ? "Token exists" : "No token");
      
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/badge`,
        { badge },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("Badge update response:", response.data);
      await fetchData();
      alert("Badge updated successfully!");
    } catch (error) {
      console.error("Error updating badge:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to update badge");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        await fetchData();
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing? This will also delete all associated images from Cloudinary. This action cannot be undone.")) {
      setDeletingId(listingId);
      try {
        const response = await axios.delete(`${API_URL}/admin/listings/${listingId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        if (response.data.success) {
          await fetchData();
          alert(`Listing deleted successfully! ${response.data.imagesDeleted} image(s) removed from Cloudinary.`);
        } else {
          alert("Failed to delete listing");
        }
      } catch (error) {
        console.error("Error deleting listing:", error);
        alert(error.response?.data?.msg || "Failed to delete listing");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleFeatured = async (listingId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/listings/${listingId}/featured`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (response.data.success) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Failed to update featured status");
    }
  };

  const handleDeleteSponsor = async (sponsorId) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      try {
        await axios.delete(`${API_URL}/admin/sponsors/${sponsorId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        await fetchData();
      } catch (error) {
        alert("Failed to delete sponsor");
      }
    }
  };

  const handleCreateSponsor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/sponsors`, sponsorForm, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setShowSponsorModal(false);
      setSponsorForm({
        name: "",
        logo: "",
        description: "",
        website: "",
        category: "other",
        contactEmail: "",
        contactPhone: "",
        featured: false
      });
      await fetchData();
      alert("Sponsor created successfully!");
    } catch (error) {
      console.error("Error creating sponsor:", error);
      alert("Failed to create sponsor");
    }
  };

  const handleUpdateSponsor = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/admin/sponsors/${editingSponsor._id}`, sponsorForm, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setShowSponsorModal(false);
      setEditingSponsor(null);
      setSponsorForm({
        name: "",
        logo: "",
        description: "",
        website: "",
        category: "other",
        contactEmail: "",
        contactPhone: "",
        featured: false
      });
      await fetchData();
      alert("Sponsor updated successfully!");
    } catch (error) {
      console.error("Error updating sponsor:", error);
      alert("Failed to update sponsor");
    }
  };

  const openSponsorModal = (sponsor = null) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setSponsorForm({
        name: sponsor.name,
        logo: sponsor.logo,
        description: sponsor.description,
        website: sponsor.website || "",
        category: sponsor.category || "other",
        contactEmail: sponsor.contactEmail || "",
        contactPhone: sponsor.contactPhone || "",
        featured: sponsor.featured || false
      });
    } else {
      setEditingSponsor(null);
      setSponsorForm({
        name: "",
        logo: "",
        description: "",
        website: "",
        category: "other",
        contactEmail: "",
        contactPhone: "",
        featured: false
      });
    }
    setShowSponsorModal(true);
  };

  const fixSubscriptionDates = async () => {
    if (window.confirm("Fix all subscription dates for premium users?")) {
      try {
        const token = getToken();
        const response = await axios.post(
          `${API_URL}/admin/fix-subscription-dates`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(response.data.message);
        fetchData();
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to fix subscription dates");
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          ) : (
            <Shield className="w-6 h-6 text-blue-600 mx-auto" />
          )}
        </div>
        
        <nav className="mt-6">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "users", label: "Users", icon: Users },
            { id: "listings", label: "Listings", icon: Smartphone },
            { id: "sponsors", label: "Sponsors", icon: Trophy },
            { id: "requests", label: "Plan Requests", icon: Crown }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 w-full"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-white rounded-lg shadow"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fix Subscription Button */}
          <div className="mb-6">
            <button
              onClick={fixSubscriptionDates}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Fix All Subscription Dates
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
                <StatCard title="Total Listings" value={stats.totalListings} icon={Smartphone} color="green" />
                <StatCard title="Total Sponsors" value={stats.totalSponsors} icon={Trophy} color="purple" />
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Badge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Subscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{user.username}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                            user.plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                            user.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {user.plan || 'free'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.badge || "normal"}
                            onChange={(e) => handleUpdateBadge(user._id, e.target.value)}
                            className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="normal">Normal</option>
                            <option value="trusted">Trusted</option>
                            <option value="verified">Verified</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {user.subscription?.endDate && (
                              <div className="text-xs text-gray-500">
                                Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Plan Requests Tab */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Plan Upgrade Requests
                  {loadingRequests && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>}
                </h2>
              </div>
              <div className="divide-y">
                {planRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No pending requests</div>
                ) : (
                  planRequests.map((request) => (
                    <div key={request._id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{request.user?.username || "Unknown"}</p>
                          <p className="text-sm text-gray-600">{request.user?.email}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">From:</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">{request.currentPlan}</span>
                            <span className="text-sm">→</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">{request.requestedPlan}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Price: ${request.price}/{request.duration}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNote("");
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === "listings" && (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {listings.filter(l => l.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(listing => (
                      <tr key={listing._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {listing.images && listing.images[0] && (
                            <img src={listing.images[0]} alt={listing.title} className="w-12 h-12 object-cover rounded" />
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{listing.title}</td>
                        <td className="px-6 py-4 text-blue-600 font-bold">{listing.price} DT</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${listing.condition === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {listing.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{listing.seller?.username || "Unknown"}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleFeatured(listing._id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                              listing.featured 
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <Star className="w-3 h-3" />
                            {listing.featured ? "Featured" : "Set Featured"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteListing(listing._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sponsors Tab */}
          {activeTab === "sponsors" && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => openSponsorModal()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition transform flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Sponsor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(sponsor => (
                  <div key={sponsor._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="h-32 bg-gray-100 flex items-center justify-center p-4">
                      <img src={sponsor.logo} alt={sponsor.name} className="max-h-full object-contain" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{sponsor.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">{sponsor.description}</p>
                          {sponsor.website && (
                            <a 
                              href={sponsor.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-500 text-sm hover:underline inline-block mt-2"
                            >
                              Visit Website →
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openSponsorModal(sponsor)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSponsor(sponsor._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {sponsor.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded-full">{sponsor.category}</span>
                          )}
                          {sponsor.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Review Plan Request</h3>
            <div className="mb-4 space-y-2">
              <p><strong>User:</strong> {selectedRequest.user?.username}</p>
              <p><strong>Email:</strong> {selectedRequest.user?.email}</p>
              <p><strong>From:</strong> <span className="capitalize">{selectedRequest.currentPlan}</span></p>
              <p><strong>To:</strong> <span className="capitalize">{selectedRequest.requestedPlan}</span></p>
              <p><strong>Price:</strong> ${selectedRequest.price}/{selectedRequest.duration}</p>
              <p><strong>Requested:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
            </div>
            <textarea
              placeholder="Admin note (optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full p-3 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleApproveRequest(selectedRequest._id)}
                className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleDeclineRequest(selectedRequest._id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Decline
              </button>
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sponsor Modal */}
      {showSponsorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}
                </h2>
                <button onClick={() => setShowSponsorModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={editingSponsor ? handleUpdateSponsor : handleCreateSponsor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sponsor Name *</label>
                  <input
                    type="text"
                    value={sponsorForm.name}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL *</label>
                  <input
                    type="text"
                    value={sponsorForm.logo}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, logo: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://example.com/logo.png"
                    required
                  />
                  {sponsorForm.logo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Preview:</p>
                      <img src={sponsorForm.logo} alt="Preview" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={sponsorForm.description}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                  <input
                    type="text"
                    value={sponsorForm.website}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={sponsorForm.category}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, category: e.target.value })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="accessories">Accessories</option>
                      <option value="repair">Repair</option>
                      <option value="delivery">Delivery</option>
                      <option value="payment">Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Featured</label>
                    <select
                      value={sponsorForm.featured}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, featured: e.target.value === "true" })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email (Optional)</label>
                    <input
                      type="email"
                      value={sponsorForm.contactEmail}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, contactEmail: e.target.value })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Phone (Optional)</label>
                    <input
                      type="text"
                      value={sponsorForm.contactPhone}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, contactPhone: e.target.value })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition transform"
                >
                  {editingSponsor ? "Update Sponsor" : "Create Sponsor"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
