import Link from "next/link";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(246,249,253,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Logo size={26} />
            <span className="label" style={{ color: "var(--sky)" }}>Admin</span>
            <Link href="/admin" className="nav-link" style={{ fontSize: 14 }}>
              Module
            </Link>
            <Link href="/admin/tickets" className="nav-link" style={{ fontSize: 14 }}>
              Fragen
            </Link>
            <Link href="/admin/blog" className="nav-link" style={{ fontSize: 14 }}>
              Blog
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/dashboard" className="nav-link" style={{ fontSize: 14 }}>
              ← Zum Kursbereich
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px 80px" }}>{children}</div>
    </div>
  );
}
