# Resume Builder (React + Vite)

Single-page, frontend-only resume builder with local login, live preview, and PDF export. Everything is stored in `localStorage`; no backend required.

## Features
- Local login/register (per-browser) with demo account (`demo` / `demo123`)
- Resume editor with photo upload, skills, experience, education, and projects
- Live preview with three templates: classic, modern, creative
- Autosave draft every 10 seconds and manual save with friendly names
- Save, load, and delete resumes per user in `localStorage`
- Section reorder controls, responsive layout, accessible form labels
- Client-side PDF export via `html2canvas` + `jspdf`
- Export resume JSON, print-ready styles, mobile-friendly UI

## Quick start
1. Install dependencies  
   `npm install`
2. Start dev server  
   `npm run dev`
3. Open `http://localhost:5173` (Vite will also print the URL in the console).

## Notes
- All data (users, resumes, drafts, photos) is stored in `localStorage` only. Clearing browser data resets the app.
- No backend or external storage is used.
- A demo user (`demo` / `demo123`) and a sample resume are seeded for quick testing.

## Build for production
`npm run build`

The output will be in `dist/`. Serve it with any static file server (e.g., `npm run preview`).

## Screenshots
Add screenshots of the editor and templates here:
- `./docs/editor.png`
- `./docs/templates.png`


