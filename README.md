# Karaoke Hub — Next.js

React + Next.js App Router version of Karaoke Hub. The original 4,576-song catalogue, alternate codes and researched hit/new selections are preserved.

## Run locally

Install Node.js 22 LTS or later, then run:

```sh
npm install
npm run dev
```

Open http://localhost:3000. Live Server and opening `index.html` directly show the previous static version, not the Next.js app.

If using the workspace-local Node runtime provisioned during migration, run from PowerShell:

```powershell
$env:PATH = "$PWD\.tools\node-v22.23.3-win-x64;$env:PATH"
npm.cmd run dev
```

## Validation and deployment

```sh
npm test
npm run build
npm start
```

Vercel can detect this project as Next.js. Build command: `npm run build`; leave the output directory at its framework default. This migration does not publish or change the existing deployment.

Routes: `/`, `/hit-songs`, `/new-songs`. Old `/index.html`, `/hit-songs.html`, `/new-songs.html` URLs redirect to the corresponding new routes.

## Files

- `components/KaraokeApp.jsx`: search, menu, cards, favorites, clipboard and detail dialog.
- `components/Icons.jsx`: shared SVG icons.
- `app/globals.css`: consolidated responsive styles.
- `lib/search.mjs`: catalogue search and identity matching.
- `public/assets`: hero and supplied design-reference artwork. Reference portraits and advertisements are illustrative mockup assets.

The original `song-data*.js` and `song-selections.js` remain the source of truth. After editing them, run `npm run catalogue`; this also runs before production builds. `lib/catalogue.json` and `lib/selections.json` are generated from those sources.

The root HTML/CSS/script files are retained as the previous static version. New design changes belong in the React components and `app/globals.css`.
