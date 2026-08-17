import { isRoleKey, type RoleKey } from "@/lib/roles";
import { readSession, clearSession, supabase } from "@/lib/nexus-auth";

/**
 * Auth bridge for the offline demo directory. Route guards call
 * `getAuthenticatedRole()`: it returns the active role, or null when nobody is
 * signed in (guards then redirect to /login).
 */

export const EXISTING_LOGIN_URL = "/login";

const OVERRIDE_KEY = "sv_active_role";

function readOverride(): RoleKey | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(OVERRIDE_KEY);
  return isRoleKey(stored) ? stored : null;
}

export async function getAuthenticatedRole(): Promise<RoleKey | null> {
  const user = readSession();
  if (!user) return null;
  return readOverride() ?? user.role ?? "customer";
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") window.localStorage.removeItem(OVERRIDE_KEY);
  clearSession();
  await supabase.auth.signOut();
}

/** Persist the role the user chose on the login page (used post-signin). */
export function devSetRole(role: RoleKey) {
  if (typeof window !== "undefined") window.localStorage.setItem(OVERRIDE_KEY, role);
}
