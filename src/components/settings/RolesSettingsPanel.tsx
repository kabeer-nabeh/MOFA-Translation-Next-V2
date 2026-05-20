"use client";

import { MoreVertical, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const ROLES: Array<{
  name: string;
  description: string;
  permissionLabel: string;
  pill: { bg: string; text: string; w: string };
}> = [
  {
    name: "Admin",
    description: "Full access to system configurations, users, and billing.",
    permissionLabel: "All Access",
    pill: { bg: "#f3e8ff", text: "#8200db", w: "w-[76px]" },
  },
  {
    name: "Host",
    description: "Can create and manage meetings, and view their own usage.",
    permissionLabel: "Meetings, Personal Usage",
    pill: { bg: "#dbeafe", text: "#1447e6", w: "w-[161px]" },
  },
  {
    name: "Moderator",
    description: "Can manage participants within a meeting and view chat logs.",
    permissionLabel: "In-Meeting Control",
    pill: { bg: "#ffedd4", text: "#ca3500", w: "w-[124px]" },
  },
  {
    name: "Participant",
    description: "Can join meetings and use live translation features.",
    permissionLabel: "Join Meetings",
    pill: { bg: "#f3f4f6", text: "#364153", w: "w-[96px]" },
  },
];

function PermissionPill({
  label,
  pill,
}: {
  label: string;
  pill: { bg: string; text: string; w: string };
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-full px-[10px] text-[12px] font-medium leading-[18px]",
        pill.w,
      )}
      style={{ backgroundColor: pill.bg, color: pill.text }}
    >
      {label}
    </span>
  );
}

export function RolesSettingsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-10 items-center justify-between">
        <div className="text-[18px] font-semibold leading-[27px] text-[color:var(--mofa-text-body)]">
          Role-Based Access Control
        </div>

        <Button variant="primary">
          <Plus size={16} aria-hidden="true" />
          Create Role
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[color:var(--mofa-border-default)] bg-white">
        <div className="grid grid-cols-[131px_1fr_228px_105px] border-b border-[color:var(--mofa-border-default)] bg-[#fdfcfc] py-[15px] text-sm font-medium text-[color:var(--mofa-text-subtle)]">
          <div className="px-6">Role Name</div>
          <div className="px-6">Description</div>
          <div className="px-6">Permissions</div>
          <div className="px-6 text-right">Actions</div>
        </div>

        {ROLES.map((r, idx) => {
          const isLast = idx === ROLES.length - 1;
          return (
            <div
              key={r.name}
              className={cn(
                "grid grid-cols-[131px_1fr_228px_105px] items-center py-[17.75px]",
                !isLast && "border-b border-[color:var(--mofa-border-default)]",
              )}
            >
              <div className="px-6 text-sm font-semibold leading-[21px] text-[color:var(--mofa-text-body)]">
                {r.name}
              </div>
              <div className="px-6 text-sm leading-[21px] text-[color:var(--mofa-text-subtle)]">
                {r.description}
              </div>
              <div className="px-6">
                <PermissionPill label={r.permissionLabel} pill={r.pill} />
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
  );
}

