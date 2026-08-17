/**
 * Offline demo authentication for the Nexus OS login page.
 *
 * This project has no backend attached, so the login screen is backed by a
 * local demo directory. The exported API intentionally mirrors the shapes the
 * login page expects (a `supabase.auth`-like client, a `lovable` OAuth helper
 * and the alternative sign-in "server functions") so the ported UI works
 * unchanged.
 *
 * Demo accounts — password: demo1234
 *   reseller@softwarevala.com   franchise@softwarevala.com
 *   influencer@softwarevala.com affiliate@softwarevala.com
 *   author@softwarevala.com     vendor@softwarevala.com
 *   employee@softwarevala.com   customer@softwarevala.com
 */
import { ROLE_KEYS, isRoleKey, type RoleKey } from "@/lib/roles";

export const DEMO_PASSWORD = "demo1234";
const SESSION_KEY = "sv_demo_session";
const QR_KEY = "sv_demo_qr";

export type DemoUser = { id: string; email: string; username: string; full_name: string; role: RoleKey };

const titleCase = (s: string) =>
  s.split(/[-_.]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

export function userForHandle(handle: string, role?: RoleKey): DemoUser {
  const raw = handle.trim().toLowerCase();
  const local = raw.includes("@") ? raw.split("@")[0]! : raw;
  const resolved: RoleKey = role ?? (isRoleKey(local) ? local : "customer");
  return {
    id: `demo-${resolved}-${local || "user"}`,
    email: raw.includes("@") ? raw : `${local}@softwarevala.com`,
    username: local || resolved,
    full_name: titleCase(local || resolved),
    role: resolved,
  };
}

export const DEMO_USERS: DemoUser[] = ROLE_KEYS.map((r) => userForHandle(r, r));

/* --------------------------------- session -------------------------------- */

export function readSession(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    return parsed && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(user: DemoUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("sv-auth-change"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("sv-auth-change"));
}

const ok = { error: null as null | { message: string } };
const err = (message: string) => ({ error: { message } });

/* --------------------- supabase-shaped demo auth client -------------------- */

export const supabase = {
  auth: {
    async getSession() {
      const user = readSession();
      return { data: { session: user ? { user } : null }, error: null };
    },
    async getUser() {
      const user = readSession();
      return { data: { user }, error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      if (!email.includes("@")) return err("Enter a valid email address.");
      if (password.length < 4) return err("Password must be at least 4 characters.");
      if (password !== DEMO_PASSWORD) {
        return err(`Demo mode: use the password "${DEMO_PASSWORD}" for any account.`);
      }
      writeSession(userForHandle(email));
      return ok;
    },
    async setSession(tokens: { access_token: string; refresh_token: string }) {
      const handle = tokens.access_token.replace(/^demo:/, "");
      if (!handle) return err("Session could not be established.");
      writeSession(userForHandle(handle));
      return ok;
    },
    async signInWithOtp(payload: { email?: string; phone?: string; options?: unknown }) {
      if (!payload.email && !payload.phone) return err("Enter an email or mobile number.");
      return ok;
    },
    async verifyOtp(payload: { email?: string; phone?: string; token?: string; token_hash?: string; type: string }) {
      if (payload.token_hash) {
        writeSession(userForHandle(payload.token_hash.replace(/^demo:/, "")));
        return ok;
      }
      if (!/^\d{4,8}$/.test(payload.token ?? "")) return err("Enter the numeric code (demo: any 6 digits).");
      writeSession(userForHandle(payload.email ?? payload.phone ?? "customer"));
      return ok;
    },
    async signInWithSSO({ domain }: { domain: string }) {
      if (!domain.includes(".")) return { data: null, ...err("Enter a valid organization domain.") };
      writeSession(userForHandle(`employee@${domain}`, "employee"));
      return { data: { url: null as string | null }, error: null };
    },
    async resetPasswordForEmail(email: string, _options?: unknown) {
      if (!email.includes("@")) return err("Enter a valid email address.");
      return ok;
    },
    async signOut() {
      clearSession();
      return ok;
    },
  },
};

/* ------------------------------ OAuth (demo) ------------------------------ */

export const lovable = {
  auth: {
    async signInWithOAuth(provider: "google" | "apple" | "microsoft", _options?: unknown) {
      writeSession(userForHandle(`${provider}.user@softwarevala.com`, "customer"));
      return { error: null as null | Error, redirected: false };
    },
  },
};

/* ------------------- alternative sign-in methods (demo) ------------------- */

export async function signInWithUsername({ data }: { data: { username: string; password: string } }) {
  if (data.password !== DEMO_PASSWORD) throw new Error(`Demo mode: password is "${DEMO_PASSWORD}".`);
  return { access_token: `demo:${data.username}`, refresh_token: `demo:${data.username}` };
}

export async function signInWithLicenseKey({ data }: { data: { licenseKey: string } }) {
  const key = data.licenseKey.trim().toUpperCase();
  const match = ROLE_KEYS.find((r) => key.includes(r.toUpperCase()));
  if (!key.startsWith("NEXUS-")) {
    throw new Error("Demo license format: NEXUS-<ROLE>-0001 (e.g. NEXUS-RESELLER-0001).");
  }
  const role = (match ?? "customer") as RoleKey;
  return { token_hash: `demo:${role}`, email: `${role}@softwarevala.com` };
}

export async function createQrSession(_input?: unknown) {
  const token = `qr-${Math.random().toString(36).slice(2, 10)}`;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(QR_KEY, JSON.stringify({ token, status: "pending" }));
  }
  return { token };
}

export async function pollQrSession({ data }: { data: { token: string } }): Promise<{ status: "pending" | "approved" | "expired"; token_hash: string | null }> {
  if (typeof window === "undefined") return { status: "pending", token_hash: null };
  try {
    const raw = window.localStorage.getItem(QR_KEY);
    const parsed = raw ? (JSON.parse(raw) as { token: string; status: string; handle?: string }) : null;
    if (parsed && parsed.token === data.token && parsed.status === "approved") {
      return { status: "approved", token_hash: `demo:${parsed.handle ?? "customer"}` };
    }
  } catch {
    /* ignore */
  }
  return { status: "pending", token_hash: null };
}

export async function approveQrSession({ data }: { data: { token: string } }) {
  if (typeof window === "undefined") return { ok: true };
  const user = readSession();
  window.localStorage.setItem(
    QR_KEY,
    JSON.stringify({ token: data.token, status: "approved", handle: user?.email ?? "customer" }),
  );
  return { ok: true };
}
