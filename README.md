# Borrow Book Buddy

Create a React web app for borrowing library books. It's name is "Borrow Book". 
The app should have:
- login and register page for corresponding actions
- form for borrowing a book
- page to display all users
- by clicking on a user, we should be able to see a list of all the books that user borrowed

The purpose of the app is to allow users to choose a book to borrow and log that borrow as well as to display all users so that we can see which books those users borrowed.

Pages:
- Login and Register page
- Users (all users and, once clicked on them, list of books they borrowed)
- Borrow book (form for borrowing a book)
There should be navigation between pages (you can use react router)
User auth, data from the form and books that users borrowed as well as all the users should be stored in Supabase database.

The app has to have modern and clean UI.


SUPABASE INSTALLATION AND CONNECTION
1. Install package
Run this command to install the required dependencies.
Code:
File: Code
```
npm install @supabase/supabase-js
```

2. Add files
Add env variables, create a Supabase client, and use it in your app to query data.
Code:
File: .env
```
VITE_SUPABASE_URL=https://kfdaqcnanzcqzrtgubux.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wIu-GGr46bRx8YtvMwE_KA_U7FvnzdR
```

File: utils/supabase.ts
```
1import { createClient } from '@supabase/supabase-js';
2
3const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
4const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
5
6export const supabase = createClient(supabaseUrl, supabaseKey);
```

File: App.tsx
```
1import { useState, useEffect } from 'react'
2import { supabase } from './utils/supabase'
3
4export default function App() {
5  const [todos, setTodos] = useState([])
6
7  useEffect(() => {
8    async function getTodos() {
9      const { data: todos } = await supabase.from('todos').select()
10
11      if (todos) {
12        setTodos(todos)
13      }
14    }
15
16    getTodos()
17  }, [])
18
19  return (
20    


21      {todos.map((todo) => (
22        

{todo.name}


23      ))}
24    


25  )
26}
```

3. Install Agent Skills (optional)
Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.
Code:
File: Code
```
npx skills add supabase/agent-skills
```

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3dd4909-b18b-4963-85fa-56ef247b4f0f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
