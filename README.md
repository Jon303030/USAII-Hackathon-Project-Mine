# Report Workflow Hackthon

Node.js 22 web app for three report workflows:

- `Form Fill` (`/fill`): WhatsApp-style chatbot with text and voice input. The chatbot asks 3 questions, then fills and shows the result table.
- `Navigator` (`/navigate`): WhatsApp-style chatbot with text and voice input. The chatbot asks 3 report-search questions, then shows matching reports.
- `Form Viewer` (`/view`): file-explorer PDF management, upload, preview, page extraction, page deletion, merge, download, and PVC/local save.
- `user-management`: simple `user` / `admin` list and add-user flow stored in PVC/local JSON.

The app uses one Next.js service for both frontend pages and backend API routes. Port `8000` is the main and only required port.
The UI includes selectable Light and Dark themes using the supplied soft glassmorphism palette.

## Requirements

- Node.js 22
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:8000
```

## Docker

Build and run:

```bash
docker build -t report-workflow-hackthon:latest .
docker run --rm -p 8000:8000 -v report-pvc:/app/storage/pvc report-workflow-hackthon:latest
```

Push example:

```bash
docker tag report-workflow-hackthon:latest <registry>/<namespace>/report-workflow-hackthon:latest
docker push <registry>/<namespace>/report-workflow-hackthon:latest
```

## Project layout

```text
app/                         Next.js App Router pages and HTTP API routes.
app/page.tsx                 Main page. This is the dashboard.
app/dashboard/               Redirects to `/` so there is only one dashboard entry.
app/login/                   Simple demo login. Only the user's name is required.
app/fill/                    Fill page route. Imports the UI from `fill/`.
app/navigate/                Navigate page route. Imports the UI from `navigate/`.
app/view/                    PDF workspace page route. Imports the UI from `view/`.
app/user-management/         User management page route for user/admin accounts.
app/api/auth/                Login API.
app/api/fill/                Fill chatbot APIs: questions, chat result, and AI insight.
app/api/navigate/            Navigate chatbot APIs: questions, search, and AI insight.
app/api/pdf/                 PDF APIs: list, upload, view/download, merge, extract pages, delete pages.
app/api/users/               User management API backed by PVC/local JSON. Roles are only `user` or `admin`.

backend/                     Server-side business helpers used by `app/api/`.
backend/fill/chatbot.ts      Fill chatbot backend. Owns 3 questions, answer parsing, result filling, and insight text.
backend/navigate/chatbot.ts  Navigate chatbot backend. Owns 3 questions, keyword extraction, search reply, and insight text.
backend/reports.ts           Local demo report records and report search helper.
backend/pdf.ts               PDF helper functions for upload, merge, extract pages, and delete pages.
backend/storage.ts           PVC/local storage paths, JSON helpers, and PDF listing.

components/                  Shared UI components.
components/TopNav.tsx        Main navigation bar.
components/ThemeToggle.tsx   Light/dark theme selector.
components/VoiceComposer.tsx WhatsApp-like text input with microphone speech-to-text support.

fill/                        Fill workflow frontend UI.
fill/FillClient.tsx          Fill chatbot screen and result table.
navigate/                    Navigate/search workflow frontend UI.
navigate/NavigateClient.tsx  Navigate chatbot screen and report results.
view/                        PDF view/edit workflow frontend UI.
view/ViewClient.tsx          PDF explorer, preview, merge, extract, delete, upload, and download UI.
user-management/             User management frontend UI.
user-management/UserManagementClient.tsx Add/list demo users with `user` or `admin` role.

public/icon/1                Reserved PNG folder for fill icons.
public/icon/2                Reserved PNG folder for navigate icons.
public/icon/3                Reserved PNG folder for view icons.
storage/pvc                  Runtime PVC/local data. Ignored by git.
```

Frontend workflow folders such as `fill/`, `navigate/`, `view/`, and `user-management/` should only contain UI.
Backend chatbot logic should stay in `backend/fill/` and `backend/navigate/`.
HTTP endpoints stay under `app/api/`.

The two chatbot backends are separated:

- `backend/fill/chatbot.ts`: fill chatbot for extracting form fields and returning table data.
- `backend/navigate/chatbot.ts`: navigate chatbot for asking three questions, extracting keywords, and preparing report search results.

HTTP endpoints live under `app/api/`. The main chatbot endpoints are:

- `POST /api/fill/chat`
- `POST /api/fill/insights`
- `GET /api/fill/questions`
- `GET /api/navigate/questions`
- `POST /api/navigate/search`
- `POST /api/navigate/insights`

The current port model is one service only: frontend pages and backend API routes both run on `8000`.

## AI placeholders

Chatbot, question generation, and keyword extraction are currently deterministic backend stubs. Fill and Navigate are split into separate backend modules, so a real AI provider can be added to one chatbot without changing the other frontend flow.

Both chatbot flows include an AI insight button. The backend returns a short spoken-style summary plus structured highlights; the frontend can read the summary aloud using the browser speech API.

## PDF API

- `GET /api/pdf/files` lists local/PVC PDFs.
- `POST /api/pdf/upload` uploads PDFs to PVC.
- `POST /api/pdf/merge` merges uploaded or generated PDFs.
- `POST /api/pdf/extract-pages` keeps selected pages.
- `POST /api/pdf/delete-pages` removes selected pages.
- `GET /api/pdf/files/:filename` views a PDF.
- `GET /api/pdf/files/:filename?download=1` downloads a PDF.

The PDF UI does not show or generate sample PDFs. The PVC PDF folder starts empty unless users upload files or later AI/backend code saves files there. Users upload a local PDF or open a saved PVC PDF before preview/edit/download.
