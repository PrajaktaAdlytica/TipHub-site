# TipHub

Production website for TipHub Ventures.

## Technology

- React 19 and Vite
- Vercel hosting

## Local website setup

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Vercel deployment

1. Import this GitHub repository into Vercel.
2. Keep the root directory as the repository root.
3. Select the Vite framework preset.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. No environment variables are required.
6. Deploy and verify every route before assigning the production domain.

SPA route rewrites and security headers are defined in `vercel.json`.

## Content updates

Portfolio companies, fund details, field notes, team profiles, and contact settings are stored in `src/data.js` and `src/content/fallbackContent.js`. Update those files and push to `main`; Vercel will redeploy automatically.
