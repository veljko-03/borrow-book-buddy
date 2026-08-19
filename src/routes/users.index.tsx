import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";

import { supabase, type Profile } from "@/lib/supabase";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/users/")({
  head: () => ({
    meta: [
      { title: "Members — Borrow Book" },
      {
        name: "description",
        content:
          "Browse every Borrow Book member and open a member to see the full list of library books they borrowed.",
      },
      { property: "og:title", content: "Members — Borrow Book" },
      {
        property: "og:description",
        content: "Browse all library members and the books they borrowed.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <UsersPage />
    </RequireAuth>
  ),
});

type MemberRow = Profile & { borrowCount: number };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UsersPage() {
  const { data, isLoading, error } = useQuery<MemberRow[]>({
    queryKey: ["members"],
    queryFn: async () => {
      const [{ data: profiles, error: profilesError }, { data: borrows, error: borrowsError }] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: true }),
          supabase.from("borrows").select("user_id"),
        ]);

      if (profilesError) throw profilesError;
      if (borrowsError) throw borrowsError;

      const counts = new Map<string, number>();
      for (const row of borrows ?? []) {
        counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
      }

      return (profiles ?? []).map((profile) => ({
        ...(profile as Profile),
        borrowCount: counts.get((profile as Profile).id) ?? 0,
      }));
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Members</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a member to see every book they have borrowed.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <Card className="border-destructive/30">
          <CardContent className="py-6 text-sm text-destructive">
            Could not load members: {(error as Error).message}
          </CardContent>
        </Card>
      ) : !data?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No members yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((member) => {
            const name = member.full_name?.trim() || member.email || "Unnamed member";
            return (
              <li key={member.id}>
                <Link
                  to="/users/$userId"
                  params={{ userId: member.id }}
                  className="shadow-soft group flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span className="bg-warm-gradient flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground">
                    {initials(name) || "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </span>
                  <Badge variant="secondary">{member.borrowCount} books</Badge>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
