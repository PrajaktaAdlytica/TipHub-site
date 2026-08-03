# TipHub Content Studio

This folder contains the private Sanity editing dashboard for TipHub.

- Studio: https://tiphub-content.sanity.studio
- Project ID: `or2q81i4`
- Dataset: `production` (public)

## Connect the studio

The Studio is connected and deployed. Run `npm run cms:dev` from the repository
root for local development. The initial provisional content has already been
seeded.

## Publish the editor

Run `npm run cms:deploy` to publish future Studio schema or interface changes.

## Connect the website

The following production variables are configured on the TipHub Vercel project:

- `VITE_SANITY_PROJECT_ID`
- `VITE_SANITY_DATASET`
- `VITE_SANITY_API_VERSION`

The website has been redeployed and reads published Sanity content. Safe fallback
content remains available if Sanity is temporarily unavailable.

Only team members with access to the Sanity project can edit or publish content.
