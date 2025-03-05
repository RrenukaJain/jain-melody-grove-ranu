
/**
 * Helper function to extract the clean user ID from Clerk's user ID format.
 * Clerk IDs typically start with "user_" prefix which needs to be removed
 * before using with Supabase.
 */
export const extractClerkUserId = (clerkId: string | undefined): string | null => {
  if (!clerkId) return null;
  
  // Clerk IDs typically start with "user_" - we need to remove this prefix
  if (clerkId.startsWith('user_')) {
    return clerkId.substring(5);
  }
  
  return clerkId;
};
