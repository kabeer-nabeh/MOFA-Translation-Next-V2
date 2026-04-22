"use client";

import { MoreVertical, Plus, Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type UserRole = "Admin" | "Host" | "Moderator" | "Participant";
type UserStatus = "Active" | "Inactive";

const USERS: Array<{
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}> = [
  { name: "Abdullah Al Harbi", email: "abdullah.h@mofa.gov.sa", role: "Admin", status: "Active" },
  { name: "Suliman Alawi", email: "suliman.a@mofa.gov.sa", role: "Host", status: "Active" },
  { name: "Fatima Alzahra", email: "fatima.z@mofa.gov.sa", role: "Moderator", status: "Active" },
  { name: "Khalid Mansour", email: "khalid.m@mofa.gov.sa", role: "Participant", status: "Inactive" },
  { name: "Ahmad Yasin", email: "ahmad.y@mofa.gov.sa", role: "Participant", status: "Active" },
];

function RolePill({ role }: { role: UserRole }) {
  const cfg: Record<UserRole, { bg: string; border?: string; text: string; w?: string }> = {
    Admin: { bg: "#f3e8ff", border: "#e9d4ff", text: "#8200db", w: "w-[54px]" },
    Host: { bg: "#dbeafe", border: "#bedbff", text: "#1447e6", w: "w-[44px]" },
    Moderator: { bg: "#ffedd4", border: "#ffd6a8", text: "#ca3500", w: "w-[75px]" },
    Participant: { bg: "#f3f4f6", border: "#e5e7eb", text: "#364153", w: "w-[79px]" },
  };
  const c = cfg[role];
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2 text-[12px] font-medium leading-[18px]",
        c.w,
      )}
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
    >
      {role}
    </span>
  );
}

function StatusPill({ status }: { status: UserStatus }) {
  const isActive = status === "Active";
  return (
    <span
      className="inline-flex h-[22px] items-center rounded-full px-[10px] text-[12px] font-medium leading-[18px]"
      style={{
        backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
        color: isActive ? "#008236" : "#364153",
      }}
    >
      {status}
    </span>
  );
}

export function UsersSettingsPanel() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-10 items-center justify-between">
        <div className="relative w-[300px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="h-10 w-full rounded-lg border border-[#eeedf5] bg-white pl-9 pr-3 text-sm text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] placeholder:text-[rgba(65,70,81,0.5)] focus:outline-none"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#414651]"
            aria-hidden="true"
          />
        </div>

        <Button variant="primary">
          <Plus size={16} aria-hidden="true" />
          Add User
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#eeedf5] bg-white">
        <div className="grid grid-cols-[1fr_205px_183px_156px] border-b border-[#eeedf5] bg-[#fdfcfc] py-[15px] text-sm font-medium text-[#535862]">
          <div className="px-6">User / Email</div>
          <div className="px-6">Role (RBAC)</div>
          <div className="px-6">Status</div>
          <div className="px-6 text-right">Actions</div>
        </div>

        <div>
          {filtered.map((u, idx) => {
            const initial = u.name.trim().slice(0, 1).toUpperCase();
            const isLast = idx === filtered.length - 1;
            return (
              <div
                key={u.email}
                className={cn(
                  "grid grid-cols-[1fr_205px_183px_156px] items-center py-4",
                  !isLast && "border-b border-[#eeedf5]",
                )}
              >
                <div className="flex items-center gap-3 px-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f3f7] text-base font-semibold leading-6 text-[#6e6b8b]">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold leading-[21px] text-[#414651]">
                      {u.name}
                    </div>
                    <div className="truncate text-[13px] leading-[19.5px] text-[#535862]">
                      {u.email}
                    </div>
                  </div>
                </div>

                <div className="px-6">
                  <RolePill role={u.role} />
                </div>

                <div className="px-6">
                  <StatusPill status={u.status} />
                </div>

                <div className="flex justify-end px-6">
                  <button
                    type="button"
                    className="inline-flex h-6 w-6 items-center justify-center rounded"
                    aria-label="Actions"
                  >
                    <MoreVertical size={16} className="text-[#64748b]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

