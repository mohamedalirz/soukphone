// controllers/subscriptionController.js
import User from "../models/User.js";
import PlanRequest from "../models/PlanRequest.js";

// Calculate subscription dates
const calculateSubscriptionDates = (duration) => {
  const startDate = new Date();
  const endDate = new Date();
  
  if (duration === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (duration === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  return { startDate, endDate };
};

// Activate subscription for user
export const activateSubscription = async (userId, plan, duration, price) => {
  try {
    const { startDate, endDate } = calculateSubscriptionDates(duration);
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.plan = plan;
    user.subscription = {
      plan: plan,
      startDate: startDate,
      endDate: endDate,
      status: "active",
      autoRenew: false,
      price: price,
      duration: duration
    };
    
    await user.save();
    
    console.log(`Subscription activated for user ${user.email}: ${plan} until ${endDate}`);
    return { success: true, user };
  } catch (error) {
    console.error("Error activating subscription:", error);
    throw error;
  }
};

// Check and update expired subscriptions
export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Find all active subscriptions that have expired
    const expiredUsers = await User.find({
      "subscription.status": "active",
      "subscription.endDate": { $lt: now }
    });
    
    let updatedCount = 0;
    
    for (const user of expiredUsers) {
      console.log(`Subscription expired for user: ${user.email}`);
      
      // Downgrade to free plan
      user.plan = "free";
      user.subscription.status = "expired";
      await user.save();
      
      updatedCount++;
    }
    
    console.log(`Checked subscriptions: ${updatedCount} users downgraded to free plan`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error checking expired subscriptions:", error);
    return { success: false, error: error.message };
  }
};

// controllers/subscriptionController.js - Update getSubscriptionStatus
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("plan subscription");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let subscriptionData = {
      plan: user.plan || "free",
      status: "inactive",
      startDate: null,
      endDate: null,
      isExpired: false,
      daysRemaining: 0,
      autoRenew: false,
      duration: null
    };
    
    if (user.subscription && user.subscription.status === "active") {
      const now = new Date();
      
      // Parse dates properly
      let endDate = null;
      let startDate = null;
      
      if (user.subscription.endDate) {
        endDate = new Date(user.subscription.endDate);
      }
      
      if (user.subscription.startDate) {
        startDate = new Date(user.subscription.startDate);
      }
      
      let isExpired = false;
      let daysRemaining = 0;
      
      if (endDate && !isNaN(endDate.getTime())) {
        isExpired = endDate < now;
        daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      }
      
      subscriptionData = {
        plan: user.plan,
        status: user.subscription.status,
        startDate: startDate && !isNaN(startDate.getTime()) ? startDate.toISOString() : null,
        endDate: endDate && !isNaN(endDate.getTime()) ? endDate.toISOString() : null,
        isExpired: isExpired,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        autoRenew: user.subscription.autoRenew || false,
        duration: user.subscription.duration
      };
    }
    
    res.json({
      success: true,
      subscription: subscriptionData
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle auto-renew (disabled for now)
export const toggleAutoRenew = async (req, res) => {
  res.json({ 
    success: false, 
    message: "Auto-renew is currently disabled. Please submit a new plan request when your subscription expires." 
  });
};

// Admin: Manually update subscription
export const adminUpdateSubscription = async (req, res) => {
  try {
    const { userId, plan, duration, action } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (action === "activate") {
      const { startDate, endDate } = calculateSubscriptionDates(duration);
      const prices = { premium: 29, enterprise: 99 };
      
      user.plan = plan;
      user.subscription = {
        plan: plan,
        startDate: startDate,
        endDate: endDate,
        status: "active",
        autoRenew: false,
        price: prices[plan],
        duration: duration
      };
    } else if (action === "expire") {
      user.plan = "free";
      if (user.subscription) {
        user.subscription.status = "expired";
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: `Subscription ${action}d successfully`,
      user: {
        _id: user._id,
        username: user.username,
        plan: user.plan,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: error.message });
  }
};