"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/services/auth.service";

/**
 * Client-side defense-in-depth guard for role-restricted pages.
 *
 * Redirects users whose role is not in `allowed` to the production screen
 * (accessible to everyone). The backend remains the real authorization gate.
 *
 * Returns `allowed` (whether the current user may view the page) and
 * `isReady` (auth finished loading) so the page can avoid rendering content
 * — and firing API calls that would 403 — before the check resolves.
 */
export function useRequireRole(allowed: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAllowed = !!user && allowed.includes(user.role);
  // Stable primitive dep so the effect doesn't re-run on every render from a
  // fresh inline `allowed` array literal.
  const allowedKey = allowed.join(",");

  useEffect(() => {
    if (isLoading || !user) return;
    if (!allowed.includes(user.role)) {
      router.replace("/production");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user?.role, allowedKey, router]);

  return { isAllowed, isReady: !isLoading };
}
