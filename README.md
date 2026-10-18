# UnLinked — a LinkedIn-style professional network

A full-stack professional networking app built with the MERN stack (MongoDB, Express, React, Node.js), with real-time messaging and notifications over Socket.IO.

**Live demo:** https://linkedin-clone-p9ax.onrender.com/

## Features

- **Accounts:** sign up, sign in with username or email, change password, light/dark/system theme
- **Profiles:** photo and cover image, headline, about, experience, education, skills, website, an "Open to work" badge, profile-view analytics and mutual connections
- **Feed:**
  - Posts with images
  - Five reactions: Like, Celebrate, Love, Insightful, Funny
  - Comments, which you can delete
  - Editing and deleting your own posts
  - Reposts with your own commentary
  - Saved posts
  - Clickable `#hashtags`, a trending list and hashtag pages
  - Infinite scroll, with "Your network" and "Discover" tabs
- **Network:** connection requests (send, withdraw, accept, ignore), follow/unfollow, and suggestions ranked by mutual connections
- **Messaging:** live 1:1 chat with online presence, typing indicators, read receipts and unread badges
- **Notifications:** pushed live for reactions, comments, reposts, follows, connection requests and job applications, with unread filtering and mark-all-read
- **Jobs:**
  - Post, edit, close and delete jobs
  - Search and filter by workplace, job type and experience level
  - Easy Apply with an optional cover letter and resume link
  - Save jobs, track your applications, and review applicants and move them through stages
- **Search:** people, posts, jobs and hashtags, with instant results in the navbar

## Tech stack

| Layer    | Tools |
| -------- | ----- |
| Frontend | React 19, React Router 7, TanStack Query 5, Tailwind CSS 4, daisyUI 5, Vite 6, Socket.IO client |
| Backend  | Node.js, Express 5, Mongoose 8, Socket.IO, zod, helmet, express-rate-limit, JWT (httpOnly cookie) |
| Services | Cloudinary (image hosting, optional), Mailtrap (email, optional) |
| Testing  | Vitest, Supertest, mongodb-memory-server |

## Project structure

```
backend/
  src/
    app.js              Express app (middleware, routes, error handling)
    server.js           HTTP + Socket.IO entry point
    config/             env, database, Cloudinary, mailer
    middleware/         auth, validation, errors
    models/             Mongoose schemas
    modules/<feature>/  routes, controller and zod validation for each feature
                        (auth, users, posts, connections, notifications, search, jobs, messages)
    sockets/            presence, typing, real-time events
    scripts/seed.js     demo data
  tests/                API tests
frontend/
  src/
    app/router.jsx      lazy-loaded routes
    components/         shared UI (ui/) and layout
    context/            theme + socket providers
    features/<feature>/ pages, components and data hooks for each feature
    hooks/, lib/        shared hooks, API client, utilities
```

## Getting started

Requires Node.js 20.19 or newer.

```bash
npm install
npm install --prefix frontend
npm run dev
```

This starts the API on http://localhost:5000 and the web app on http://localhost:5173.

**No database setup is needed for local development.** When `MONGO_URI` is empty, the server starts a throwaway in-memory MongoDB and loads demo data. Sign in as `ava` with the password `password123` (every demo user has the same password).

To use your own database, copy `.env.example` to `.env` and fill in the values:

| Variable | Purpose |
| -------- | ------- |
| `MONGO_URI` | MongoDB connection string. Leave it empty in development for the in-memory database. |
| `JWT_SECRET` | Secret used to sign auth tokens. Required in production. |
| `CLIENT_URL` | Frontend URL, used in emails and for CORS in development. |
| `SEED_ON_START` | Set to `true` to load demo data into an empty database. |
| `CLOUDINARY_*` | Optional. Without these, images are stored inline in the database. |
| `MAILTRAP_TOKEN`, `EMAIL_FROM` | Optional. Without these, emails are skipped. |

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Run the API and the web app with live reload |
| `npm test` | Run the API test suite (uses an in-memory MongoDB) |
| `npm run lint` | Lint the frontend |
| `npm run seed` | Reset the database in `MONGO_URI` and load demo data |
| `npm run build` | Install dependencies and build the frontend for production |
| `npm start` | Start the production server, which serves the API and the built frontend |

## Upgrading from the original version

On startup the server migrates older data automatically:
- Legacy likes become "Like" reactions.
- The old unique index on user names is dropped.
- Usernames and emails are lowercased.
