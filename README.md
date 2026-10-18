# NightScreen

A mobile-friendly private cinema landing page with Supabase email/password authentication. The sample film cards are visual placeholders; replace them with films you have the right to host or link to. This project does not provide movie files or streaming rights.

## Configure Supabase

1. Confirm the Supabase project is active and its URL is `https://vctlwinsyvoqpnulzkis.supabase.co`.
2. In the Supabase dashboard, open **Authentication → URL Configuration** and add the deployed site URL to **Site URL** and **Redirect URLs**. Add both the production URL and local `http://localhost:5173/**` while testing.
3. Create `.env.local` beside `package.json` using `.env.example`. The publishable key from the chat is included as the public client key. Never put a `service_role` or secret key in this frontend.

If password sign-in still times out, the browser could not reach the Supabase Auth host. Check project status, endpoint URL, DNS/VPN/network filtering, then test the same sign-in on mobile data. A Worker cannot make a paused or unreachable Supabase project respond.

## Build and deploy from a phone

The easiest phone-only path is GitHub plus Cloudflare:

1. Create a GitHub repository in the GitHub mobile app and upload the contents of this folder (including `src/` and `wrangler.toml`).
2. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git** and select the repository.
3. Set build command to `npm run build` and output directory to `dist`. In the project’s **Settings → Variables and Secrets**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; trigger a new deployment after adding them.
4. Open the generated `*.pages.dev` URL on your phone. This Pages route hosts the site; it does not create a separate Worker deployment.

To deploy the included actual Cloudflare Worker instead, run `npm install`, copy `.env.example` to `.env.local`, then run `npm run build` and `npx wrangler login && npm run deploy` from a computer or a cloud development environment. A successful Worker deployment exposes `/health`, which should return `{ "ok": true, "service": "nightscreen-worker" }`.

## What is and is not verified

No original app source, Worker URL, or Cloudflare deployment record was present in the supplied workspace, so the earlier Worker deployment cannot be confirmed. The included `worker.js` and `wrangler.toml` form a deployable Worker configuration. Cloudflare Pages is the simpler phone-based hosting option. The Supabase endpoint itself needs to be reachable from your network for authentication to work.
