# Borrow Book

Borrow Book is a small library-lending web app. Members sign in, browse the book
catalog, log a borrow, and see who in the community currently has which book.

## Features

- **Login & register** — email/password accounts; a member profile is created
  automatically on signup.
- **Borrow a book** — a form at `/borrow` to pick a title from the catalog and
  record the borrow date, due date, and optional notes.
- **Members directory** — `/users` lists every registered member.
- **Member shelf** — clicking a member (`/users/:id`) shows all the books that
  person has borrowed.
- **Backed by a real database** — profiles, books, and borrows are stored in
  Supabase with row-level security so members can only modify their own borrows.

## How to setup

You need [Node.js](https://nodejs.org) and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

1. **Clone the repository and enter it**

   ```sh
   git clone <this-repository-url>
   cd <repository-name>
   ```

2. **Install all dependencies**

   ```sh
   npm i
   ```

3. **Configure environment variables** — create a `.env` file in the project
   root with your Supabase project credentials:

   ```sh
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   ```

4. **Set up the database** — open the SQL editor in your Supabase project and
   run the contents of `supabase-setup.sql` from the project root. It creates the
   `profiles`, `books` (seeded with 10 titles), and `borrows` tables together
   with their grants, policies, and the signup trigger.

5. **Start the dev server**

   ```sh
   npm run dev
   ```

   The app runs at `http://localhost:8080`. Register an account and you can start
   borrowing books.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase
