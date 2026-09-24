# PortfolioHubs Completion Endpoint

> Continuation file for future sessions. Update this file after every major phase or step.
>
> Last updated: 2026-09-24

## How to continue

1. Read this file from top to bottom.
2. Check the **Current checkpoint** section first.
3. Continue with the first unchecked item in **Remaining work**.
4. Run the validation command listed for that phase.
5. Update this file immediately after completing the phase.
6. Keep generated `dist/`, `node_modules/`, and temporary files out of source changes.

## Current checkpoint

- Overall implementation estimate: **87%**
- Production readiness estimate: **72%**
- Verified evidence estimate: **93%**
- Current active phase: **Cloudflare data/API cutover**
- Last completed validation:
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.
  - `npm.cmd run generate:websites` passed and generated 0 pages because the checked-in source has no publishable records.
- Local browser smoke-tested:
  - `/`
  - `/cv`
  - `/dsd-students`
- Additional local browser smoke-tested:
  - `/professional-dsd`
  - `/about`
  - `/privacy`
  - `/pricing`
  - `/contact`
  - `/terms`
  - `/docs`
- Local analytics request failures are expected in the browser environment and are not build failures.
- Firebase CLI is available as `firebase.cmd` version 15.29.0; rules have not been deployed or emulator-tested in this session.
- Firebase Hosting and Firestore rules were deployed before the Cloudflare
  migration; Firebase is now retained for Authentication compatibility and as a
  legacy data baseline during the cutover.
- The build now runs static doctor-page generation after Vite compilation.
- Static generation currently produces 0 pages when `content/public-websites.json` has no published export records.
- Local route matrix audit confirms registered routes for home, authentication,
  dashboard/admin, CV, Website/Portfolio, both DSD placeholders, blog/docs,
  platform/legal pages, and both doctor URL forms.
- Latest validation after the final storage-hardening edit:
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.
  - Generated `dist/` was removed after validation.
- Latest Cloudflare cutover validation:
  - Worker deployed as version `1ca6e96d-2270-47f0-a2c3-8ff9dafefb70`.
  - Worker health confirms Firebase Auth project `portfoliohubs-update` and D1 configured.
  - Case media service no longer imports Firebase Firestore or Storage.
  - Frontend lint/build passed after the API and media changes.
  - Pages deployed after correcting the production sitemap reference.
- Upload failure remediation:
  - Increased the ImageKit upload timeout from 8 seconds to 60 seconds.
  - Added upstream status/detail reporting for Worker and ImageKit upload failures.
  - Redeployed Worker version `3c18804a-be11-4ff0-9dee-923375b59167`.
  - Redeployed the Pages frontend and verified the public site and Worker health.
- CORS/network upload remediation:
  - Browser uploads now send multipart data to the authenticated Worker.
  - The Worker forwards the file to ImageKit using the private key server-side,
    eliminating direct browser-to-ImageKit CORS failure.
  - Worker version `83675ed4-0a51-4746-ad79-c6e833e7aa75` and Pages frontend
    were deployed successfully.
- Fixed the actual upload blocker: Worker CORS preflight returned Cloudflare
  error 1101 because a 204 response incorrectly contained a JSON body.
  OPTIONS now returns an empty 204 response with the required CORS headers.
  Deployed Worker version `94bc2224-0c91-4cf8-9a53-8712ccca8601` and verified
  the upload preflight with curl.
- Fixed Firebase token verification source: `jose` was pointed at Google's
  X.509 certificate endpoint instead of a JWK set, causing `ERR_JWKS_INVALID`.
  Worker now uses Google's secure-token JWKS endpoint and was redeployed as
  version `71ed9cef-69f4-4f80-bebc-0a6b2bedf07b`.
- User confirmed Firebase contains no data requiring migration; D1 remains the
  clean production data store.
- ImageKit account key strategy clarified: the active pair is now the Standard
  key pair with public key `public_eIBrGRjcmDqjz4pbbSTt3yPBa5Q=`; the Worker
  was redeployed after the user replaced the restricted private key.
- ImageKit account was replaced for troubleshooting. The active Worker
  configuration now uses endpoint `https://ik.imagekit.io/portfolioupdate` and
  public key `public_jMYDQXYNLRQQAANgoXF5UPJ7zHE=`. The user uploaded the
  corresponding private key as `IMAGEKIT_PRIVATE_KEY`; Worker version
  `22375ab3-beae-4256-a88a-87ca97bbbef6` is deployed and health is healthy.
- ImageKit authentication was verified successfully from the authenticated
  Admin Dashboard after manually correcting the Worker secret. ImageKit
  request ID: `76f2a651-6a4a-4037-8ab9-feff0cbc1bdc`.
- User verified a real authenticated profile-image upload successfully through
  the Worker to ImageKit. The ImageKit upload path is now operational.
- Fixed AdminDashboard data synchronization: new Website registrations are
  stored in D1, while the dashboard was still reading only legacy Firestore
  collections. Added authenticated `/api/admin/doctors` D1 aggregation,
  including cases and pending statuses, and switched the dashboard refresh
  path to use it. Worker version `29cbe6c5-2aa7-404d-8a91-0480d20b5ead` and
  Pages frontend were deployed; the existing dashboard refresh button now
  performs a real D1 refresh.

## Completed phases

- [x] Audited the existing React/Vite/Firebase application and protected CV generation behavior.
- [x] Added service-oriented routing and the `/website` service boundary.
- [x] Preserved `/portfolio` as a compatibility alias.
- [x] Added `/dsd-students` and `/professional-dsd` placeholders.
- [x] Added the isolated five-second CV download advertisement gate.
- [x] Added admin-configurable promo codes and transactional redemption.
- [x] Added Firebase Storage-backed case upload staging and Storage rules.
- [x] Added Firebase Hosting configuration and deployment documentation.
- [x] Added public platform pages, sitemap, robots.txt, security.txt, canonical metadata, and JSON-LD.
- [x] Added public doctor website routing through `/dr<slug>`.
- [x] Added slug reservation and duplicate-slug protection.
- [x] Added published website synchronization.
- [x] Added the first mixed visual-system pass and responsive display tokens.
- [x] Updated user-facing doctor URLs from GitHub Pages to Firebase Hosting.
- [x] Added doctor-page JSON-LD to the static generator.
- [x] Added runtime title, description, and canonical metadata for public doctor pages.
- [x] Confirmed an idempotent case-subcollection migration service already exists; no duplicate migration command was added.
- [x] Replaced silent migration/admin lookup fallbacks with explicit console warnings.
- [x] Restricted private Firestore profile, portfolio, and case reads to owner/admin.
- [x] Restricted Storage reads to owner/admin or explicitly published doctor records.
- [x] Changed draft persistence from persistent localStorage to tab-scoped sessionStorage.
- [x] Removed dashboard fallback to stale browser drafts after Firestore read failures.
- [x] Added resumable/idempotent legacy profile and case media upload handling with dry-run support.
- [x] Added admin CV poster upload to Firebase Storage with explicit success/error states.
- [x] Added admin promo-code listing, activation/deactivation, deletion, and redemption counters.
- [x] Added optional doctor `sameAs` support to static and runtime Person JSON-LD.
- [x] Removed the remaining persistent wizard-step metadata; draft state is now session-scoped.
- [x] Synchronized `sameAs` metadata in shared portfolio types.
- [x] Final local lint/build/static-generation validation passed after all implementation changes.
- [x] Legacy GitHub PAT and repository settings are now session-scoped instead of persistent localStorage.
- [x] Corrected remaining sessionStorage diagnostics/comments so they no longer describe persistent localStorage.

## Remaining work

### Phase A — Media migration

- [x] Replace Website case upload/list/delete/reorder persistence with ImageKit + Worker/D1.
- [x] Existing case-subcollection migration is idempotent and reports per-user errors.
- [x] Existing migration has progress callbacks.
- [x] Added dry-run mode and explicit Storage upload failures.
- [ ] Validate ImageKit migration with production-sized data before deleting legacy fields.

### Phase B — Authentication and authorization

- [ ] Add explicit service scope/claims for CV, Website, DSD Student, and Professional DSD.
- [ ] Enforce service scope in dashboard and data access paths.
- [ ] Review and narrow broad authentication/admin catches.
- [ ] Review large draft writes during signup.
- [ ] Test duplicate email registration and cross-service access denial.
- [ ] Do not claim service isolation using only a client-written `service` field; implement custom claims or a trusted backend before enforcing this requirement.
- [x] Worker verifies Firebase ID tokens for API requests and applies owner/admin guards to the deployed D1 API.
- [x] Closed anonymous reads for private profile, portfolio, and case documents.
- [x] Added published-record gating for public media reads.
- [x] Dashboard now fails closed when profile reads fail.
- [x] Full draft payloads are no longer persisted across browser sessions.
- [x] Wizard step metadata now uses sessionStorage instead of persistent localStorage.

### Phase C — SEO and static public pages

- [ ] Generate static doctor pages from live published Firebase records or a documented export.
- [x] Verify Cloudflare Pages deployment and SPA fallback for the production Pages URL.
- [x] Add doctor-specific title, description, canonical URL, and JSON-LD.
- [x] Added support for external `sameAs` links in static and runtime doctor JSON-LD; real profile values remain data-entry work.
- [ ] Validate sitemap and crawler output after deployment.

### Phase D — Admin operations

- [ ] Move CV poster upload from legacy Firebase Storage to ImageKit.
- [x] Added promo-code listing, activation/deactivation, deletion, and redemption counters to the admin limits panel.
- [ ] Verify admin-only behavior against deployed Firestore and Storage rules.
- [ ] Switch AdminDashboard operations to the Worker/D1 API and verify admin behavior.

## Security/design decision

Service-specific Firestore authorization cannot be safely implemented by trusting the
`service` query parameter or a client-written profile field. The remaining secure
implementation requires Firebase custom claims or a trusted server/Cloud Function to
issue and enforce service roles. Until then, preserve existing UID ownership rules
and do not add a false security boundary.

### Phase E — Visual system

- [ ] Apply the light editorial system consistently to service/editorial surfaces.
- [ ] Apply the dark void system consistently to selected generative surfaces.
- [ ] Audit mobile/tablet layouts, contrast, focus states, loading, empty, and error states.
- [ ] Verify Arabic/RTL and reduced-motion behavior.

### Phase F — Full QA and release

- [ ] Run the complete route matrix against Cloudflare Pages.
- [ ] Add Worker/D1/API integration tests.
- [ ] Test slug collisions and promo redemption races.
- [ ] Test image upload failures and recovery.
- [ ] Test CV advertisement countdown and skip behavior.
- [x] Deploy initial Cloudflare Pages/Worker/D1 scaffold.
- [ ] Attach and verify the final Cloudflare custom/subdomain.
- [ ] Complete Cloudflare data/API cutover before deprecating Firebase Firestore.
- [ ] Switch all Website reads/writes from Firebase Firestore to Worker/D1 APIs.
- [x] Add typed API client and public Website/Blog API-first reads with fallback.
- [ ] Remove remaining Firebase Storage imports from Website case/admin media paths.
- [ ] Verify analytics, Search Console, sitemap, security.txt, and social metadata.
- [ ] Remove the legacy GitHub Actions compatibility tab after Firebase deployment is confirmed.

### Immediate continuation point

The remaining local code cleanup for persistent GitHub settings is complete. The
first remaining actionable item is external: grant Firebase
`serviceusage.services.use` (typically via `roles/serviceusage.serviceUsageConsumer`)
to the deploying identity, then run the deployment dry-run and emulator/rules
validation. Do not mark production, migration, or authorization items complete
until those checks run against the real project.

The current CLI identity lists only `parmaga-c67d4`; access to the configured
`portfoliohubs-update` project must be granted or the correct Firebase account
must be selected before deployment can proceed.

## Final release gate

The remaining tasks are external or require real production data. Do not mark them
complete from local builds alone:

1. Grant `serviceusage.services.use` on Firebase project `portfoliohubs-update`.
2. Run the Firestore/Storage dry-run and emulator/rules tests.
3. Back up production data and run the migration dry-run.
4. Review migration errors and execute the approved migration.
5. Deploy Hosting, Firestore rules, and Storage rules.
6. Verify published doctor URLs, rewrites, media access, analytics, sitemap, and Search Console.
7. Test authenticated promo redemption, slug collision handling, CV ad behavior, and admin operations in production.
8. Add trusted custom claims/backend enforcement for service-specific authorization.

Until these gates pass, the application is **implementation-complete locally but not
production-certified**.

## Latest validation

- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed.
- `npm.cmd run generate:websites`: passed; generated 0 pages because the export source is empty.
- `npm.cmd run build`: passed after static slug validation was added; generated
  output was removed after validation.
- Firebase Hosting dry-run: blocked before deployment with a project-access
  error; no production deployment was performed.
- Firebase configuration was switched to `portfoliohubs-update`, including
  Authentication domain, Storage bucket, app identifiers, and Analytics
  measurement ID `G-EYE00L54C5`.
- Firebase Hosting is explicitly pinned to the `portfoliohubs` site inside
  `firebase.json`; the public domain remains `https://portfoliohubs.web.app`.
- Storage deployment, uploads, and media migration are blocked on the Spark plan
  until billing is enabled/upgraded; Hosting and Firestore can proceed separately.
- The Hosting domains shown in Firebase are intentionally `portfoliohubs.web.app`
  and `portfoliohubs.firebaseapp.com`. These are Hosting domains; the Firebase
  Web SDK `authDomain` remains the value from the supplied app configuration,
  `portfoliohubs-update.firebaseapp.com`.
- New migration direction requested: move application hosting/API/data/media to
  Cloudflare (Pages + Workers + D1 + R2) while retaining Firebase Authentication
  only. This is not implemented yet; the current Firebase Hosting/Firestore
  deployment remains the live baseline until the Cloudflare cutover is tested.
- Cloudflare migration scaffold added:
  - Wrangler dependency and configuration.
  - Worker `/api/health` endpoint.
  - Initial D1 schema migration.
  - R2 binding placeholder.
  - No production data was moved and no Firebase data was deleted.
- Cloudflare account login confirmed for `portfoliohubs.contact@gmail.com`.
- D1 database created:
  - Name: `portfoliohubs-db`
  - ID: `6a4623ca-45d4-497d-a058-f99eee00e337`
- R2 creation is currently blocked by Cloudflare error `10042`; R2 must be
  enabled once in the Cloudflare Dashboard. The Worker remains configured without
  the R2 binding until that manual enablement.
- D1 migration `0001_initial.sql` applied successfully to the remote database.
- Worker deployed and health-checked:
  - URL: `https://portfoliohubs-api.portfoliohubs-contact.workers.dev/api/health`
  - D1 binding: configured.
  - R2 binding: not configured until R2 is enabled.
- Cloudflare Pages project `portfoliohubs` created and deployed successfully.
  - Project URL: `https://portfoliohubs.pages.dev`
  - Production deployment was verified with HTTP 200 and browser rendering.
- The Pages build still contains legacy Firebase Firestore/Storage client calls;
  the API/data cutover is not complete. Firebase Firestore remains the current
  application data backend until the Worker API replacement is implemented and
  tested.
- Worker Website API scaffold is now deployed with authenticated D1 endpoints
  for profile, portfolio, cases, publishing, public websites, blog, settings,
  and promo operations. The frontend is not yet fully switched to these APIs.
- Added a typed Cloudflare API client and integrated public Website and Blog reads
  with Firebase fallback, preserving behavior while the D1 migration is staged.
- Production URL is fixed as `https://portfoliohubs.pages.dev`; public SEO,
  sitemap, documentation, chatbot, and example links were aligned to this URL.
- ImageKit was selected instead of R2/Firebase Storage for Website media.
  - ImageKit public endpoint/key are configured as Worker variables.
  - ImageKit private key is configured as a Worker secret by the user.
  - CV remains client-side and does not require media storage.
  - Worker ImageKit auth and D1 media metadata endpoints were added; they are
    integrated into the shared Website media upload helper.
- CV remains client-side only; no CV files are uploaded to ImageKit.
- ImageKit Worker and Pages deployments were updated and verified after the
  Website upload integration.
- The ImageKit upload path requires an authenticated Firebase user and stores
  only media metadata in D1. The shared upload helper uses ImageKit, but
  `caseUploadService.ts` still contains legacy Firebase Storage code and must be
  migrated before Website media cutover is complete.
- Google Search Console verification tag updated to the supplied value:
  `LEbtuQbQNm8XDj1I5YVHvKKg7NKoBpK0A7TY5PFBLiY`.
- Final Pages deployment completed after the Search Console update:
  `https://90dec29a.portfoliohubs.pages.dev`; the project URL
  `https://portfoliohubs.pages.dev` returns the new tag.
- Local browser route smoke checks remain healthy for the shared home, portfolio,
  public doctor, pricing, contact, terms, and status pages; analytics request
  aborts are local browser/network noise.
- Fixed public doctor route compatibility: both `/dr<slug>` (canonical/static)
  and `/dr/<slug>` (human-friendly compatibility) now render `PublicWebsite`
  instead of falling through to the home page.
- Draft/step persistence audit: passed; no portfolio draft or step metadata uses persistent `localStorage`.
- Generated `dist` output was removed after validation.
- Firebase IAM retry on 2026-09-24: blocked with HTTP 403; no production files
  or rules were deployed.
- Doctor route compatibility fix validated with TypeScript lint; production
  hosting verification remains blocked by Firebase project access.
- Static website generation now rejects unsafe or duplicate slugs before writing
  output, preventing path collisions and malformed public URLs.
- Audited Firestore, Storage, Hosting rewrites, and route configuration locally;
  production behavior remains unverified because the configured Firebase project
  is inaccessible to the current identity.

## Latest completed step

### Private data access hardening

- Status: complete
- Changed:
  - Firestore private profile, portfolio, and case reads require owner/admin access.
  - Storage media is public only when the owner has a published portfolio record.
  - Dashboard no longer rehydrates stale drafts after Firestore permission failures.
  - Portfolio drafts use `sessionStorage` instead of persistent `localStorage`.
- Validation:
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.
  - `npm.cmd run generate:websites` passed and generated 0 pages without published export records.
  - Firebase dry-run could not complete because the current CLI identity lacks project IAM permission.
- Next step:
  - Run rules tests/emulator verification, then complete route and responsive QA.

### Legacy media migration tooling

- Status: implementation complete; production execution pending
- `migrateUserCasesSubcollection(uid, data, { dryRun: true })` now:
  - Inspects legacy profile and case image data without writing.
  - Supports before, after, additional, and multi-photo case assets.
  - Uploads legacy data URLs to `portfolio-images/{uid}/migrations/...` when not dry-running.
  - Removes base64 values from migrated subcollection/root records.
  - Preserves existing remote URLs.
- `runGlobalDatabaseMigration(progress, { dryRun: true })` supports global inspection.
- Production-sized execution remains blocked until Firebase IAM/rules access is available.

## Current blockers

- Cloudflare Worker API does not yet replace every Firestore operation in the
  legacy AdminDashboard and migration tooling.
- CV poster upload and legacy migration tooling still reference Firebase Storage.
- Firebase ID-token verification exists for media authorization only; service
  authorization and admin authorization in the Worker are not complete.
- ImageKit upload metadata, ownership checks, case deletion, and reorder are
  wired; a real authenticated browser upload remains the final end-to-end test.
- A custom Cloudflare domain has not been selected or attached; the verified
  deployment URL is `https://portfoliohubs.pages.dev`.
- Production Firebase-to-D1 migration is not required for the current empty
  Firebase data set. No Firebase data was deleted.

## Latest implementation step

### Legacy media migration tooling

- Status: implementation complete; production execution pending.
- Updated [migrationService.ts](./src/lib/migrationService.ts) to:
  - Support dry-run mode.
  - Upload legacy profile images to Firebase Storage.
  - Upload legacy before, after, additional, and multi-photo case assets.
  - Preserve existing remote URLs.
  - Remove data URLs from migrated records.
  - Keep migration idempotent by skipping existing case documents.
- Validation:
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.
  - Static generation completed with 0 records.
- Remaining:
  - Run dry-run against authenticated production-sized data.
  - Review the report.
  - Run the actual migration only after backup/rollback approval.

### Admin CV poster upload

- Status: implementation complete; deployed rules verification pending.
- Admins can upload an image from the limits panel.
- The image is stored through the existing Storage helper under an admin-owned path.
- The returned URL is written into global CV ad settings when the admin saves.
- Upload failures are surfaced in the admin status message and logged.

### Promo-code administration

- Status: implementation complete; deployed rules and race testing pending.
- The admin limits panel now loads existing promo codes.
- Admins can view case limits and redemption usage.
- Admins can activate/deactivate codes.
- Admins can delete codes.
- Creating/updating a code refreshes the local management list.
- Production validation remains pending until Firebase IAM access is restored.

### Doctor structured profile metadata

- Status: implementation complete; real profile values and production crawl validation pending.
- Static and runtime doctor pages now accept optional `sameAs` URLs.
- Person JSON-LD now includes doctor name, job title, canonical URL, image, and external profile links.
- Validation:
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.
  - Static generation completed with 0 source records.

### Session-scoped draft metadata

- Status: complete.
- Portfolio form data and wizard step metadata both use `sessionStorage`.
- No `portfolio_draft` or `portfolio_step` values remain in `localStorage`.
- Validation:
  - Search confirmed no persistent draft/step storage references.
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.

## Latest verification step

### Local public-route smoke test

- Status: partial complete
- Verified locally:
  - `/website`
  - `/professional-dsd`
  - `/about`
  - `/privacy`
- Existing verification:
  - `/`
  - `/cv`
  - `/dsd-students`
- Expected environment noise:
  - Google Analytics requests fail locally with `net::ERR_ABORTED`.
  - Vite HMR WebSocket warnings occur in the shared browser environment.
- Still pending locally:
  - `/pricing`
  - `/contact`
  - `/terms`
  - `/changelog`
  - `/status`
  - `/docs`
  - `/dr<slug>` with a real published record

## Route verification matrix

| Route | Local | Production | Notes |
|---|---:|---:|---|
| `/` | done | pending | Home service directory |
| `/cv` | done | pending | CV workflow and ad gate |
| `/website` | done | pending | Website editor |
| `/portfolio` | pending | pending | Compatibility alias |
| `/dsd-students` | done | pending | Coming soon |
| `/professional-dsd` | done | pending | Coming soon |
| `/about` | done | pending | Platform page |
| `/pricing` | done | pending | Platform page |
| `/contact` | done | pending | Platform page |
| `/privacy` | done | pending | Legal page |
| `/terms` | done | pending | Legal page |
| `/changelog` | pending | pending | Platform page |
| `/status` | pending | pending | Platform page |
| `/docs` | done | pending | Documentation |
| `/dr<slug>` | pending | pending | Published doctor website |

## Latest completed step

### SEO metadata and build integration

- Status: complete
- Changed:
  - Static doctor generation now emits Person JSON-LD.
  - Runtime doctor pages update title, description, and canonical metadata.
  - `npm.cmd run build` now runs the static generator after Vite compilation.
- Validation:
  - Pending final lint/build after this change.
- Next step:
  - Complete auth scope review and decide whether service claims can be safely enforced without breaking existing accounts.

## Validation commands

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run generate:websites
```

For Firebase validation, use the project-approved Firebase CLI/emulator workflow and do not commit credentials.

## Important constraints

- Do not modify CV generation/data logic while changing the ad gate.
- Do not remove legacy media fields until backfill and rollback are verified.
- Do not expose credentials, tokens, or production data in this file.
- Keep this endpoint current after every major implementation or validation step.

## GitHub Pages trial checkpoint — 2026-09-24

The active validation repository is `https://github.com/portfoliohubs/updateversion5`.
The deployed trial URL is `https://portfoliohubs.github.io/updateversion5/`.
The production repository `portfoliohubs/portfoliohubs.github.io` must not be
changed until the trial release gates below are completed and signed off.

### Verified in the trial

- [x] Vite project-base support uses `VITE_BASE_PATH=/updateversion5/`.
- [x] Wouter routes use the Vite base path.
- [x] Static asset, manifest, and Service Worker URLs work under the project path.
- [x] GitHub Actions build and Pages deployment succeeded in run `35996131229`.
- [x] Linux-compatible build script uses `npm run`, not `npm.cmd`.
- [x] Home page renders at the public GitHub Pages trial URL.
- [ ] Firebase sign-in/sign-up on the GitHub Pages domain.
- [ ] Firebase Authorized Domain contains `portfoliohubs.github.io`.
- [ ] Website profile read/write and published doctor route.
- [ ] Worker-authenticated ImageKit upload from the trial domain.
- [ ] Admin synchronization, approval, settings, and dark-mode readability.
- [ ] Mobile, tablet, RTL, reduced-motion, and offline/service-worker checks.

### Implementation update — 2026-09-24

- [x] Updated homepage service copy and renamed the services section to
  `PortfolioHubs Smika services`.
- [x] Replaced hard-coded homepage example hosts with the environment-aware
  `src/lib/publicSiteUrl.ts` helper. Trial links now resolve under
  `/updateversion5/`; root production will resolve under `/`.
- [x] Chatbot launcher is no longer hidden while Firebase authentication is
  loading or absent. Authentication remains available for personalization and
  protected actions.
- [x] Chatbot is eagerly imported at the application shell so the launcher is
  not delayed by a lazy component chunk.
- [x] Added scoped dark-mode contrast overrides for AdminDashboard cards,
  surfaces, borders, text, controls, and muted states.
- [ ] Complete visual browser verification of every AdminDashboard tab in both
  themes.

### Homepage visual redesign — 2026-09-24

- [x] Added a dark, editorial hero inspired by the supplied Refero/Dala
  reference: oversized statement typography, restrained navigation treatment,
  rounded hero stage, luminous constellation visual, and pill CTAs.
- [x] Preserved the existing Website/CV actions, service links, live examples,
  social links, theme control, and chatbot.
- [x] Added responsive stacking for the hero visual below 800px.
- [x] Used an original CSS-generated constellation treatment rather than
  copying reference artwork or assets.
- [x] Local `npm.cmd run lint` passed.
- [x] Local `npm.cmd run build` passed.
- [ ] Browser-verify the deployed trial at `/updateversion5/` on desktop,
  tablet, mobile, light/dark controls, and reduced-motion.

Validation completed: `npm.cmd run lint` passed; `npm.cmd run build` passed and
generated 0 static doctor pages because no publishable export records exist in
the trial checkout. The build warnings are the pre-existing Vite native-loader
and large-chunk warnings, not failures.

## New requested product changes

These are requirements for the next implementation cycle, not yet marked
complete:

1. Home service copy:
   - `website in Google & AI Search`
   - `Professional fo free • appearing in Google search & AI tools answers as ChatGPT`
   - `Professional Portfolio and CV PDF Maker for free`
   - `Easy • Free • No account needed`
   - Section heading: `PortfolioHubs Smika services`
2. Home live examples must link to the final host family
   `https://portfoliohubs.github.io/dr<slug>` during the root-domain production
   release, while the trial must use
   `https://portfoliohubs.github.io/updateversion5/dr<slug>`. Links must be
   generated from one environment-aware helper, not hard-coded in each record.
3. The chatbot must render its launcher immediately on initial page load. Auth
   may control protected conversation features, but authentication must not
   delay or hide the launcher.
4. Admin dark mode needs a complete contrast pass for page background, cards,
   tables, inputs, dropdowns, modals, badges, muted text, status colors, focus
   rings, and icon buttons.
5. `Micky plan.docx` must be audited against the current implementation. Every
   requirement must be classified as complete, partial, blocked, or not started,
   with a linked implementation task and acceptance test.

## Execution plan before production repository transfer

### Stage 0 — Continuity and baseline

- [ ] Update this endpoint after every meaningful change with date, commit,
  validation command, result, and next action.
- [ ] Keep all work in `updateversion5`; do not push to
  `portfoliohubs/portfoliohubs.github.io`.
- [ ] Record manual settings: Pages source, Firebase secrets, Authorized Domains,
  and Worker URL.
- [ ] Establish a clean baseline with lint, build, home-page smoke test, and
  direct-route smoke test.

Acceptance: a future session can continue from this file without relying on
conversation history.

### Stage 1 — Home copy and environment-aware public links

- [ ] Update home labels in `src/config.ts` and the services heading in
  `src/pages/HomePage.tsx`.
- [ ] Add one public-site URL helper based on `import.meta.env.BASE_URL`.
- [ ] Update live examples, canonical metadata, sitemap, robots, security.txt,
  docs, and generated templates to avoid stale `portfoliohubs.pages.dev` links.
- [ ] Preserve a deliberate compatibility policy for existing Cloudflare URLs.
- [ ] Test links in both trial (`/updateversion5/`) and root-domain (`/`) modes.

Acceptance: every live example opens the correct GitHub Pages doctor route and
no user-facing source path points to the retired host unless documented.

### Stage 2 — Immediate chatbot launcher

- [ ] Remove auth-listener dependency from launcher visibility.
- [ ] Keep auth state only for protected answers/actions.
- [ ] Use an eagerly loaded launcher shell or preload strategy while keeping the
  heavier conversation panel lazy if needed.
- [ ] Preserve context detection, unread state, focus behavior, and accessibility.
- [ ] Test cold load, anonymous/authenticated users, slow network, mobile, and
  reduced-motion mode.

Acceptance: the launcher is visible during the initial usable page render and
opening it never displays an invalid empty response.

### Stage 3 — Admin dark-mode contrast system

- [ ] Inventory AdminDashboard hard-coded light-only colors.
- [ ] Replace unsafe colors with semantic theme tokens.
- [ ] Fix table rows, controls, modals, overlays, badges, alerts, charts,
  empty/loading/error states, and action buttons in both themes.
- [ ] Verify keyboard focus and WCAG AA contrast for normal and muted text.
- [ ] Test every admin tab manually in both themes.

Acceptance: no foreground/background pair becomes unreadable in light or dark
mode, including pending, approved, rejected, error, and disabled states.

### Stage 4 — Original plan audit and premium visual direction

- [ ] Complete the `Micky plan.docx` requirement matrix.
- [ ] Separate functional requirements from visual direction and record evidence.
- [ ] Review the two design references named in the document and extract
  principles without copying protected artwork or text.
- [ ] Define typography, whitespace, surface depth, motion, responsive grids,
  RTL behavior, premium hero treatment, and component states.
- [ ] Implement visual changes in home, auth, wizard, public doctor page, and
  admin surfaces with desktop/tablet/mobile checks.
- [ ] Cover light, dark, Arabic, English, loading, empty, and error states.

Acceptance: every document requirement has an owner file, implementation
status, and reproducible acceptance test.

### Stage 5 — Data and architecture consistency

- [ ] Resolve the conflict between Firebase Firestore as the latest requested
  Website data store and Cloudflare D1 as the current active store.
- [ ] Choose one authoritative store for Website/profile/case/admin data.
- [ ] If Firestore is authoritative, migrate all reads/writes and admin
  synchronization consistently.
- [ ] If D1 remains authoritative, update the architecture documentation and
  keep Firebase limited to Auth.
- [ ] Keep the ImageKit private key only in the Worker secret.

Acceptance: registration, dashboard editing, publishing, public doctor pages,
case media, promo redemption, and admin actions use one documented source of
truth.

### Stage 6 — End-to-end trial QA

- [ ] Configure Firebase Authorized Domains.
- [ ] Test sign-up, sign-in, sign-out, token refresh, duplicate email, and
  unauthorized dashboard/admin access.
- [ ] Test profile save, portfolio save, slug collision, publish/unpublish,
  public doctor route, and refresh/deep-link behavior.
- [ ] Test ImageKit diagnostics, successful upload, timeout, invalid token, and
  retry/error messaging.
- [ ] Test admin synchronization, approval/rejection, settings, promos, blogs,
  and dark mode.
- [ ] Test CV generation/ad timing, Service Worker cache, offline fallback, and
  project-path scope.
- [ ] Record the exact successful GitHub Actions run and browser smoke results.

Acceptance: all critical flows pass on the trial URL with no application-caused
console errors.

### Stage 7 — Production transfer gate

- [ ] Freeze the trial commit and record its SHA here.
- [ ] Copy only validated source/workflow changes to
  `portfoliohubs/portfoliohubs.github.io`.
- [ ] Change `VITE_BASE_PATH` to `/` and verify generated URLs.
- [ ] Configure production Pages settings and Firebase Authorized Domains.
- [ ] Run a fresh production build/deploy and repeat critical smoke tests.
- [ ] Keep the trial repository as a rollback reference.

Acceptance: production transfer occurs only after Stage 6 passes and the
data-store decision is documented.

## Continuation log

| Date | Commit / run | Change | Validation | Next action |
|---|---|---|---|---|
| 2026-09-24 | `0a07db5`, Actions `35996131229` | Fixed Linux GitHub Actions build and deployed trial | Lint/build/Pages deployment passed; home URL renders | Execute Stages 1–3, then complete the `Micky plan.docx` audit |
| 2026-09-24 | `f976486`, `6163c38` | Implemented requested homepage copy/links, anonymous chatbot launcher, eager chatbot loading, and scoped admin dark-mode tokens | Local lint/build passed; Pages deployment queued | Verify deployed UI, then continue the original-plan visual and QA stages |

## Original document audit summary — 2026-09-24

The audit of [Micky plan.docx](./Micky%20plan.docx) found these important
gaps. They are included here so quota/session continuation does not lose the
original requirements:

- **CV download advertisement:** poster, five-second countdown, skip behavior,
  accessibility, and final-download-only behavior still need an explicit
  implementation/decision.
- **Authentication:** service scope is only partially defined; duplicate-account
  behavior, existing-user sign-in, and DSD service isolation need a documented
  product decision and tests.
- **Media:** ImageKit migration is operational, but 100-image stress testing,
  partial-failure cleanup/retry, and measurable image-quality acceptance criteria
  are not complete.
- **Promo/case limits:** the authoritative source and server-side race/tamper
  tests still need to be fixed and verified.
- **SEO/GEO:** `sameAs` official profiles, final sitemap/canonical host,
  Bing Webmaster verification, IndexNow, and removal of stale demo/test wording
  need completion.
- **Static public pages:** generated doctor HTML, slug-not-found behavior,
  refresh/deep-link handling, and post-publication sitemap updates need a
  production-shaped test.
- **Design:** the current interface has a partial visual system, but not the
  complete premium Apple/Dala direction from the document: typography, spacing,
  void/iris/saffron palette, low-card-density hierarchy, CTA consistency,
  signature visual, motion system, and RTL polish.
- **Quality:** keyboard-only, screen-reader, contrast, reduced-motion,
  responsive breakpoints, loading/empty/error states, and end-to-end route
  coverage remain release work.

### Decisions required before marking the audit complete

1. Treat the CV advertisement as an intentional exception to the “do not alter
   CV generation” requirement, or explicitly remove it from scope.
2. Define whether DSD authentication means a logical service scope or separate
   accounts/data domains.
3. Define image quality in measurable terms instead of the subjective “8/10”.
4. Select Firestore or D1 as the single Website/profile/case/admin source of
   truth; do not operate with an undocumented hybrid.
