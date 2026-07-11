import { NextRequest } from "next/server";
import { getUserFromRequest, TokenPayload } from "./auth";
import { hasAnyTag } from "./tags";

/**
 * Get admin user from request.
 * Tries JWT first (for admin users with admin role + platform tags),
 * falls back to legacy admin_auth cookie.
 */
export function getAdminFromRequest(
  request: NextRequest
): { type: "jwt"; payload: TokenPayload } | { type: "legacy"; username: string } | null {
  // Try JWT first - admin user with admin role
  const jwtPayload = getUserFromRequest(request);
  if (jwtPayload && jwtPayload.role === "admin") {
    return { type: "jwt", payload: jwtPayload };
  }

  // Fall back to legacy admin_auth cookie
  const adminAuth = request.cookies.get("admin_auth")?.value;
  if (!adminAuth) return null;

  try {
    const [username, password] = Buffer.from(adminAuth, "base64")
      .toString()
      .split(":");
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return { type: "legacy", username };
    }
  } catch {
    // invalid cookie
  }

  return null;
}

/**
 * Check if admin has the required platform tags.
 * Legacy admin (cookie-based) always passes (acts as super_admin).
 * JWT admin needs matching tags unless they have super_admin.
 */
export function requireAdminTag(
  admin: ReturnType<typeof getAdminFromRequest>,
  requiredTags: string[]
): boolean {
  if (!admin) return false;

  // Legacy admin = super_admin, bypass all tag checks
  if (admin.type === "legacy") return true;

  // JWT admin: check for super_admin or matching tags
  const userTags = admin.payload.tags || [];
  if (userTags.includes("super_admin")) return true;

  return hasAnyTag(userTags, requiredTags);
}
