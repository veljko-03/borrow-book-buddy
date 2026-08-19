import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase, type Book } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/borrow")({
  head: () => ({
    meta: [
      { title: "Borrow a book — Borrow Book" },
      {
        name: "description",
        content:
          "Log a new library borrow: pick a book from the catalog, set the borrow and due dates, and add a note.",
      },
      { property: "og:title", content: "Borrow a book — Borrow Book" },
      {
        property: "og:description",
        content: "Pick a book, set your dates, and log the borrow in seconds.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BorrowPage />
    </RequireAuth>
  ),
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function inTwoWeeks() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function BorrowPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [bookId, setBookId] = useState("");
  const [borrowedAt, setBorrowedAt] = useState(today());
  const [dueDate, setDueDate] = useState(inTwoWeeks());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("title", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (!bookId) {
      toast.error("Choose a book first.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("borrows").insert({
      user_id: user.id,
      book_id: bookId,
      borrowed_at: borrowedAt,
      due_date: dueDate || null,
      notes: notes.trim() || null,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Borrow logged!");
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["member", user.id] });
    navigate({ to: "/users/$userId", params: { userId: user.id } });
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Borrow a book</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a title from the catalog and we'll add it to your shelf.
        </p>
      </header>

      <Card className="shadow-soft border-border/70">
        <CardHeader>
          <CardTitle>Borrow details</CardTitle>
          <CardDescription>All borrows are visible to other library members.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="book">Book</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger id="book">
                  <SelectValue placeholder={isLoading ? "Loading catalog…" : "Select a book"} />
                </SelectTrigger>
                <SelectContent>
                  {(books ?? []).map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="borrowed-at">Borrowed on</Label>
                <Input
                  id="borrowed-at"
                  type="date"
                  required
                  value={borrowedAt}
                  onChange={(e) => setBorrowedAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Return by</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Picked up from the front desk…"
              />
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Logging borrow…" : "Log borrow"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
