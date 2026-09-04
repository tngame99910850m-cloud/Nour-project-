"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, ExternalLink, Store, Code2 } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  title: string;
  variant: "admin" | "developer";
  nav: NavItem[];
  user: { name: string; role: string };
  businessName: string;
  children: React.ReactNode;
}

export function DashboardShell({ title, variant, nav, user, businessName, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const accent = variant === "developer" ? "text-emerald-400" : "text-brand-light";

  const Sidebar = (
    <div className="flex h-full flex-col bg-ink text-white/80">
      <div className="flex items-center gap-2 px-5 py-5">
        {variant === "developer" ? <Code2 className={cn("h-6 w-6", accent)} /> : <Store className={cn("h-6 w-6", accent)} />}
        <div>
          <p className="font-serif text-lg font-semibold text-white">{businessName}</p>
          <p className="text-[11px] uppercase tracking-wider text-white/40">{title}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 scrollbar-thin">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== `/${variant}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        {variant === "admin" ? (
          <Link href="/developer" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white">
            <Code2 className="h-5 w-5" /> Developer Portal
          </Link>
        ) : (
          <Link href="/admin" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white">
            <Store className="h-5 w-5" /> Business Dashboard
          </Link>
        )}
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-5 w-5" /> View Store
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="fixed h-screen w-64">{Sidebar}</div>
      </aside>

      {/* Mobile sidebar */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">{Sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-surface/90 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-black/5 lg:hidden" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            {variant === "developer" ? (
              <span className="badge bg-emerald-100 text-emerald-700">Developer</span>
            ) : (
              <span className="badge bg-brand/10 text-brand">{user.role}</span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted">{user.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              {initials(user.name)}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500" aria-label="Log out" title="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
