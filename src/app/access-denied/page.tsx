"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useRole } from "@/context/RoleContext";

export default function AccessDeniedPage() {
  const { role, user } = useRole();

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#282A24] bg-[#191A17] p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#B84A4A]/10 border border-[#B84A4A]/30 mx-auto flex items-center justify-center text-[#E57373]">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs text-[#E57373] uppercase tracking-wider font-semibold">
            Security Notice
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F0E8] font-display">
            Access Restricted
          </h1>
          <p className="text-[#AAA99F] text-xs sm:text-sm leading-relaxed">
            Your current account permissions do not grant access to this workspace. Administrative access is restricted to verified platform supervisors.
          </p>
        </div>

        {user && (
          <div className="p-3 bg-[#111210] border border-[#282A24] rounded-lg text-xs font-mono text-[#AAA99F]">
            Signed in as: <span className="text-[#F3F0E8]">{user.email}</span> ({user.role})
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full btn-secondary text-xs py-2.5 justify-center gap-2 font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            Home Desk
          </Link>

          <Link
            href="/login"
            className="w-full btn-primary text-xs py-2.5 justify-center gap-2 font-mono"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
