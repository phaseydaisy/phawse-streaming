import { clerkClient } from "@clerk/nextjs/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// Clerk auth configuration - works with Cloudflare Workers/Pages
// No database required!

export { auth, currentUser };

// Helper to get user ID
export const getUserId = async () => {
  const { userId } = await auth();
  return userId;
};

// Helper to get current user
export const getUser = async () => {
  return await currentUser();
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const { userId } = await auth();
  return !!userId;
};

// Get user email
export const getUserEmail = async () => {
  const user = await currentUser();
  return user?.emailAddresses[0]?.emailAddress;
};

// Get user profile image
export const getUserImage = async () => {
  const user = await currentUser();
  return user?.imageUrl;
};

// Clerk publishable key and secret key env vars:
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
// CLERK_SECRET_KEY=sk_test_...
// CLERK_WEBHOOK_SECRET=whsec_...