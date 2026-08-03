# TipHub

Production website and Sanity content studio for TipHub Ventures.

## Technology

- React 19 and Vite
- Sanity CMS
- Vercel hosting

## Local website setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure these values in `.env.local`:

```text
VITE_SANITY_PROJECT_ID=your_sanity_project_id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2026-07-27
```

Create a production build with:

```bash
npm run build
```

## Sanity Studio

```bash
cd studio
npm install
cp .env.example .env
npm run dev
```

The Sanity project ID and dataset must match the values used by the website.

## Vercel deployment

1. Import this GitHub repository into Vercel.
2. Keep the root directory as the repository root.
3. Select the Vite framework preset.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. Add the three `VITE_SANITY_*` environment variables for Production, Preview, and Development.
6. Deploy and verify every route before assigning the production domain.

SPA route rewrites and security headers are defined in `vercel.json`.

## Content administration

Approved portfolio companies, fund details, field notes, team profiles, and contact settings are managed through the Sanity Studio. Do not commit `.env`, `.env.local`, `.vercel`, or Sanity credentials.
