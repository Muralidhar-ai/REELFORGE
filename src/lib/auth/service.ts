import crypto from "crypto";
import { User, UserRole, AuthSession } from "./types";
import { repo } from "@/lib/data";

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

// In-memory or persisted users store
const usersStore: Map<string, StoredUser> = new Map();
const sessionsStore: Map<string, AuthSession> = new Map();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function initDefaultUsers() {
  if (usersStore.size > 0) return;

  const defaultUsers = [
    {
      id: "usr_creator_1",
      email: "inbarasan@reelforge.com",
      name: "Inbarasan",
      role: "creator" as UserRole,
      creatorId: "cr_1",
      password: "creator123",
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "usr_creator_alias",
      email: "creator@reelforge.com",
      name: "Inbarasan (Director)",
      role: "creator" as UserRole,
      creatorId: "cr_1",
      password: "creator123",
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "usr_brand_1",
      email: "brand@aurakicks.com",
      name: "AURA Kicks Marketing",
      role: "brand" as UserRole,
      brandName: "AURA Kicks",
      password: "brand123",
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "usr_admin_1",
      email: "admin@reelforge.com",
      name: "Platform Supervisor",
      role: "admin" as UserRole,
      password: "admin123",
      createdAt: new Date("2026-01-01").toISOString(),
    },
  ];

  for (const u of defaultUsers) {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(u.password, salt);
    usersStore.set(u.email.toLowerCase(), {
      id: u.id,
      email: u.email.toLowerCase(),
      name: u.name,
      role: u.role,
      creatorId: u.creatorId,
      brandName: u.brandName,
      createdAt: u.createdAt,
      salt,
      passwordHash,
    });
  }
}

// Initialize on module load
initDefaultUsers();

export class AuthService {
  static sanitizeUser(user: StoredUser): User {
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  static async authenticate(email: string, password: string, expectedRole?: UserRole): Promise<{ user: User; session: AuthSession }> {
    initDefaultUsers();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const stored = usersStore.get(normalizedEmail);

    if (!stored) {
      throw new Error("Invalid email or password.");
    }

    const computedHash = hashPassword(password, stored.salt);
    if (computedHash !== stored.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    if (expectedRole && stored.role !== expectedRole) {
      if (stored.role === "creator") {
        throw new Error("This is a Creator account. Please select 'Continue as Creator'.");
      } else if (stored.role === "brand") {
        throw new Error("This is a Brand account. Please select 'Continue as Brand'.");
      } else if (stored.role === "admin") {
        throw new Error("Administrative accounts must sign in via the dedicated Admin Portal.");
      }
    }

    const user = this.sanitizeUser(stored);
    const session = this.createSession(user);

    if (typeof repo.logAuditEvent === "function") {
      await repo.logAuditEvent({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor_role: user.role,
        actor_id: user.id,
        action: "user_login",
        entity_type: "auth_session",
        entity_id: session.token.slice(0, 8),
        details: { email: user.email, role: user.role },
      }).catch(() => {});
    }

    return { user, session };
  }

  static async authenticateAdmin(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
    initDefaultUsers();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const stored = usersStore.get(normalizedEmail);

    if (!stored) {
      throw new Error("Invalid administrative credentials.");
    }

    const computedHash = hashPassword(password, stored.salt);
    if (computedHash !== stored.passwordHash) {
      throw new Error("Invalid administrative credentials.");
    }

    if (stored.role !== "admin") {
      throw new Error("Access restricted. Account lacks administrative privileges.");
    }

    const user = this.sanitizeUser(stored);
    const session = this.createSession(user);

    if (typeof repo.logAuditEvent === "function") {
      await repo.logAuditEvent({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor_role: "admin",
        actor_id: user.id,
        action: "admin_login",
        entity_type: "auth_session",
        entity_id: session.token.slice(0, 8),
        details: { email: user.email },
      }).catch(() => {});
    }

    return { user, session };
  }

  static createSession(user: User): AuthSession {
    const token = `rf_sess_${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const session: AuthSession = {
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      creatorId: user.creatorId,
      brandName: user.brandName,
      expiresAt,
    };

    sessionsStore.set(token, session);
    return session;
  }

  static validateSession(token?: string | null): User | null {
    if (!token) return null;
    initDefaultUsers();

    const session = sessionsStore.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      sessionsStore.delete(token);
      return null;
    }

    const stored = usersStore.get(session.email.toLowerCase());
    if (!stored) return null;

    return this.sanitizeUser(stored);
  }

  static destroySession(token?: string | null): boolean {
    if (!token) return false;
    return sessionsStore.delete(token);
  }

  static async registerCreator(params: {
    name: string;
    email: string;
    password: string;
    studioName?: string;
  }): Promise<{ user: User; session: AuthSession }> {
    initDefaultUsers();
    const normalizedEmail = (params.email || "").trim().toLowerCase();

    if (!normalizedEmail || !params.password || !params.name) {
      throw new Error("Full name, email, and password are required.");
    }

    if (params.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    if (usersStore.has(normalizedEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(params.password, salt);
    const userId = `usr_creator_${Date.now()}`;
    const newCreatorId = `cr_${Date.now()}`;

    // Also register the creator in the directory
    await repo.upsertCreator({
      id: newCreatorId,
      name: params.name,
      headline: params.studioName ? `${params.studioName} — Generative Filmmaker` : "Independent Generative Filmmaker",
      bio: "Newly registered creator workspace on ReelForge.",
      avatar_url: "/seed/avatars/avatar1.jpg",
      location: "Global",
      availability: "available",
      reviewed: false,
      specialization: ["Product ads"],
      skills: ["prompt engineering", "color grading"],
      tools: ["Runway", "Midjourney"],
      content_types: ["video"],
      formats: ["9:16", "16:9"],
      style_tags: ["cinematic", "photoreal"],
      verification_level: "self_declared",
    }).catch(() => {});

    const storedUser: StoredUser = {
      id: userId,
      email: normalizedEmail,
      name: params.name,
      role: "creator",
      creatorId: newCreatorId,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    };

    usersStore.set(normalizedEmail, storedUser);
    const user = this.sanitizeUser(storedUser);
    const session = this.createSession(user);

    if (typeof repo.logAuditEvent === "function") {
      await repo.logAuditEvent({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor_role: "creator",
        actor_id: user.id,
        action: "creator_registered",
        entity_type: "user",
        entity_id: user.id,
        details: { email: user.email, creatorId: newCreatorId },
      }).catch(() => {});
    }

    return { user, session };
  }

  static async registerBrand(params: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }): Promise<{ user: User; session: AuthSession }> {
    initDefaultUsers();
    const normalizedEmail = (params.email || "").trim().toLowerCase();

    if (!normalizedEmail || !params.password || !params.name || !params.companyName) {
      throw new Error("Contact name, company name, work email, and password are required.");
    }

    if (params.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    if (usersStore.has(normalizedEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(params.password, salt);
    const userId = `usr_brand_${Date.now()}`;

    const storedUser: StoredUser = {
      id: userId,
      email: normalizedEmail,
      name: params.name,
      role: "brand",
      brandName: params.companyName,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    };

    usersStore.set(normalizedEmail, storedUser);
    const user = this.sanitizeUser(storedUser);
    const session = this.createSession(user);

    if (typeof repo.logAuditEvent === "function") {
      await repo.logAuditEvent({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor_role: "brand",
        actor_id: user.id,
        action: "brand_registered",
        entity_type: "user",
        entity_id: user.id,
        details: { email: user.email, companyName: params.companyName },
      }).catch(() => {});
    }

    return { user, session };
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    initDefaultUsers();
    const normalizedEmail = (email || "").trim().toLowerCase();
    
    // Privacy-preserving: Do not reveal whether account exists
    if (usersStore.has(normalizedEmail)) {
      if (typeof repo.logAuditEvent === "function") {
        await repo.logAuditEvent({
          id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          actor_role: "system",
          actor_id: "auth_service",
          action: "password_reset_requested",
          entity_type: "user",
          entity_id: normalizedEmail,
          details: { timestamp: new Date().toISOString() },
        }).catch(() => {});
      }
    }

    return {
      success: true,
      message: "If an account exists for this email address, password reset instructions have been dispatched.",
    };
  }
}
