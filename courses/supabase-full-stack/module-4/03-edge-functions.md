---
module: 4
position: 3
title: "Edge functions for server logic"
objective: "Deno-based serverless functions."
estimated_minutes: 7
---

# Edge functions for server logic

## What they are

Edge Functions are serverless TypeScript functions running on Deno, deployed globally on the edge. They run close to the user, scale automatically, and let you write the non-CRUD logic the auto-API can't handle.

Use cases:

- **Webhooks** (Stripe, Twilio, SendGrid, GitHub).
- **External API integrations** (call third-party services with secret keys).
- **Background jobs** (process uploads, run periodic tasks).
- **Email sending** with custom logic.
- **Complex authorization** beyond RLS.
- **AI / LLM endpoints** for streaming and orchestration.
- **PDF generation, report rendering**.
- **Cron-triggered tasks** via pg_cron + Edge Functions.

If you have logic that doesn't fit a single SQL query or a CRUD operation, Edge Functions is the path.

## Deploying a function

```bash
supabase functions new hello
# creates supabase/functions/hello/index.ts

# Edit index.ts
# Deploy:
supabase functions deploy hello
```

Minimal function:

```ts
// supabase/functions/hello/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve((req) => {
  return new Response(JSON.stringify({ hello: "world" }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Once deployed, it's accessible at `https://<project>.supabase.co/functions/v1/hello`.

## Calling functions from the client

```ts
const { data, error } = await supabase.functions.invoke('hello', {
  body: { name: 'World' },
});
```

`supabase.functions.invoke` handles auth header automatically — if the user is logged in, their JWT is passed; the function can verify and use it.

## Reading user context inside a function

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Now you have the authenticated user; use the supabase client to query
  // — all queries respect RLS as that user.
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id);

  return new Response(JSON.stringify({ posts }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Forwarding the Authorization header to a Supabase client inside the function gives you "act as the authenticated user" — RLS still applies.

## Using service role for privileged ops

When you need to bypass RLS (admin operations, internal jobs):

```ts
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Bypasses all RLS.
await supabaseAdmin.from("users").update({ status: "banned" }).eq("id", userId);
```

Use service_role carefully — typically after verifying the caller is allowed (e.g., authenticated user is admin) and wrapping the privileged operation in business logic.

## Webhooks

Receiving webhooks from external services:

```ts
serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  
  // Verify signature.
  const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  
  // Handle the event.
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    // ...
  }
  
  return new Response("ok");
});
```

Each external service has webhook setup steps; Supabase Edge is the receiving endpoint.

## Calling external APIs

Edge Functions can store secrets and call third-party APIs:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

Then in the function:

```ts
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
});
```

Secrets stay server-side. Clients call the function; the function calls the external API with the secret.

## Scheduled / cron jobs via pg_cron

Combine Edge Functions with `pg_cron` to schedule tasks:

```sql
select cron.schedule(
  'daily-cleanup',
  '0 4 * * *',  -- 4 AM daily
  $$
    select net.http_post(
      url := 'https://<project>.supabase.co/functions/v1/daily-cleanup',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      )
    );
  $$
);
```

`pg_cron` schedules the job; `net.http_post` calls the Edge Function. The function does the actual work.

Use cases: nightly aggregations, email digests, data archival, recurring sync jobs.

## Streaming responses

Edge Functions support streaming responses — useful for AI/LLM endpoints:

```ts
serve(async (req) => {
  const stream = new ReadableStream({
    async start(controller) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [...],
        stream: true,
      });
      
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
});
```

Client receives the response progressively — necessary for chat-style UIs.

## CORS

Edge Functions need CORS configuration for browser calls from different origins:

```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  // ... main logic
  return new Response(JSON.stringify({ ... }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

In production, replace `*` with your specific origin(s).

## Local development

```bash
supabase functions serve hello --env-file ./supabase/.env.local
```

Runs locally with hot reload. Use `.env.local` for local secrets; never commit it.

Test with curl:
```bash
curl -i http://localhost:54321/functions/v1/hello \
  -H "Authorization: Bearer <anon-or-jwt>" \
  -d '{"name":"World"}'
```

## Logs and debugging

Edge Function logs are visible in dashboard → Functions → Logs. `console.log` output is captured. Useful for debugging deployment issues and production behavior.

For structured logging, use `console.error` for errors and standard `console.log` for info. Don't log secrets or PII.

## Limits and constraints

- **Execution time**: typically 60 seconds; longer needs background jobs.
- **Memory**: small (a few hundred MB); not for ML inference.
- **Cold starts**: subsequent invocations are fast; first after idle has ~100-300ms cold start.
- **No persistent state**: each invocation is independent. State lives in Postgres or Storage.
- **Deno runtime**: most Node packages work via esm.sh; some don't.

## Common patterns

**1. Server-side business logic.** Logic that's too complex for SQL or RLS — multi-step processes, conditional flows.

**2. External API gateway.** Frontend calls Edge Function; function calls external service with secret; returns result.

**3. Webhook receiver.** External service POSTs; function processes the event and updates DB.

**4. Email sender.** Function calls SendGrid/Postmark/Resend; templates lived in code or DB.

**5. AI orchestration.** Function calls LLM; streams response; logs usage; updates user state.

**6. Cron-triggered.** pg_cron + Edge Function for scheduled tasks.

## Mistakes to avoid

- **service_role used carelessly.** Bypass RLS only when you've explicitly authorized.
- **No CORS for browser calls.** Requests fail with cryptic errors.
- **Synchronous long-running work.** Hits execution limits. Use queues + background jobs.
- **Storing state in the function.** Each invocation is independent.
- **No error handling.** Unhandled errors return 500 without context.

## Summary

- Edge Functions = serverless TypeScript on Deno, deployed globally.
- Handles webhooks, external APIs, background jobs, AI orchestration, cron tasks.
- Forward Authorization header to act as the user; use service_role for admin ops.
- Combine with pg_cron for scheduled work.
- Streaming responses for AI/LLM.
- CORS configuration required for browser calls.

Next: vector embeddings with pgvector.
