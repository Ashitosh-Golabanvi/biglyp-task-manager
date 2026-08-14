# Biglyp Task Manager

A full-stack task management application with user authentication and task management.

The project is organized as a single repository containing a **Next.js frontend** and a **Hono/Cloudflare Workers backend**.

---

## Live Application

### Frontend

https://biglyp-task-manager.pages.dev/

### Backend API

https://backend.ashitosh-task-manager.workers.dev/

### GitHub Repository

https://github.com/Ashitosh-Golabanvi/biglyp-task-manager

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

## Backend

- Hono
- TypeScript
- Cloudflare Workers
- Wrangler
- Drizzle ORM
- Cloudflare-compatible database

## Deployment

- GitHub
- Cloudflare Pages
- Cloudflare Workers

---

# Project Structure

```text
biglyp-task-manager/
│
├── backend/
│   ├── .vscode/
│   ├── .wrangler/
│   ├── drizzle/
│   ├── node_modules/
│   │
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth/
│   │   │   │   ├── index.ts
│   │   │   │   ├── login.ts
│   │   │   │   ├── me.ts
│   │   │   │   └── register.ts
│   │   │   │
│   │   │   ├── health.ts
│   │   │   └── tasks.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── test/
│   │   ├── env.d.ts
│   │   ├── index.spec.ts
│   │   └── tsconfig.json
│   │
│   ├── .dev.vars
│   ├── .editorconfig
│   ├── .prettierrc
│   ├── AGENTS.md
│   ├── drizzle.config.ts
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── .next/
│   ├── node_modules/
│   ├── out/
│   ├── public/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   │
│   │   └── types/
│   │
│   ├── .env.local
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
