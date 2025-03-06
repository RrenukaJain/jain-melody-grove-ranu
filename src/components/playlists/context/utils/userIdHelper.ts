
/**
 * Helper function to extract the clean user ID from Clerk's user ID format.
 * Clerk IDs typically start with "user_" prefix which needs to be removed
 * before using with Supabase.
 */
// export const extractClerkUserId = (clerkId: string | undefined): string | null => {
//   if (!clerkId) return null;
  
//   // Clerk IDs typically start with "user_" - we need to remove this prefix
//   if (clerkId.startsWith('user_')) {
//     return clerkId.substring(5);
//   }
  
//   return clerkId;
// };

// -----------
import { v5 as uuidv5 } from 'uuid';

/**
 * Helper function to convert a Clerk user ID to a valid UUID for Supabase.
 * Since Clerk IDs don't conform to UUID format, we need to generate a 
 * deterministic UUID based on the Clerk ID.
 */
export const extractClerkUserId = (clerkId: string | undefined): string | null => {
  if (!clerkId) return null;
  
  // Remove the "user_" prefix if it exists
  const cleanId = clerkId.startsWith('user_') ? clerkId.substring(5) : clerkId;
  
  // Generate a deterministic UUID based on the Clerk ID
  // This ensures the same Clerk ID always maps to the same UUID
  return generateDeterministicUuid(cleanId);
};

/**
 * Generates a deterministic UUID v5 from a string input.
 * This ensures the same input always produces the same UUID.
 */
function generateDeterministicUuid(input: string): string {
  // Use a namespace for UUID v5 (this is a standard UUID namespace for DNS)
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  
  // Generate a deterministic UUID using the input and namespace
  return uuidv5(input, NAMESPACE);
}
