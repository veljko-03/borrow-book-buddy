import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";

import { supabase, type Borrow, type Profile } from "@/lib/supabase";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/users/$userId")({
  head: () => ({
    meta: [
      { title: "Member shelf — Borrow Book" },
      {
        name: "description",
        content: "See every library book this Borrow Book member has borrowed, with dates and notes.",
      },
      { property: "og:title", content: "Member shelf — Borrow Book" },
      {
        property: "og:description",
        content: "Every library book this member has borrowed.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MemberShelf />
    </RequireAuth>
  ),
});

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MemberShelf() {
  const { userId } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["member", userId],
    queryFn: async () => {
      const [{ data: profile, error: profileError }, { data: borrows, error: borrowsError }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase
            .from("borrows")
            .select("*, books(*)")
            .eq("user_id", userId)
            .order("borrowed_at", { ascending: false }),
        ]);

      if (profileError) throw profileError;
      if (borrowsError) throw borrowsError;

      return {
        profile: profile as Profile | null,
        borrows: (borrows ?? []) as Borrow[],
      };
    },
  });

  const name = data?.profile?.full_name?.trim() || data?.profile?.email || "Member";

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All members
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <Card className="mt-6 border-destructive/30">
          <CardContent className="py-6 text-sm text-destructive">
            Could not load this member: {(error as Error).message}
          </CardContent>
        </Card>
      ) : (
        <>
          <header className="mt-6">
            <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
            <p className="mt-2 text-muted-foreground">
              {data?.borrows.length ?? 0} borrowed{" "}
              {(data?.borrows.length ?? 0) === 1 ? "book" : "books"}
              {data?.profile?.email ? ` · ${data.profile.email}` : ""}
            </p>
          </header>

          {!data?.borrows.length ? (
            <Card className="mt-8">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                This member hasn't borrowed any books yet.
              </CardContent>
            </Card>
          ) : (
            <ul className="mt-8 space-y-3">
              {data.borrows.map((borrow) => (
                <li
                  key={borrow.id}
                  className="shadow-soft rounded-xl border border-border/70 bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {borrow.books?.title ?? "Unknown title"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {borrow.books?.author ?? "Unknown author"}
                      </p>
                    </div>
                    {borrow.books?.genre ? (
                      <Badge variant="secondary">{borrow.books.genre}</Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      Borrowed {formatDate(borrow.borrowed_at)}
                    </span>
                    {borrow.due_date ? <span>Due {formatDate(borrow.due_date)}</span> : null}
                  </div>
                  {borrow.notes ? (
                    <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted-foreground">
                      {borrow.notes}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
