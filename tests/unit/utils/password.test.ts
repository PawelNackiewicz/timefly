/**
 * Password/PIN Utilities - Unit Tests
 *
 * Tests for PIN hashing and verification functions
 */

import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "@/lib/utils/password";

describe("Password Utilities", () => {
  describe("hashPin", () => {
    it("should hash a PIN", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same PIN (due to salt)", async () => {
      const pin = "1234";
      const hash1 = await hashPin(pin);
      const hash2 = await hashPin(pin);

      // Hashes should be different due to different salts
      expect(hash1).not.toBe(hash2);
    });

    it("should hash different PINs differently", async () => {
      const hash1 = await hashPin("1234");
      const hash2 = await hashPin("5678");

      expect(hash1).not.toBe(hash2);
    });

    it("should generate bcrypt format hashes", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);

      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it("should handle 4-digit PINs", async () => {
      const pin = "1111";
      const hash = await hashPin(pin);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should handle 6-digit PINs", async () => {
      const pin = "123456";
      const hash = await hashPin(pin);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("verifyPin", () => {
    it("should verify correct PIN", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);
      const isValid = await verifyPin(pin, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect PIN", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);
      const isValid = await verifyPin("9999", hash);

      expect(isValid).toBe(false);
    });

    it("should reject PIN with wrong length", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);
      const isValid = await verifyPin("123", hash);

      expect(isValid).toBe(false);
    });

    it("should reject PIN with extra digits", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);
      const isValid = await verifyPin("12345", hash);

      expect(isValid).toBe(false);
    });

    it("should handle edge case - similar PINs", async () => {
      const pin1 = "1234";
      const hash1 = await hashPin(pin1);

      const isValid1 = await verifyPin("1234", hash1);
      const isValid2 = await verifyPin("1235", hash1);
      const isValid3 = await verifyPin("1233", hash1);

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(false);
      expect(isValid3).toBe(false);
    });

    it("should handle empty PIN verification", async () => {
      const hash = await hashPin("1234");
      const isValid = await verifyPin("", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("Security Considerations", () => {
    it("should use sufficient salt rounds (timing test)", async () => {
      const startTime = Date.now();
      await hashPin("1234");
      const duration = Date.now() - startTime;

      // With 10 rounds, hashing should take at least 50ms (varies by CPU)
      // This is a loose check - mainly ensures we're not using 1 round
      expect(duration).toBeGreaterThan(10);
    });

    it("should verify PIN in reasonable time", async () => {
      const hash = await hashPin("1234");
      const startTime = Date.now();
      await verifyPin("1234", hash);
      const duration = Date.now() - startTime;

      // Verification should be reasonably fast (< 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});
