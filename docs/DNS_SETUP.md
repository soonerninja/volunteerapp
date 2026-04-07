# DNS setup for goodtally.app

This is a launch blocker for any email sending (team invites, event
reminders, weekly digest, feature status updates). Do this before
flipping `RESEND_API_KEY` in production.

## 1. Add the domain in Resend

1. Log in to https://resend.com → **Domains** → **Add Domain**.
2. Enter `goodtally.app`. Resend will generate a set of DNS records.

## 2. Publish the DNS records at your registrar

You'll publish four record types. Resend shows the exact values — copy
them verbatim. The host/name prefixes below are what you'll typically
see; your registrar UI may strip the trailing `.goodtally.app` for you.

| Type  | Host / Name                         | Value (example)                                  | Purpose |
|-------|-------------------------------------|--------------------------------------------------|---------|
| TXT   | `send.goodtally.app`                | `v=spf1 include:amazonses.com ~all`              | SPF — authorizes Resend/SES to send on our behalf |
| MX    | `send.goodtally.app`                | `10 feedback-smtp.us-east-1.amazonses.com`       | Bounce / return-path mailbox |
| TXT   | `resend._domainkey.goodtally.app`   | (long DKIM public key from Resend)               | DKIM — signs outbound mail so receivers trust us |
| TXT   | `_dmarc.goodtally.app`              | `v=DMARC1; p=none; rua=mailto:dmarc@goodtally.app` | DMARC — tells receivers how to handle spoofing |

### Notes
- Start DMARC at `p=none` and leave it there for ~2 weeks while you
  watch the `rua` inbox for reports. Only move to `p=quarantine` (and
  later `p=reject`) once you're confident nothing legitimate is
  failing alignment.
- Do **not** put the main `goodtally.app` apex record as the SPF host
  unless your main mail provider is also Resend. Resend uses a
  `send.` subdomain so it doesn't collide with your inbound mail.
- TTL 3600 is fine. Records typically propagate within 10 minutes.

## 3. Verify in Resend

Back in the Resend dashboard, click **Verify DNS Records**. All four
should flip to green. If they don't:

- Give it a few more minutes for propagation.
- `dig TXT send.goodtally.app` and `dig TXT resend._domainkey.goodtally.app`
  from a terminal to confirm the records are live.
- Double-check you didn't put the hostname inside the value field (a
  very common registrar gotcha).

## 4. Set the production env vars

Once the domain is green, add these to your production environment
(Vercel → Settings → Environment Variables, or wherever you host):

- `RESEND_API_KEY` — create a new restricted key in Resend and paste
  it here. Don't reuse the global key.
- `NEXT_PUBLIC_SITE_URL` — `https://goodtally.app`

The app will auto-detect `RESEND_API_KEY` and start sending real email.
Until then every call to `sendEmail` no-ops and logs a warning, so
preview deployments are safe.

## 5. Smoke-test

1. Log in as the super admin in prod.
2. Go to **Settings → Team** and invite yourself at a different email.
3. Confirm the invite email arrives, with working unsubscribe link.
4. Trigger the cron endpoints manually with the `CRON_SECRET`:
   ```
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://goodtally.app/api/cron/event-reminders
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://goodtally.app/api/cron/weekly-digest
   ```

If any of those fail, fix before rollout day — not during.
