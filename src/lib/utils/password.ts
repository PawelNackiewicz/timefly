/**
 * Password/PIN Utilities
 *
 * Hash and verify PINs using bcrypt for secure worker authentication
 *
 * Note: Requires 'bcryptjs' package to be installed:
 * npm install bcryptjs @types/bcryptjs
 */

import bcrypt from "bcryptjs";

/**
 * Number of salt rounds for bcrypt hashing
 * Higher = more secure but slower
 * 10 rounds is a good balance for production
 */
const SALT_ROUNDS = 10;

/**
 * Hash a PIN using bcrypt
 *
 * @param pin - Plain text PIN (4-6 digits)
 * @returns Bcrypt hash string
 *
 * @example
 * const hash = await hashPin("1234");
 * // Returns: "$2a$10$..."
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a PIN against a bcrypt hash
 *
 * @param pin - Plain text PIN to verify
 * @param hash - Bcrypt hash to compare against
 * @returns True if PIN matches hash, false otherwise
 *
 * @example
 * const isValid = await verifyPin("1234", storedHash);
 * if (isValid) {
 *   // PIN is correct
 * }
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
