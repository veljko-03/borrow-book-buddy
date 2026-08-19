import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold">Members only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or register to view this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
