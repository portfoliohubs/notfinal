<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c560c9e6-bcdf-4af0-ad46-3f35cf40e7b1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Static doctor websites

Firebase Hosting can serve crawlable doctor pages generated at build time. Export published
website records into `content/public-websites.json` (or set `PUBLIC_WEBSITES_FILE` to another
JSON file), then run:

`npm run build`

`npm run generate:websites`

Each record must include a unique `slug` and `fullName`. Slugs must contain lowercase
letters, numbers, and single hyphens between segments. The generator writes pages to
`dist/dr<slug>/index.html`; deploy the resulting `dist` directory to Firebase Hosting.

## Trial deployment architecture

The trial architecture uses GitHub Pages for the frontend, Firebase
Authentication and Firestore for application data, a Cloudflare Worker only for
authenticated ImageKit media uploads, and ImageKit for Website media. The
Worker remains in `worker/` and `wrangler.toml`; D1 is retained only as the
current API compatibility store while this trial is validated.

To continue after logging into Cloudflare:

```powershell
npx wrangler login
npx wrangler d1 create portfoliohubs-db
```

The D1 ID is already recorded in `wrangler.toml`. Do not run a production
migration until the API and Firebase ID-token verification are implemented and
tested.

CV generation remains entirely client-side and does not upload CV files. Website
media uses ImageKit through the Worker endpoints `/api/media/auth` and
`/api/media/complete`; the ImageKit private key is a Worker secret only.

The trial GitHub Pages URL is
`https://portfoliohubs.github.io/updateversion5/`. The production repository
`portfoliohubs.github.io` should not be changed until this trial passes the
full authentication, Website, admin, media, and mobile route checks.
