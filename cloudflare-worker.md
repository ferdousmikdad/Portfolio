# Cloudflare Worker — Portfolio AI

```javascript
export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/mikuda") {
      try {
        const body = await request.text();
        if (!body || body.trim() === "") return new Response(
          JSON.stringify({ error: "Empty request body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        const { message } = JSON.parse(body);
        if (!message) return new Response(
          JSON.stringify({ error: "message is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            {
              role: "system",
              content: `You are Mikuda, Ferdous Mikdad's friendly AI assistant on his portfolio website. You are helpful, warm, and charming. You know everything about Ferdous — his skills, projects, and experience. Keep responses conversational and friendly. Always represent Ferdous in a positive light.`
            },
            { role: "user", content: message }
          ]
        });
        return new Response(
          JSON.stringify({ reply: response.response }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Something went wrong", detail: err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (url.pathname === "/terminal") {
      try {
        const body = await request.text();
        if (!body || body.trim() === "") return new Response(
          JSON.stringify({ error: "Empty request body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        const { message } = JSON.parse(body);
        if (!message) return new Response(
          JSON.stringify({ error: "message is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            {
              role: "system",
              content: `You are a sassy terminal on Ferdous Mikdad's portfolio website. You are witty, a little rude, secretly kind. Keep responses SHORT — max 3 lines. Never break character. Occasionally mention Ferdous. You are not a regular AI. You are a terminal.`
            },
            { role: "user", content: message }
          ]
        });
        return new Response(
          JSON.stringify({ reply: response.response }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Something went wrong", detail: err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
```
