"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import AppIcon, { type AppIconName } from "./AppIcon";
import { createClient } from "@/lib/supabase/client";

type Props = {
  name: string;
  email: string;
  isAdmin: boolean;
  hasAccess: boolean;
  progressPercent: number;
  children: React.ReactNode;
};

export default function AppShell({ name, email, isAdmin, hasAccess, progressPercent, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const initial = (name || email).charAt(0).toUpperCase();

  const navItem = (href: string, label: string, icon: AppIconName, exact?: boolean, badge?: string) => (
    <Link key={href} href={href} className={`app-nav-item${isActive(href, exact) ? " is-active" : ""}`}>
      <AppIcon name={icon} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span className="app-nav-badge">{badge}</span>}
    </Link>
  );

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <button className="app-icon-btn" onClick={() => setOpenForPath(pathname)} aria-label="Menü öffnen">
          <AppIcon name="menu" />
        </button>
        <Logo size={24} />
        <span className="app-avatar" style={{ width: 34, height: 34, fontSize: 14 }}>{initial}</span>
      </header>

      {open && <div className="app-backdrop" onClick={() => setOpenForPath(null)} />}

      <aside className={`app-sidebar${open ? " is-open" : ""}`} aria-label="Hauptnavigation">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 10px 18px" }}>
          <Link href="/" aria-label="Zur Startseite">
            <Logo />
          </Link>
          <button className="app-icon-btn app-close-btn" onClick={() => setOpenForPath(null)} aria-label="Menü schließen">
            <AppIcon name="close" />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="app-nav-heading">Lernen</span>
          {navItem("/dashboard", "Dashboard", "dashboard", true)}
          {navItem("/dashboard/course", "Kurs", "course", false, hasAccess && progressPercent > 0 ? `${progressPercent}%` : undefined)}
          <span className="app-nav-heading" style={{ marginTop: 14 }}>Konto</span>
          {navItem("/dashboard/payments", "Zahlungen & Rechnungen", "payment")}
          {isAdmin && navItem("/admin", "Admin-Bereich", "admin")}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="app-user-card">
            <span className="app-avatar">{initial}</span>
            <div style={{ minWidth: 0 }}>
              <p className="app-user-name">{name || email}</p>
              <p className="app-user-status" style={{ color: hasAccess ? "#0f9f6e" : "var(--text-faint)" }}>
                {hasAccess ? "Kurs freigeschaltet" : "Noch nicht freigeschaltet"}
              </p>
            </div>
          </div>
          {navItem("/dashboard/settings", "Einstellungen", "settings")}
          <button className="app-nav-item" onClick={handleSignOut}>
            <AppIcon name="logout" />
            <span style={{ flex: 1, textAlign: "left" }}>Abmelden</span>
          </button>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  );
}
