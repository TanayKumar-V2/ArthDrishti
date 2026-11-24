"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

type PortalRole = "customer" | "loan_officer";
type GateState = "checking" | "allowed" | "redirecting";

export function RoleAccessGate({ expectedRole, children }: { expectedRole: PortalRole; children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let mounted = true;
    authApi.getCurrentUser().then((user) => {
      if (!mounted) return;
      if (user.role === expectedRole) {
        setState("allowed");
        return;
      }

      setState("redirecting");
      router.replace(user.role === "loan_officer" ? "/officer" : user.role === "admin" ? "/admin" : "/dashboard");
    }).catch(() => {
      if (!mounted) return;
      setState("redirecting");
      router.replace("/login");
    });
    return () => { mounted = false; };
  }, [expectedRole, router]);

  if (state !== "allowed") {
    return <main className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-foreground-secondary" aria-live="polite">
      {state === "checking" ? "Verifying your account..." : "Taking you to your workspace..."}
    </main>;
  }

  return children;
}
