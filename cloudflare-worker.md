# Cloudflare Worker — Portfolio AI

Worker `delicate-lab-1163` (https://delicate-lab-1163.mikdadtaqi2024.workers.dev). Deploy with `npx wrangler deploy` from a folder holding these two files.

Spam protection: only the portfolio origins may call it, 10 requests/minute per IP per endpoint, messages capped at 500 chars, replies capped by `max_tokens`.

## wrangler.toml

```toml
name = "delicate-lab-1163"
main = "worker.js"
compatibility_date = "2026-05-11"
workers_dev = true

[ai]
binding = "AI"

[[ratelimits]]
name = "RATE_LIMITER"
namespace_id = "1001"
simple = { limit = 10, period = 60 }
```

## worker.js

```javascript
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

// Only the portfolio itself may call the AI. Browsers always send Origin, so
// scripts that fake it are caught by the per-IP rate limit below instead.
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?ferdousmikdad\.me$/,
  /^https:\/\/([a-z0-9-]+\.)?portfolio-em9\.pages\.dev$/,
  /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/,
];

const MAX_MESSAGE_CHARS = 500;
const MAX_REPLY_TOKENS = { mikuda: 300, terminal: 120 };

const BOTS = {
  mikuda: {
    system: `You are Mikuda, Ferdous Mikdad's friendly AI assistant on his portfolio website. You are helpful, warm, and charming. Ferdous is a product designer and vibe coder: he designs digital products and builds them himself with AI-assisted coding. This portfolio — a macOS-style Portfolio OS — is something he designed and built that way. Never invent facts about Ferdous: no made-up clients, companies, job titles, years of experience or skills. If you don't know something, say so and suggest exploring the portfolio's apps or contacting him. Keep responses conversational and friendly. Always represent Ferdous in a positive light.`,
    busy: "Whoa, that's a lot of questions at once! Give me a minute to catch my breath, then ask me again.",
    tooLong: "That message is a bit long for me — could you keep it under 500 characters?",
  },
  terminal: {
    system: `You are a sassy terminal on Ferdous Mikdad's portfolio website. You are witty, a little rude, secretly kind. Keep responses SHORT — max 3 lines. Never break character. Occasionally mention Ferdous. You are not a regular AI. You are a terminal.`,
    busy: "Rate limited. Even terminals need a coffee break. Try again in a minute.",
    tooLong: "Input too long. I'm a terminal, not a novel reader. Keep it under 500 chars.",
  },
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = ALLOWED_ORIGINS.some((re) => re.test(origin));

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed ? origin : "https://ferdousmikdad.me",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const name = new URL(request.url).pathname.slice(1);
    const bot = BOTS[name];
    if (!bot) return json({ error: "Not found" }, 404);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!allowed) return json({ error: "Forbidden" }, 403);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await env.RATE_LIMITER.limit({ key: `${name}:${ip}` });
    if (!success) return json({ reply: bot.busy, error: "rate_limited" }, 429);

    try {
      const body = await request.text();
      if (!body || body.trim() === "") return json({ error: "Empty request body" }, 400);
      const { message } = JSON.parse(body);
      if (!message || typeof message !== "string") return json({ error: "message is required" }, 400);
      if (message.length > MAX_MESSAGE_CHARS) return json({ reply: bot.tooLong, error: "message_too_long" }, 413);

      const response = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: bot.system },
          { role: "user", content: message },
        ],
        max_tokens: MAX_REPLY_TOKENS[name],
      });
      return json({ reply: response.response });
    } catch (err) {
      return json({ error: "Something went wrong", detail: err.message }, 500);
    }
  },
};
```
