"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/lib/auth/types";

export type Role = "brand" | "creator" | "admin";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeCreatorId: string;
  setActiveCreatorId: (id: string) => void;
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => Promise<void>;
  isLoadingUser: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const DEFAULT_CREATOR_ID = "cr_1";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("brand");
  const [activeCreatorId, setActiveCreatorIdState] = useState<string>(DEFAULT_CREATOR_ID);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // Sync with authenticated user on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.ok && data.user) {
          setUser(data.user);
          setRoleState(data.user.role as Role);
          if (data.user.creatorId) {
            setActiveCreatorIdState(data.user.creatorId);
          }
          localStorage.setItem("reelforge_role", data.user.role);
          if (data.user.creatorId) {
            localStorage.setItem("reelforge_creator_id", data.user.creatorId);
          }
          return;
        }
      } catch (err) {
        // Fallback to local storage if API is offline
      } finally {
        setIsLoadingUser(false);
      }

      // Local storage fallback for dev demo
      const savedRole = localStorage.getItem("reelforge_role") as Role;
      if (savedRole === "brand" || savedRole === "creator" || savedRole === "admin") {
        setRoleState(savedRole);
      }
      const savedCreatorId = localStorage.getItem("reelforge_creator_id");
      if (savedCreatorId) {
        setActiveCreatorIdState(savedCreatorId);
      }
    }

    checkAuth();
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem("reelforge_role", newRole);
  };

  const setActiveCreatorId = (id: string) => {
    setActiveCreatorIdState(id);
    localStorage.setItem("reelforge_creator_id", id);
  };

  const loginUser = (loggedInUser: User) => {
    setUser(loggedInUser);
    setRoleState(loggedInUser.role as Role);
    if (loggedInUser.creatorId) {
      setActiveCreatorIdState(loggedInUser.creatorId);
      localStorage.setItem("reelforge_creator_id", loggedInUser.creatorId);
    }
    localStorage.setItem("reelforge_role", loggedInUser.role);
  };

  const logoutUser = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // ignore
    }
    setUser(null);
    setRoleState("brand");
    localStorage.removeItem("reelforge_role");
    localStorage.removeItem("reelforge_creator_id");
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        activeCreatorId,
        setActiveCreatorId,
        user,
        loginUser,
        logoutUser,
        isLoadingUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
