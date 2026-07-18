# CSE – PMS (Bug Tracker) — Frontend

React + TypeScript + Vite frontend for the CSE Project Management System's
bug tracker module. Talks to the Spring Boot backend in `/backend` for all
data — there is no mock/local data layer.

## Prerequisites

- Node.js 18+

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and point `VITE_API_URL` at your running
   backend (defaults to `http://localhost:8080/bug_tracker/api`).
3. Start the dev server:
   ```
   npm run dev
   ```

The app runs at `http://localhost:3000` by default.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — type-check with `tsc --noEmit`

## Project structure

```
src/
├── api.ts                  API client for the Spring Boot backend
├── context/AppContext.tsx  Global app state (auth, bugs, filters)
├── components/             Reusable UI components and modals
├── pages/                  Route-level views (Dashboard, Bugs, Kanban, etc.)
├── types.ts                Shared TypeScript types
└── statusWorkflow.ts       Status transition + role permission rules
```
