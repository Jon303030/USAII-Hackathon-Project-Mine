# Form Viewer Frontend

This folder contains the View workflow UI only.

- Page entry: `app/view/page.tsx`
- UI component: `view/ViewClient.tsx`
- Backend APIs: `app/api/pdf/*`, `app/api/favorites/route.ts`
- PDF backend: `backend/pdf.ts`
- Storage backend: `backend/storage.ts`

Use this workflow for favorites, file-explorer PDF management, preview, upload, merge, page extraction, page deletion, and download.

Do not show or generate sample PDFs in the UI. PDFs should come from user upload, PVC saved files, or future AI/backend output.
