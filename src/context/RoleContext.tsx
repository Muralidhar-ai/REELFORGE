"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "brand" | "creator" | "admin";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeCreatorId: string;
  setActiveCreatorId: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const DEFAULT_CREATOR_ID = "cr_1";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("brand");
  const [activeCreatorId, setActiveCreatorIdState] = useState<string>(DEFAULT_CREATOR_ID);

  useEffect(() => {
    const savedRole = localStorage.getItem("reelforge_role") as Role;
    if (savedRole === "brand" || savedRole === "creator" || savedRole === "admin") {
      setRoleState(savedRole);
    }
    const savedCreatorId = localStorage.getItem("reelforge_creator_id");
    if (savedCreatorId) {
      setActiveCreatorIdState(savedCreatorId);
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem("reelforge_role", newRole);
  };

  const setActiveCreatorId = (id: string) => {
    setActiveCreatorIdState(id);
    localStorage.setItem("reelforge_creator_id", id);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        activeCreatorId,
        setActiveCreatorId,
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
