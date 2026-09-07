# Aly Abdelaziz HR Intelligence Platform — V10 Advisory Lab

V10 adds the first production-oriented architecture for **Aly Advisory Lab**: a free structured HR/strategy advisory intake, server-side case creation, AI triage, email notifications, a private advisory dashboard, and an AI-assisted response workflow.

## What is included
- `advisory.html` / `advisory-ar.html` — six-step diagnostic intake.
- `advisory-dashboard.html` — private admin desk using Supabase Auth.
- `api/advisory-submit.js` — server-side case creation + AI triage + Resend notification.
- `api/advisory-reply.js` — authenticated response sending endpoint.
- `supabase/schema.sql` — production-oriented database schema + RLS policies.
- `.env.example` — required Vercel environment variables.
- `assets/advisory.js` — intake workflow.
- `assets/advisory-dashboard.js` — dashboard logic.
- `assets/supabase-config.js` — browser-safe Supabase URL + publishable key placeholder.

## Production setup

### 1. Create a Supabase project
Run `supabase/schema.sql` in the SQL Editor.

Create an Auth user for Aly, then set its user metadata to:
```json
{"role":"advisory_admin"}
```

Use RLS exactly as supplied. The public website must not be allowed to read advisory cases. Only the server-side service key may insert from `/api/advisory-submit`, while the authenticated advisory admin can read/update through RLS.

### 2. Configure the browser client
Edit `assets/supabase-config.js`:
```js
window.ALY_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY'
};
```
The publishable key is designed for browser use only when RLS is correctly configured. Never put the Supabase secret/service-role key in this file.

### 3. Configure Vercel environment variables
Set:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (recommended to pin the model used in production)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ALY_NOTIFICATION_EMAIL`

The OpenAI key must remain server-side. The Vercel API routes are the only place it is used.

### 4. Configure Resend
Verify the sending domain and use an address such as `advisory@alyabdelaziz.com` for `RESEND_FROM_EMAIL`.

### 5. Test in this order
1. Submit a test case from `advisory.html`.
2. Confirm the case appears in Supabase.
3. Confirm AI triage is stored.
4. Confirm Aly receives the notification email.
5. Sign in at `advisory-dashboard.html`.
6. Open the case and save diagnosis/recommendation.
7. Draft the client response.
8. Approve and send.
9. Confirm the case becomes `responded` and the client receives the email.
10. Test that a normal public visitor cannot query the advisory table.

## Operating principle
**AI assists. Aly decides.**

AI is used for intake structuring, classification, hypothesis generation and response drafting. It does not autonomously provide a final consulting diagnosis to the client.

## Security
Advisory cases may contain commercially sensitive information. Do not invite clients to upload confidential documents until a secure evidence-upload workflow, retention policy and access model have been implemented. Start with structured text intake and explicit guidance not to submit confidential information.

Before production, review Supabase Security Advisor, RLS policies, grants, authentication, rate limits, domain/email verification, and backup/retention settings.
