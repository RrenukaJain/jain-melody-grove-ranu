
import { v5 as uuidv5 } from 'uuid';

/**
 * Helper function to convert a Clerk user ID to a valid UUID for Supabase.
 * Since Clerk IDs don't conform to UUID format, we need to generate a 
 * deterministic UUID based on the Clerk ID.
 */
export const extractClerkUserId = (clerkId: string | undefined): string | null => {
  if (!clerkId) {
    console.error('extractClerkUserId: No user ID provided');
    return null;
  }
  
  console.log('extractClerkUserId: Original Clerk ID:', clerkId);
  
  // Remove the "user_" prefix if it exists
  const cleanId = clerkId.startsWith('user_') ? clerkId.substring(5) : clerkId;
  console.log('extractClerkUserId: Cleaned ID (without prefix):', cleanId);
  
  try {
    // Generate a deterministic UUID based on the Clerk ID
    // This ensures the same Clerk ID always maps to the same UUID
    const uuid = generateDeterministicUuid(cleanId);
    console.log('extractClerkUserId: Generated UUID:', uuid);
    
    // Validate that the generated string is a valid UUID
    if (!isValidUuid(uuid)) {
      console.error('extractClerkUserId: Generated an invalid UUID:', uuid);
      return null;
    }
    
    return uuid;
  } catch (error) {
    console.error('extractClerkUserId: Error generating UUID:', error);
    return null;
  }
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

/**
 * Validates that a string is a properly formatted UUID.
 * UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx where x is a hexadecimal digit.
 */
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
