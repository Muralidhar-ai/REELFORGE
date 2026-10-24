import { describe, it, expect } from "vitest";
import { AuthService } from "@/lib/auth/service";

describe("ReelForge Authentication & Role-Based Authorization", () => {
  it("authenticates a seeded Creator with valid credentials", async () => {
    const { user, session } = await AuthService.authenticate(
      "inbarasan@reelforge.com",
      "creator123",
      "creator"
    );

    expect(user).toBeDefined();
    expect(user.role).toBe("creator");
    expect(user.creatorId).toBe("cr_1");
    expect(session.token).toMatch(/^rf_sess_/);
  });

  it("authenticates a seeded Brand with valid credentials", async () => {
    const { user, session } = await AuthService.authenticate(
      "brand@aurakicks.com",
      "brand123",
      "brand"
    );

    expect(user).toBeDefined();
    expect(user.role).toBe("brand");
    expect(user.brandName).toBe("AURA Kicks");
    expect(session.token).toBeDefined();
  });

  it("rejects login when password is incorrect", async () => {
    await expect(
      AuthService.authenticate("inbarasan@reelforge.com", "wrong-password")
    ).rejects.toThrow("Invalid email or password.");
  });

  it("rejects login when account does not match selected workspace role", async () => {
    await expect(
      AuthService.authenticate("brand@aurakicks.com", "brand123", "creator")
    ).rejects.toThrow("This is a Brand account. Please select 'Continue as Brand'.");
  });

  it("authenticates administrator strictly through admin portal", async () => {
    const { user, session } = await AuthService.authenticateAdmin(
      "admin@reelforge.com",
      "admin123"
    );

    expect(user.role).toBe("admin");
    expect(session.token).toBeDefined();
  });

  it("denies administrative access to non-admin accounts", async () => {
    await expect(
      AuthService.authenticateAdmin("brand@aurakicks.com", "brand123")
    ).rejects.toThrow("Access restricted. Account lacks administrative privileges.");
  });

  it("registers a new Creator with server-enforced role and creates directory entry", async () => {
    const testEmail = `creator_${Date.now()}@teststudio.ai`;
    const { user, session } = await AuthService.registerCreator({
      name: "Taro Tanaka",
      email: testEmail,
      password: "secretPassword123",
      studioName: "Tokyo Cinematic AI",
    });

    expect(user.role).toBe("creator");
    expect(user.name).toBe("Taro Tanaka");
    expect(user.creatorId).toBeDefined();
    expect(session.token).toBeDefined();

    // Verify session validation
    const verifiedUser = AuthService.validateSession(session.token);
    expect(verifiedUser?.email).toBe(testEmail);
  });

  it("registers a new Brand with server-enforced role", async () => {
    const testEmail = `brand_${Date.now()}@acme.corp`;
    const { user, session } = await AuthService.registerBrand({
      name: "Jordan Belfort",
      email: testEmail,
      password: "corpPassword123",
      companyName: "Acme International",
    });

    expect(user.role).toBe("brand");
    expect(user.brandName).toBe("Acme International");
    expect(session.token).toBeDefined();
  });

  it("handles forgot password with privacy-preserving response", async () => {
    const res = await AuthService.requestPasswordReset("nonexistent@example.com");
    expect(res.success).toBe(true);
    expect(res.message).toContain("If an account exists");
  });
});
