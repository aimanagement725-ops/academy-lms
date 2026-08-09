# Academy Live

Live-session presentation platform and LMS for an English language academy.
Instructors present structured, dynamic lesson slides while screen-sharing
(e.g. over Google Meet); students and admins get their own scoped views;
learners can also practice with a speech-to-speech AI partner outside class.

## Architecture at a glance

- **Next.js (App Router)** — pages, API routes, server components.
- **Prisma + Postgres** — curriculum, slides, sessions, users, AI transcripts.
- **Auth.js (Credentials)** — email/password login, role stored on the JWT
  (`ADMIN` / `INSTRUCTOR` / `STUDENT`), enforced in `middleware.ts`.
- **Zustand** — local-only UI state during a live session (slide index, timer).
  No sync infrastructure needed — only the presenter drives the screen share.
- **Custom Node server (`server.js`)** — runs Next.js *and* a WebSocket relay
  on one port, because the AI voice partner needs a persistent connection
  that serverless platforms (Vercel) can't hold open. This is why the app
  targets **Railway/Render** rather than Vercel.
- **`server/realtime-relay.js`** — proxies browser mic audio to the OpenAI
  Realtime API (swap for Gemini Live if preferred), seeds each session with
  the curriculum's `aiPracticePrompt`, and persists the transcript to
  `AIMessage` as it streams so instructors/admins can review it later.

## Local setup

```bash
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY
npm install
npm run prisma:migrate
npm run db:seed        # creates a sample instructor, learner, and lesson
npm run dev
```

Seeded logins (change the passwords before going anywhere near production):

- `instructor@academy.test` / `changeme123`
- `learner@academy.test` / `changeme123`

## Deploying (Railway or Render)

1. Provision a Postgres instance (both platforms offer one natively).
2. Set `DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY` as environment variables.
3. Build command: `npm run build`. Start command: `npm start` (runs `server.js`,
   which serves Next.js and upgrades `/api/ai/realtime` to a WebSocket).
4. Run `npx prisma migrate deploy` as a release/post-deploy step.

## What's scaffolded vs. what's next

Done: schema, auth + role gating, dashboard roster, live-session presentation
shell (sidebar built on the academy's real lesson-phase structure: Objectives
→ Warm-up → Explanation → Vocabulary → Q&A Drill → Final Presentation → AI
Practice), the AI voice partner's relay + browser hook, and a seed script
using one of the academy's actual lesson docs as sample data.

Still to build out: the learner journey/profile page (`/learners/[id]`), the
admin views, per-slideType canvas renderers (`SlideCanvas` currently dumps
`bodyRichText` as raw JSON — needs a dispatcher per `SlideType`), instructor
review UI for `AIConversationSession` transcripts, and a CMS-style admin
screen for authoring `CurriculumComponent`/`Slide` rows instead of hand-editing
via Prisma Studio.
