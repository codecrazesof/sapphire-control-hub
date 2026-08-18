import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BadgeCheck, BarChart3, Bell, Boxes, Coins, Crown, Gauge, LayoutDashboard,
  LifeBuoy, LogOut, Megaphone, Package, ShieldCheck, Sparkles, Users, Wallet,
} from "lucide-react";
import { getAuthenticatedRole, signOut } from "@/lib/auth-bridge";
import { isRoleKey, roleLabel, type RoleKey } from "@/lib/roles";
import { readSession, type DemoUser } from "@/lib/nexus-auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { listApplications, subscribe, type Application } from "@/lib/applications/store";

export const Route = createFileRoute("/dashboard/$role")({
  ssr: false,
  head: ({ params }) => {
    const label = isRoleKey(params.role) ? roleLabel(params.role) : "Workspace";
    return {
      meta: [
        { title: `${label} Dashboard · Software Vala Nexus OS` },
        {
          name: "description",
          content: `Signed-in ${label.toLowerCase()} dashboard for Software Vala — earnings, performance and account controls in one command surface.`,
        },
        { property: "og:title", content: `${label} Dashboard · Software Vala` },
        { property: "og:description", content: `Signed-in ${label.toLowerCase()} workspace for Software Vala Nexus OS.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: DashboardPage,
});

type Stat = { label: string; value: string; delta: string; icon: typeof Coins };
type RoleView = {
  accent: string;
  tagline: string;
  stats: Stat[];
  panels: { title: string; icon: typeof Boxes; rows: [string, string][] }[];
  actions: string[];
};

const BASE_ACTIONS = ["Overview", "Earnings", "Support", "Settings"];

const VIEWS: Record<string, RoleView> = {
  reseller: {
    accent: "from-emerald-400 to-teal-500",
    tagline: "Resell 12,000+ ready solutions and keep your margin.",
    stats: [
      { label: "Margin earned", value: "₹1,84,500", delta: "+18.2% MoM", icon: Coins },
      { label: "Active clients", value: "126", delta: "+9 this month", icon: Users },
      { label: "Open quotations", value: "14", delta: "6 awaiting reply", icon: Package },
      { label: "Catalog access", value: "12,480", delta: "Full catalog", icon: Boxes },
    ],
    panels: [
      { title: "Recent orders", icon: Package, rows: [["ERP Suite · Nova Textiles", "₹64,000"], ["POS Pro · Café Loop", "₹18,900"], ["HRM Cloud · Bright Labs", "₹41,250"]] },
      { title: "Territory", icon: Gauge, rows: [["Region", "West India"], ["Tier", "Gold reseller"], ["Quarterly target", "72% achieved"]] },
    ],
    actions: ["Overview", "Catalog", "Quotations", "Margin report", "Leads", "Settings"],
  },
  franchise: {
    accent: "from-rose-400 to-pink-600",
    tagline: "Run Software Vala in your exclusive territory.",
    stats: [
      { label: "Territory revenue", value: "₹9,42,000", delta: "+24% QoQ", icon: Wallet },
      { label: "Leads assigned", value: "318", delta: "42 hot", icon: Megaphone },
      { label: "Team members", value: "11", delta: "2 in training", icon: Users },
      { label: "Revenue share due", value: "₹1,13,040", delta: "Payout on 30th", icon: Coins },
    ],
    panels: [
      { title: "Territory health", icon: Gauge, rows: [["City", "Indore · exclusive"], ["Agreement", "3 year term"], ["Compliance", "All standards met"]] },
      { title: "Training", icon: BadgeCheck, rows: [["Sales certification", "9 / 11 staff"], ["Product bootcamp", "Next: 24th"], ["Support SLA", "98.2% on time"]] },
    ],
    actions: ["Overview", "Territory leads", "Staff", "Revenue", "Training", "Settings"],
  },
  influencer: {
    accent: "from-fuchsia-400 to-purple-600",
    tagline: "Create, collaborate and get paid per deliverable.",
    stats: [
      { label: "Campaign earnings", value: "₹2,36,000", delta: "+31% MoM", icon: Coins },
      { label: "Active campaigns", value: "5", delta: "2 briefs pending", icon: Megaphone },
      { label: "Total reach", value: "1.4M", delta: "+62k followers", icon: Users },
      { label: "Avg engagement", value: "6.8%", delta: "Above benchmark", icon: BarChart3 },
    ],
    panels: [
      { title: "Live campaigns", icon: Sparkles, rows: [["Festive ERP launch", "Reel · due 21st"], ["POS Pro review", "YouTube · in edit"], ["Lifetime licence push", "Story set · live"]] },
      { title: "Deliverables", icon: BadgeCheck, rows: [["Submitted", "18"], ["Approved", "16"], ["Usage rights", "30 days"]] },
    ],
    actions: ["Overview", "Campaigns", "Briefs", "Deliverables", "Payouts", "Settings"],
  },
  affiliate: {
    accent: "from-amber-300 to-orange-600",
    tagline: "Share your link, track clicks, get paid monthly.",
    stats: [
      { label: "Commission earned", value: "₹78,400", delta: "+12% MoM", icon: Coins },
      { label: "Clicks (30d)", value: "24,910", delta: "+3,120", icon: BarChart3 },
      { label: "Conversions", value: "412", delta: "1.65% CR", icon: BadgeCheck },
      { label: "Pending payout", value: "₹12,900", delta: "Releases on 1st", icon: Wallet },
    ],
    panels: [
      { title: "Top links", icon: Megaphone, rows: [["/erp-suite?ref=you", "8,420 clicks"], ["/pos-pro?ref=you", "5,102 clicks"], ["/lifetime-deal?ref=you", "3,884 clicks"]] },
      { title: "Programme", icon: ShieldCheck, rows: [["Commission tier", "10–25%"], ["Cookie window", "60 days"], ["Payout threshold", "₹2,000"]] },
    ],
    actions: ["Overview", "Links", "Clicks", "Conversions", "Payouts", "Settings"],
  },
  author: {
    accent: "from-violet-400 to-indigo-600",
    tagline: "Publish products and earn lifetime royalties.",
    stats: [
      { label: "Royalties", value: "₹3,12,750", delta: "70/30 split", icon: Coins },
      { label: "Published products", value: "17", delta: "3 in review", icon: Boxes },
      { label: "Total sales", value: "1,284", delta: "+96 this month", icon: Package },
      { label: "Buyer rating", value: "4.8 / 5", delta: "412 reviews", icon: BadgeCheck },
    ],
    panels: [
      { title: "Product performance", icon: Boxes, rows: [["School ERP", "412 sales"], ["Clinic Manager", "296 sales"], ["Inventory Cloud", "188 sales"]] },
      { title: "Buyer support", icon: LifeBuoy, rows: [["Open tickets", "6"], ["Avg first reply", "3h 12m"], ["Support commitment", "12 months"]] },
    ],
    actions: ["Overview", "Products", "Versions", "Royalties", "Buyer tickets", "Settings"],
  },
  vendor: {
    accent: "from-cyan-400 to-blue-600",
    tagline: "Sell your software catalog to a global buyer base.",
    stats: [
      { label: "Store revenue", value: "₹6,08,200", delta: "+15% MoM", icon: Wallet },
      { label: "Live listings", value: "38", delta: "4 drafts", icon: Boxes },
      { label: "Orders (30d)", value: "241", delta: "12 dispatch due", icon: Package },
      { label: "Payout balance", value: "₹92,400", delta: "Weekly cycle", icon: Coins },
    ],
    panels: [
      { title: "Orders", icon: Package, rows: [["Awaiting dispatch", "12"], ["Delivered", "218"], ["Refund requests", "3"]] },
      { title: "Store health", icon: ShieldCheck, rows: [["Commission", "15%"], ["Dispatch SLA", "7 days"], ["Buyer response", "98% < 24h"]] },
    ],
    actions: ["Overview", "Listings", "Orders", "Payouts", "Support inbox", "Settings"],
  },
  employee: {
    accent: "from-sky-400 to-cyan-600",
    tagline: "Your tasks, attendance and payroll in one place.",
    stats: [
      { label: "Open tasks", value: "9", delta: "3 due today", icon: LayoutDashboard },
      { label: "Attendance", value: "96%", delta: "This quarter", icon: BadgeCheck },
      { label: "Leave balance", value: "8 days", delta: "2 pending approval", icon: Users },
      { label: "Next payroll", value: "30 Aug", delta: "Slip available", icon: Wallet },
    ],
    panels: [
      { title: "Today", icon: LayoutDashboard, rows: [["Stand-up", "10:00"], ["Release checklist", "Due 6 PM"], ["Support rota", "Afternoon"]] },
      { title: "Documents", icon: ShieldCheck, rows: [["Offer letter", "Signed"], ["ID verification", "Verified"], ["NDA", "Signed"]] },
    ],
    actions: ["Overview", "Tasks", "Attendance", "Payroll", "Documents", "Settings"],
  },
};

const FALLBACK: RoleView = {
  accent: "from-slate-300 to-slate-500",
  tagline: "Your Software Vala account at a glance.",
  stats: [
    { label: "Orders", value: "4", delta: "1 active", icon: Package },
    { label: "Licenses", value: "3", delta: "All valid", icon: ShieldCheck },
    { label: "Support tickets", value: "0", delta: "Nothing open", icon: LifeBuoy },
    { label: "Wallet", value: "₹0", delta: "Add credit", icon: Wallet },
  ],
  panels: [
    { title: "Purchases", icon: Boxes, rows: [["POS Pro", "Lifetime"], ["Invoice Cloud", "Annual"], ["Support pack", "Active"]] },
    { title: "Account", icon: BadgeCheck, rows: [["Plan", "Standard"], ["Verified", "Email"], ["Member since", "2026"]] },
  ],
  actions: BASE_ACTIONS,
};

function DashboardPage() {
  const { role } = Route.useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleKey | null>(null);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [tab, setTab] = useState("Overview");
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    const sync = () => setApps(listApplications());
    sync();
    return subscribe(sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resolved = await getAuthenticatedRole();
      if (cancelled) return;
      if (!resolved) {
        navigate({ to: "/login", search: { next: `/dashboard/${role}` }, replace: true });
        return;
      }
      setActiveRole(resolved);
      setUser(readSession());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, role]);

  useEffect(() => setTab("Overview"), [role]);

  if (!ready) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[oklch(0.10_0.02_265)] text-white/70">
        <p className="text-sm">Opening your workspace…</p>
      </main>
    );
  }

  const key = isRoleKey(role) ? role : (activeRole ?? "customer");
  const view = VIEWS[key] ?? FALLBACK;
  const label = roleLabel(key as RoleKey);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[oklch(0.10_0.02_265)] text-[oklch(0.96_0.01_260)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 15% 0%, oklch(0.36 0.16 330 / 0.45), transparent 60%)," +
            "radial-gradient(60% 55% at 95% 10%, oklch(0.34 0.14 70 / 0.35), transparent 62%)," +
            "radial-gradient(70% 70% at 60% 100%, oklch(0.30 0.14 200 / 0.35), transparent 62%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo variant="round" size={40} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Software Vala · Nexus OS</p>
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{label} Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[11px] text-emerald-200 ring-1 ring-emerald-300/25 sm:inline-flex">
              <ShieldCheck className="size-3.5" /> Verified session
            </span>
            <button className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition hover:bg-white/[0.12]">
              <Bell className="size-4" />
            </button>
            <Link
              to="/"
              className="rounded-xl bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.12]"
            >
              Marketplace
            </Link>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/login", search: {}, replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-white shadow-[0_16px_36px_-18px_oklch(0.6_0.22_320/0.9)] transition hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, oklch(0.58 0.21 335), oklch(0.66 0.17 55))" }}
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </header>

        {/* Identity strip */}
        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${view.accent} text-[15px] font-bold text-black/80`}>
                {(user?.full_name ?? label).charAt(0)}
              </span>
              <div>
                <p className="text-[15px] font-semibold">Welcome back, {user?.full_name ?? label}</p>
                <p className="text-[12px] text-white/55">{view.tagline}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {view.stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45">
                    <s.icon className="size-3.5" /> {s.label}
                  </div>
                  <p className="mt-1.5 text-xl font-semibold tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-emerald-300/80">{s.delta}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-xl">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-white/45">Account</h2>
            <dl className="mt-3 space-y-2 text-[13px]">
              {[
                ["Name", user?.full_name ?? "—"],
                ["Email", user?.email ?? "—"],
                ["Username", user?.username ?? "—"],
                ["Active role", label],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-white/50">{k}</dt>
                  <dd className="truncate text-white/90">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-300/10 px-3 py-2 text-[11px] text-amber-100 ring-1 ring-amber-200/20">
              <Crown className="size-3.5" /> Admin & staff panels are managed from the control panel.
            </div>
          </aside>
        </section>

        <ApplicationStatus apps={apps} role={key} email={user?.email} />

        {/* Tabs */}
        <nav className="mt-4 flex flex-wrap gap-2">
          {view.actions.map((a) => (
            <button
              key={a}
              onClick={() => setTab(a)}
              className={[
                "rounded-xl px-3.5 py-2 text-[12px] font-medium ring-1 transition",
                tab === a
                  ? "bg-white/[0.14] text-white ring-white/25"
                  : "bg-white/[0.04] text-white/65 ring-white/10 hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {a}
            </button>
          ))}
        </nav>

        {/* Panels */}
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          {view.panels.map((p) => (
            <div key={p.title} className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                <p.icon className="size-4 text-white/60" /> {p.title}
              </h2>
              <ul className="mt-3 divide-y divide-white/[0.07] text-[13px]">
                {p.rows.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="truncate text-white/70">{k}</span>
                    <span className="shrink-0 font-medium text-white/95">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Other workspaces */}
        <section className="mt-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-xl">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-white/45">Switch workspace</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["reseller", "franchise", "influencer", "affiliate", "author", "vendor", "employee"] as const).map((r) => (
              <Link
                key={r}
                to="/dashboard/$role"
                params={{ role: r }}
                className={[
                  "rounded-xl px-3.5 py-2 text-[12px] font-medium ring-1 transition hover:-translate-y-px",
                  r === key ? "bg-white/[0.14] text-white ring-white/25" : "bg-white/[0.04] text-white/65 ring-white/10 hover:bg-white/[0.08]",
                ].join(" ")}
              >
                {roleLabel(r)}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/40">
            Only user-side workspaces are opened from login. Boss, admin and staff panels stay inside the control panel.
          </p>
        </section>
      </div>
    </main>
  );
}
