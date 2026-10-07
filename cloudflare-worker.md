# Cloudflare Worker — Portfolio AI

Source: [`worker/worker.js`](worker/worker.js) and [`worker/wrangler.toml`](worker/wrangler.toml).
Live at https://delicate-lab-1163.mikdadtaqi2024.workers.dev — serves `/mikuda` (chat) and `/terminal`.

Deploy after editing:

```
cd worker && npx wrangler deploy
```

Spam protection: only the portfolio origins may call it, 10 requests/minute per IP per endpoint, messages capped at 500 chars, replies capped by `max_tokens`.
