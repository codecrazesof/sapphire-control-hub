import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, Check, Inbox, ShieldCheck, X } from "lucide-react";
import "@/styles/marketplace-home.css";
import {
  listApplications,
  listNotifications,
  markAllRead,
  setStatus,
  subscribe,
  type Application,
  type AppStatus,
} from "@/lib/applications/store";

export const Route = createFileRoute("/admin/applications")({
  head: () => ({
    meta: [
      { title: "Boss Panel — Application Approvals | Software Vala" },
      {
        name: "description",
        content: "Review, approve or reject vendor, author, reseller, affiliate, franchise, influencer and employee applications.",
      },
      { property: "og:title", content: "Boss Panel — Application Approvals" },
      { property: "og:description", content: "Live approval queue and notifications for every role application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BossPanel,
});

const STATUS_STYLES: Record<AppStatus, string> = {
  pending: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  approved: "border-emerald-300/40 bg-emerald-400/12 text-emerald-200",
  rejected: "border-rose-300/40 bg-rose-400/12 text-rose-200",
};

function BossPanel() {
  const [apps, setApps] = useState<Application[]>([]);
  const [notifs, setNotifs] = useState(() => [] as ReturnType<typeof listNotifications>);
  const [tab, setTab] = useState<AppStatus | "all">("pending");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setApps(listApplications());
      setNotifs(listNotifications());
    };
    sync();
    return subscribe(sync);
  }, []);

  const filtered = useMemo(() => (tab === "all" ? apps : apps.filter((a) => a.status === tab)), [apps, tab]);
  const counts = useMemo(
    () => ({
      all: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      approved: apps.filter((a) => a.status === "approved").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    }),
    [apps],
  );
  const unread = notifs.filter((n) => !n.read).length;

  const act = (id: string, status: AppStatus) => {
    setStatus(id, status);
    toast.success(`Application ${status}.`);
  };

  return (
    <div className="mpc-home min-h-screen px-4 pb-20 pt-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/80">
              <ShieldCheck className="h-3 w-3 text-emerald-300" /> Boss panel
            </span>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Application Approvals</h1>
            <p className="mt-1.5 text-[13.5px] text-white/60">
              Every submitted role application lands here for approval, with a live notification feed.
            </p>
          </div>
          <Link to="/apply" className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-[13px] font-bold">
            Apply pages
          </Link>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.65fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              {(["pending", "approved", "rejected", "all"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`rounded-full border px-4 py-2 text-[12px] font-bold capitalize ${
                    tab === k
                      ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                      : "border-white/15 bg-white/[0.05] text-white/65"
                  }`}
                >
                  {k} ({counts[k]})
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-10 text-center">
                  <Inbox className="mx-auto h-9 w-9 text-white/35" />
                  <p className="mt-3 text-[13px] text-white/55">No {tab === "all" ? "" : tab} applications yet.</p>
                </div>
              )}

              {filtered.map((a) => (
                <article key={a.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-xl">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[15px] font-bold">{a.applicant}</h2>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase ${STATUS_STYLES[a.status]}`}>
                          {a.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-white/55">
                        {a.roleLabel.replace("Become ", "")} · {a.email || "no email"} · {a.phone || "no phone"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        Submitted {new Date(a.submittedAt).toLocaleString()} · Fee {a.fee}{" "}
                        {a.paid ? "(paid)" : "(unpaid)"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setOpen(open === a.id ? null : a.id)}
                        className="rounded-full border border-white/18 bg-white/[0.06] px-3.5 py-1.5 text-[11.5px] font-bold"
                      >
                        {open === a.id ? "Hide" : "View"}
                      </button>
                      {a.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => act(a.id, "approved")}
                          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 px-3.5 py-1.5 text-[11.5px] font-bold"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {a.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => act(a.id, "rejected")}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-300/40 bg-rose-400/12 px-3.5 py-1.5 text-[11.5px] font-bold text-rose-200"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {open === a.id && (
                    <dl className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                      {Object.entries(a.values)
                        .filter(([, v]) => String(v).trim() !== "")
                        .map(([k, v]) => (
                          <div key={k} className="rounded-xl bg-black/20 px-3 py-2">
                            <dt className="text-[10.5px] uppercase tracking-wider text-white/40">{k}</dt>
                            <dd className="text-[12.5px] text-white/80">{v}</dd>
                          </div>
                        ))}
                    </dl>
                  )}
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[14px] font-bold">
                <Bell className="h-4 w-4 text-amber-300" /> Notifications
                {unread > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold">{unread}</span>
                )}
              </h2>
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/70"
              >
                Mark read
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {notifs.length === 0 && <p className="p-3 text-[12.5px] text-white/45">No notifications yet.</p>}
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border px-3 py-2 ${
                    n.read ? "border-white/8 bg-white/[0.03]" : "border-cyan-300/25 bg-cyan-400/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        n.kind === "approval" ? "bg-emerald-300" : n.kind === "rejection" ? "bg-rose-300" : "bg-amber-300"
                      }`}
                    />
                    <span className="text-[12.5px] font-semibold">{n.title}</span>
                  </div>
                  <p className="mt-0.5 pl-3.5 text-[11.5px] text-white/55">{n.body}</p>
                  <p className="mt-0.5 pl-3.5 text-[10.5px] text-white/35">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
