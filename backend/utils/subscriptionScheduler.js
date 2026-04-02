// utils/subscriptionScheduler.js
import cron from "node-cron";
import { checkExpiredSubscriptions } from "../controllers/subscriptionController.js";

// Run every day at midnight
export const startSubscriptionScheduler = () => {
  // Run every day at 00:00
  cron.schedule("0 0 * * *", async () => {
    console.log("Running subscription expiration check...");
    const result = await checkExpiredSubscriptions();
    console.log("Subscription check completed:", result);
  });
  
  // Also run every hour for testing (remove in production)
  cron.schedule("0 * * * *", async () => {
    console.log("Hourly subscription check...");
    await checkExpiredSubscriptions();
  });
  
  console.log("Subscription scheduler started");
};

// Run on server startup
export const runInitialCheck = async () => {
  console.log("Running initial subscription check...");
  const result = await checkExpiredSubscriptions();
  console.log("Initial check completed:", result);
};