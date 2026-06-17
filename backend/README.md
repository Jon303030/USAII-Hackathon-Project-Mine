# Backend Modules

Backend logic is separated by workflow so the two chatbot flows can evolve independently.

```text
backend/fill/chatbot.ts       Fill chatbot: extract fields and return spreadsheet data
backend/navigate/chatbot.ts   Navigate chatbot: questions, keyword extraction, report search response
backend/reports.ts            Shared demo report records and report lookup
backend/pdf.ts                PDF creation, merge, page extraction, and page deletion
backend/storage.ts            PVC/local storage helpers
```

HTTP API routes live in `app/api/` and call these backend modules.

Insight routes:

- `POST /api/fill/insights`
- `POST /api/navigate/insights`
