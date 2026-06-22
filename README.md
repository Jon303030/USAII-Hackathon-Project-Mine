# Report Workflow Hackathon

Next.js 15 application for senior assistance, form-filling, report navigation, PDF workflows, and simple user management. The app runs as one Node.js 22 service on port `8000`, with frontend pages and API routes in the same project.

The project is designed to run locally without paid provider credentials. If `GEMINI_API_KEY`, Twilio, or SendGrid settings are not configured, the app falls back to rule-based or development-mode behavior where supported.

## Features

- Senior Application Assistant (`/assistant`): bilingual senior-friendly intake, eligibility matching, draft application review, consent capture, and volunteer follow-up.
- Form Fill (`/fill`): WhatsApp-style form-filling chatbot with text or voice input, session storage, form recommendations, and completion notifications.
- Navigator (`/navigate`): guided report search flow that asks clarifying questions, extracts keywords, and returns matching reports.
- Form Viewer (`/view`): PDF workspace for upload, preview, page extraction, page deletion, merge, download, and local/PVC save.
- User Management (`/user-management`): local JSON-backed user/admin list and add-user workflow.
- Health API (`/api/health`): lightweight status endpoint for local checks and Docker healthchecks.

The root route redirects to `/assistant`.

## Requirements

- Node.js `22.x`
- npm `10+`
- Docker Desktop, optional for containerized runs

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:8000
```

Check the API:

```bash
curl http://localhost:8000/api/health
```

## Environment

Create a local environment file before running the app if you want to override defaults or enable provider integrations:

```powershell
Copy-Item .env.example .env.local
```

`.env.local` is loaded by Next.js in development and by `npm start` through `scripts/start-standalone.js`. It is ignored by Git, so keep real secrets there and leave `.env.example` as the shareable template.

Required local defaults and optional provider settings:

```text
PORT=8000
HOSTNAME=0.0.0.0
PVC_ROOT=storage/pvc
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@government-assistance.my
```

Variable notes:

- `PORT` / `HOSTNAME`: server bind settings. The app defaults to `8000` and `0.0.0.0`.
- `PVC_ROOT`: runtime storage for PDFs, users, uploaded ID documents, and chatbot sessions. In Docker this should be `/app/storage/pvc` and backed by a volume.
- `GEMINI_API_KEY`: enables Gemini-backed AI responses. Leave empty for fallback behavior where supported.
- `GEMINI_MODEL`: Gemini model name used by the AI service.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: optional SMS notification settings.
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`: optional email notification settings.

## Scripts

```text
npm run dev            Start Next.js on port 8000.
npm run typecheck      Run TypeScript without emitting files.
npm run build          Build the standalone Next.js production server.
npm start              Start the standalone production server on port 8000.
npm run test:pipeline  Run a small API pipeline check against TEST_BASE_URL or localhost:8000.
```

For a production-style local run:

```bash
npm run build
npm start
```

## Docker

Build the production image:

```bash
docker build -t report-workflow-hackthon:latest .
```

Run without provider keys:

```bash
docker run --rm -p 8000:8000 -v report-pvc:/app/storage/pvc report-workflow-hackthon:latest
```

Run with local environment variables:

```bash
docker run --rm -p 8000:8000 --env-file .env.local -v report-pvc:/app/storage/pvc report-workflow-hackthon:latest
```

Docker notes:

- The image uses `node:22-alpine`.
- The runtime process runs as a non-root `nextjs` user.
- `/app/storage/pvc` is declared as a volume.
- The image healthcheck calls `/api/health`.
- `.env*` files are ignored by Docker except `.env.example`, so secrets are not copied into the build context.

## Project Layout

```text
app/                         Next.js App Router pages and API routes.
app/page.tsx                 Redirects to the senior assistant.
app/assistant/               Senior application assistant page.
app/fill/                    Fill chatbot page.
app/navigate/                Navigator chatbot page.
app/view/                    PDF workspace page.
app/user-management/         User/admin management page.
app/api/                     Backend HTTP routes.

backend/                     Server-side workflow helpers.
backend/ai-service.ts        Optional Gemini integration with fallback behavior.
backend/form-matcher.ts      Assistance form matching rules.
backend/notifications.ts     Twilio/SendGrid hooks with development logging.
backend/fill/                Fill chatbot and session manager.
backend/navigate/            Navigator chatbot logic.
backend/elderly/             Senior assistant form catalog and draft builder.
backend/pdf.ts               PDF upload, merge, extract, delete, and ID document helpers.
backend/storage.ts           PVC/local storage helpers.

components/                  Shared UI components.
elderly-assistant/           Senior assistant frontend.
fill/                        Fill workflow frontend.
navigate/                    Navigator workflow frontend.
view/                        PDF workspace frontend.
user-management/             User management frontend.
storage/pvc/                 Runtime data, ignored by Git.
```

## API Routes

```text
GET    /api/health
POST   /api/auth/login

GET    /api/elderly/ai-status
POST   /api/elderly/ask
POST   /api/elderly/chat
POST   /api/elderly/forms/search
POST   /api/elderly/application
POST   /api/elderly/complete

GET    /api/fill/questions
POST   /api/fill/session
POST   /api/fill/chat
POST   /api/fill/forms/search
GET    /api/fill/forms/[formId]?sessionId=<sessionId>
POST   /api/fill/complete
POST   /api/fill/insights

GET    /api/navigate/questions
POST   /api/navigate/search
POST   /api/navigate/insights

GET    /api/pdf/files
POST   /api/pdf/upload
POST   /api/pdf/id-document
POST   /api/pdf/merge
POST   /api/pdf/extract-pages
POST   /api/pdf/delete-pages
GET    /api/pdf/files/[filename]
GET    /api/pdf/files/[filename]?download=1
DELETE /api/pdf/files/[filename]

GET    /api/users
POST   /api/users
GET    /api/reports/[id]
GET    /api/favorites
POST   /api/favorites
```

## Verification

Recommended checks before deployment:

```bash
npm run typecheck
npm run build
```

With the app running on port `8000`, run:

```bash
npm run test:pipeline
```

To target a different running instance:

```powershell
$env:TEST_BASE_URL = "http://localhost:8000"
npm run test:pipeline
```
