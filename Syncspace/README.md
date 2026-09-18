# SyncSpace

SyncSpace is a real-time collaborative workspace for teams: create workspaces,
manage projects and tasks on a Kanban board, chat with your team, and see
everything update live for everyone else looking at it — no page refresh.

This is a genuinely functional full-stack app: a React frontend talks to an
Express + PostgreSQL API, and Socket.IO pushes live updates (new tasks, board
moves, chat messages, presence, notifications) to every connected teammate.

---

## Features

- **Authentication** — register, log in, log out, JWT sessions, hashed
  passwords (bcrypt), protected API routes.
- **Workspaces** — create/edit/delete, member management (add any registered
  user by email), per-workspace projects/tasks/chat/activity.
- **Projects** — create/edit/delete, status (Planning, Active, On Hold,
  Completed), progress derived from task completion.
- **Tasks** — full CRUD, assignment, due dates, priority (Low/Medium/High/
  Critical), status (To Do/In Progress/In Review/Completed), search, filter,
  sort.
- **Kanban board** — drag-and-drop cards between status columns; every move
  is written to the database and broadcast live to the rest of the team.
- **Team chat** — one channel per workspace, persisted message history,
  instant delivery over WebSockets, typing indicator.
- **Online presence** — see who is currently online in a workspace.
- **Activity feed** — workspace and global activity log (created/updated/
  assigned/status-changed events).
- **Notifications** — in-app notifications for task assignment, task
  updates, and workspace invites, delivered live.
- **Dashboard** — aggregate stats across all of a user's workspaces (open
  tasks, tasks due soon, active projects, recent activity).
- **Search & filtering** — tasks by title/status/priority/assignee/project;
  projects by name/status.

---

## Technology stack

**Frontend:** React (Vite), React Router, Axios, Socket.IO client, plain CSS
with a small custom design system (no UI framework).

**Backend:** Node.js, Express, Socket.IO, JWT (`jsonwebtoken`), password
hashing (`bcryptjs`), input validation.

**Database:** PostgreSQL, accessed with the `pg` driver using parameterized
SQL (no ORM) — see `backend/db/schema.sql`.

---

## Architecture overview

```
Browser (React) ──HTTP (Axios)──▶ Express REST API ──▶ PostgreSQL
        │                              │
        └────── Socket.IO (WS) ────────┘
                     │
        Both directions: server emits live events,
        client emits presence/typing signals.
```

- **REST API** handles all data mutations (create/update/delete). Every
  mutating controller writes to PostgreSQL first, then emits a Socket.IO
  event to the relevant room so other connected clients update instantly.
- **Socket.IO rooms**: each workspace has a room (`workspace:<id>`) that
  members join when they open that workspace; each user also has a personal
  room (`user:<id>`) used for notifications.
- **JWT** issued on register/login is used both as a normal `Authorization:
  Bearer` header for REST calls and as the `auth.token` handshake payload for
  the Socket.IO connection, so both channels share one session.

---

## Project structure

```
syncspace/
├── backend/
│   ├── db/
│   │   ├── schema.sql        # full PostgreSQL schema
│   │   └── setup.js          # `npm run db:setup` — applies schema.sql
│   ├── src/
│   │   ├── config/db.js      # PostgreSQL connection pool
│   │   ├── controllers/      # request handlers
│   │   ├── models/           # parameterized SQL queries per entity
│   │   ├── routes/           # Express routers
│   │   ├── middleware/       # auth, workspace-access, error handling
│   │   ├── services/         # activity logging + notifications (emit sockets)
│   │   ├── sockets/          # Socket.IO server, auth, presence, rooms
│   │   ├── utils/            # JWT helpers, validators
│   │   └── app.js            # Express app (routes, middleware)
│   ├── server.js             # HTTP server + Socket.IO bootstrap
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/               # axios client + one module per resource
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Topbar, AppLayout, WorkspaceLayout
│   │   │   ├── ui/             # Avatar, Modal, Badges, Icon, EmptyState…
│   │   │   └── workspace/      # Create/Edit modals for workspace/project/task
│   │   ├── context/            # Auth, Socket, Workspace list, per-workspace room, Notifications
│   │   ├── hooks/               # useDebounce, useOutsideClick
│   │   ├── pages/                # one file per route (see Core pages below)
│   │   ├── utils/format.js
│   │   ├── App.jsx               # route table
│   │   ├── main.jsx
│   │   └── index.css             # design system (tokens, layout, components)
│   ├── index.html
│   ├── package.json
│   └── .env.example
│
└── README.md
```

### Core pages
Landing · Login · Register · Dashboard · Workspace Overview · Projects ·
Project Details · Kanban Board · Team Chat · Members · Notifications ·
Profile · Workspace Settings.

---

## Installation requirements

- **Node.js** 18 or newer
- **PostgreSQL** 13 or newer, running locally or reachable over the network
- npm (comes with Node)

---

## 1. Database setup

Create a database and a user for the app (adjust names/password as you like
— just keep them consistent with your `.env` file):

```bash
psql -U postgres
```
```sql
CREATE DATABASE syncspace;
CREATE USER syncspace_user WITH PASSWORD 'syncspace_password';
GRANT ALL PRIVILEGES ON DATABASE syncspace TO syncspace_user;
```

Then apply the schema. You can do this two ways:

```bash
# Option A: psql directly
psql -U syncspace_user -d syncspace -f backend/db/schema.sql

# Option B: the built-in setup script (after configuring backend/.env, step 2)
cd backend
npm run db:setup
```

---

## 2. Environment configuration

**Backend** — copy the example file and fill in your own values:

```bash
cd backend
cp .env.example .env
```

```
PORT=5000
DATABASE_URL=postgresql://syncspace_user:syncspace_password@localhost:5432/syncspace
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend** — copy its example file too:

```bash
cd frontend
cp .env.example .env
```

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 3. Run the backend

```bash
cd backend
npm install
npm run db:setup   # only needed once, applies the schema
npm run dev        # starts the API + Socket.IO server on :5000
```

You should see `SyncSpace API listening on http://localhost:5000`.
Check it's alive: `curl http://localhost:5000/api/health`.

## 4. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev         # starts Vite on :5173
```

Open **http://localhost:5173**, register an account, and create your first
workspace.

---

## Testing the real-time features

1. Register two different accounts (use two browser windows, or one normal
   + one incognito window, so you have two separate sessions).
2. From account A, create a workspace, then add account B's email as a
   member (Members page → **Add member**).
3. Open the same workspace in account B's window.
4. **Chat:** send a message from A — it appears instantly in B's window.
5. **Kanban:** drag a task to a new column in A — the card moves in B's
   board immediately.
6. **Presence:** the Members page shows both accounts as "Online" while
   both tabs are open; close one tab and the dot turns offline within a
   few seconds.
7. **Notifications:** assign a task to account B from account A — a
   notification badge appears live in B's sidebar without a refresh.

---

## Deployment notes

- Run `npm run build` in `frontend/` to produce a static `dist/` folder you
  can serve from any static host (Netlify, Vercel, S3, nginx, etc.) or from
  the Express server itself.
- Deploy `backend/` to any Node host (Render, Railway, Fly.io, a VPS, etc.)
  with a managed PostgreSQL instance; set the same environment variables
  from `.env.example` in your host's config, and remember to set
  `CLIENT_ORIGIN` to your deployed frontend URL and `VITE_API_URL` /
  `VITE_SOCKET_URL` to your deployed backend URL.
- Socket.IO works over the same HTTP server as the REST API, so most hosts
  need no special WebSocket configuration beyond allowing WebSocket
  upgrades (most do by default).
- Use a strong, random `JWT_SECRET` in production — never reuse the example
  value.

---

## Screenshots

_Add screenshots here once you've run the app locally:_

- `docs/screenshots/dashboard.png`
- `docs/screenshots/kanban-board.png`
- `docs/screenshots/team-chat.png`
- `docs/screenshots/landing.png`

---

## Future improvements

- File attachments on tasks and chat messages
- @mentions in chat with targeted notifications
- Task comments and a per-task activity thread
- Recurring tasks and calendar view
- Workspace-level roles beyond owner/admin/member (custom permissions)
- Email notifications in addition to in-app ones
- Automated test suite (API integration tests + frontend component tests)
- Optimistic UI updates with rollback for slow connections

---

## Troubleshooting

- **"Not authenticated" errors right after logging in:** make sure
  `VITE_API_URL` in `frontend/.env` matches where the backend is actually
  running.
- **Socket doesn't connect / no real-time updates:** check the browser
  console for a Socket.IO auth error, and confirm `CLIENT_ORIGIN` in
  `backend/.env` matches the URL you're loading the frontend from exactly
  (including protocol and port).
- **`relation "users" does not exist`:** the schema hasn't been applied yet
  — run `npm run db:setup` inside `backend/` (or the `psql -f` command from
  step 1).
