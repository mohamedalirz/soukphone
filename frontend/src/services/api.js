// services/api.js
import axios from "axios";

// Regular API instance (for users)
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Admin API instance (for admin routes)
const AdminAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor for regular API (user token)
API.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");
    
    if (token && typeof token === 'string' && token !== '[object Object]' && token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("Interceptor error:", error);
    return Promise.reject(error);
  }
);

// Request interceptor for Admin API (admin token)
AdminAPI.interceptors.request.use(
  (config) => {
    // Use admin token for admin routes
    let token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    
    console.log("Admin API request:", config.url, "Token exists:", !!token);
    
    if (token && typeof token === 'string' && token !== '[object Object]') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("Admin API interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling rate limiting
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      return API(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// ============ AUTH FUNCTIONS ============
export const registerUser = async (userData) => {
  try {
    console.log("Sending registration request:", userData);
    const { data } = await API.post("/auth/register", userData);
    console.log("Registration response:", data);
    return data;
  } catch (error) {
    console.error("Register API error:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log("Sending login request:", { email: credentials.email });
    const { data } = await API.post("/auth/login", credentials);
    console.log("Login response:", data);
    return data;
  } catch (error) {
    console.error("Login API error:", error.response?.data || error.message);
    throw error;
  }
};

export const getProfile = async () => {
  const { data } = await API.get("/auth/profile");
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await API.put("/auth/profile", userData);
  if (data) {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...currentUser, ...data }));
  }
  return data;
};

export const getUserById = async (userId) => {
  try {
    const { data } = await API.get(`/auth/user/${userId}`);
    return data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};

// ============ LISTING FUNCTIONS ============
export const getListings = async () => {
  try {
    const { data } = await API.get("/listings", { timeout: 5000 });
    return data;
  } catch (error) {
    console.error("Error fetching listings:", error.message);
    throw error;
  }
};

export const getListingById = async (id) => {
  const { data } = await API.get(`/listings/${id}`);
  return data;
};

export const getUserListings = async () => {
  const { data } = await API.get("/listings/user/my-listings");
  return data;
};

export const addListing = async (listingData) => {
  try {
    console.log("Sending listing data:", listingData);
    const { data } = await API.post("/listings", listingData);
    return data;
  } catch (error) {
    console.error("Add listing error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteListing = async (listingId) => {
  try {
    const { data } = await API.delete(`/listings/${listingId}`);
    return data;
  } catch (error) {
    console.error("Delete listing error:", error);
    throw error;
  }
};

// ============ UPLOAD FUNCTIONS ============
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post("http://localhost:5000/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000
    });
    console.log("Upload response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// ============ SPONSOR FUNCTIONS ============
export const getAllSponsors = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/sponsors");
    console.log("Public sponsors response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get sponsors error:", error);
    throw error;
  }
};

// ============ ADMIN FUNCTIONS (using AdminAPI) ============
export const adminLogin = async (credentials) => {
  try {
    const { data } = await axios.post("http://localhost:5000/api/admin/auth/login", credentials);
    console.log("Admin login response:", data);
    return data;
  } catch (error) {
    console.error("Admin login error:", error.response?.data || error.message);
    throw error;
  }
};

export const getDashboardStats = async () => {
  const { data } = await AdminAPI.get("/admin/stats");
  return data;
};

export const getAllUsers = async () => {
  const { data } = await AdminAPI.get("/admin/users");
  return data;
};

export const updateUserRole = async (userId, userData) => {
  const { data } = await AdminAPI.put(`/admin/users/${userId}/role`, userData);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await AdminAPI.delete(`/admin/users/${userId}`);
  return data;
};

export const getAllListings = async () => {
  const { data } = await AdminAPI.get("/admin/listings");
  return data;
};

export const updateListing = async (listingId, listingData) => {
  const { data } = await AdminAPI.put(`/admin/listings/${listingId}`, listingData);
  return data;
};

export const deleteListingAdmin = async (listingId) => {
  const { data } = await AdminAPI.delete(`/admin/listings/${listingId}`);
  return data;
};

export const toggleListingFeatured = async (listingId) => {
  const { data } = await AdminAPI.patch(`/admin/listings/${listingId}/featured`);
  return data;
};

export const createSponsor = async (sponsorData) => {
  const { data } = await AdminAPI.post("/admin/sponsors", sponsorData);
  return data;
};

export const updateSponsor = async (sponsorId, sponsorData) => {
  const { data } = await AdminAPI.put(`/admin/sponsors/${sponsorId}`, sponsorData);
  return data;
};

export const deleteSponsor = async (sponsorId) => {
  const { data } = await AdminAPI.delete(`/admin/sponsors/${sponsorId}`);
  return data;
};

// ============ MESSAGE FUNCTIONS ============
export const getMessages = async (roomId) => {
  try {
    const { data } = await API.get(`/messages/${roomId}`);
    return data;
  } catch (error) {
    console.error("Get messages error:", error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const { data } = await API.post("/messages", messageData);
    return data;
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  }
};

export const getUserConversations = async () => {
  try {
    const { data } = await API.get("/messages/conversations");
    return data;
  } catch (error) {
    console.error("Get conversations error:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (roomId) => {
  try {
    const { data } = await API.put(`/messages/${roomId}/read`);
    return data;
  } catch (error) {
    console.error("Mark messages as read error:", error);
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin");
  window.location.href = "/login";
};