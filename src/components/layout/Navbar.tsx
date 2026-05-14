import Image from "next/image";
import Link from "next/link";
import { Bell, Settings, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

export type NavbarItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export type NavbarProps = {
  className?: string;
  containerClassName?: string;
  logo?: {
    src: string;
    alt: string;
    href?: string;
    width?: number;
    height?: number;
  };
  items: NavbarItem[];
  activeHref?: string;
  /** Matches Figma: default pill (home), brand pill (#f3f3f7) for Analytics */
  activeStyle?: "default" | "brand";
  language?: NavbarItem;
  notificationsHref?: string;
  settingsHref?: string;
  user?: {
    name: string;
    avatarSrc?: string | null;
  };
};

export function Navbar({
  className,
  containerClassName,
  logo,
  items,
  activeHref,
  activeStyle = "default",
  language,
  notificationsHref,
  settingsHref,
  user,
}: NavbarProps) {
  return (
    <>
    {/* Spacer — holds the 80px the fixed navbar occupies (68px inner + 12px pt-3 padding) */}
    <div className="h-20 shrink-0" aria-hidden />
    <header className={cn("fixed top-0 left-0 right-0 z-50 bg-white", className)}>
      <div
        className={cn(
          "mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4",
          containerClassName,
        )}
      >
        <div className="flex shrink-0 items-center">
          {logo ? (
            <Link href={logo.href ?? "/"} className="shrink-0">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width ?? 122}
                height={logo.height ?? 44}
                priority
              />
            </Link>
          ) : (
            <Link href="/" className="text-sm font-semibold tracking-tight">
              MOFA Translation
            </Link>
          )}
        </div>

        <div className="flex flex-1 justify-center px-6">
          <nav className="flex items-center gap-2">
            {items.map((item) => {
              const isActive = activeHref
                ? item.href === activeHref
                : item.href === "/";
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-700 transition-colors",
                    isActive
                      ? activeStyle === "brand"
                        ? "bg-[color:var(--mofa-btn-outline-selected)] text-[#252b37]"
                        : "bg-[color:var(--mofa-btn-outline-selected)] text-[#252b37]"
                      : "hover:bg-[color:var(--mofa-btn-outline-hover)]",
                  )}
                >
                  {Icon ? <Icon size={20} aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-0">
          {language ? (
            <Link
              href={language.href}
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-1.5 text-sm font-semibold text-slate-700 hover:bg-[color:var(--mofa-btn-outline-hover)]"
            >
              {language.icon ? (
                <language.icon size={20} aria-hidden="true" />
              ) : null}
              {language.label}
            </Link>
          ) : null}

          {notificationsHref ? (
            <Link
              href={notificationsHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-[color:var(--mofa-btn-outline-hover)]"
              aria-label="Notifications"
            >
              <Bell size={20} aria-hidden="true" />
            </Link>
          ) : null}

          {settingsHref ? (
            <Link
              href={settingsHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-[color:var(--mofa-btn-outline-hover)]"
              aria-label="Settings"
            >
              <Settings size={20} aria-hidden="true" />
            </Link>
          ) : null}

          {user ? (
            <Avatar
              src={user.avatarSrc ?? null}
              alt={user.name}
              fallback={user.name
                .split(" ")
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase() ?? "")
                .join("")}
            />
          ) : null}
        </div>
      </div>
    </header>
    </>
  );
}

