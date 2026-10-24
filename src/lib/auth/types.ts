export type UserRole = "creator" | "brand" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  creatorId?: string; // Links to Creator entity in repo if role === "creator"
  brandName?: string; // Company / agency name if role === "brand"
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  role: UserRole;
  creatorId?: string;
  brandName?: string;
  expiresAt: string;
}

export interface LoginResult {
  ok: boolean;
  user?: User;
  redirectUrl?: string;
  error?: string;
}
