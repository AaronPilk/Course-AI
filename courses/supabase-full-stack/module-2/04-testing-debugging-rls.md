---
module: 2
position: 4
title: "Testing and debugging RLS"
objective: "Diagnostics, performance, and edge cases."
estimated_minutes: 7
---

# Testing and debugging RLS

## Why RLS testing matters

RLS bugs are silent. A wrong policy doesn't throw an error — it shows the wrong rows, or hides rows that should be visible, or allows updates that should be denied. The query "succeeds" but returns the wrong data.

This is the single dangerous failure mode of RLS. You only catch it through deliberate testing — exercising policies as different users and asserting that the right rows come back (or don't).

## Testing strategies

Three complementary approaches:

**1. Unit tests for helper functions.** If you have functions like `is_team_member(team)`, write tests that call them with different user contexts and assert the return value.

**2. Integration tests against a real Postgres.** Spin up a test database, seed test users and rows, then make queries via supabase-js as different users; assert the expected rows return.

**3. Manual SQL session testing.** Use `set local role` and `set local request.jwt.claims` in psql to simulate different users.

## Manual session testing

In psql connected to your database, you can simulate a request from a specific user:

```sql
-- Simulate an authenticated user with UUID 'abc-123'.
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub": "abc-123-uuid-here", "role": "authenticated"}';

-- Run your query
select * from posts;

-- See what rows the policies let through.
rollback;
```

The `set local` keeps the role change scoped to the transaction; `rollback` ends it cleanly. You can swap users to verify different permissions.

The Supabase Dashboard SQL Editor has an "Impersonate user" feature that wraps this. Pick a user from the dropdown; queries run as that user.

## Integration tests in code

A common pattern: write tests that exercise the API:

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);

test('user can only read their own notes', async () => {
  // Sign in as user A.
  await supabase.auth.signInWithPassword({
    email: 'a@example.com',
    password: '...',
  });

  // Insert a note.
  const { data: note } = await supabase
    .from('notes')
    .insert({ title: 'Test' })
    .select()
    .single();

  // Sign out.
  await supabase.auth.signOut();

  // Sign in as user B.
  await supabase.auth.signInWithPassword({
    email: 'b@example.com',
    password: '...',
  });

  // Try to read user A's note.
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', note.id);

  expect(data).toHaveLength(0);  // RLS hides it.
  expect(error).toBeNull();      // Not an error, just empty.
});
```

The behavior to assert: rows the user shouldn't see appear as if they don't exist (empty result, no error).

## Debugging "I can't see my row"

Most common RLS bug: "I inserted a row but can't read it back."

Checklist:

1. **Is RLS enabled?** Check `pg_class.relrowsecurity` for the table. If false, RLS isn't on at all; queries return everything.

2. **Is there a SELECT policy?** Check `pg_policies` for the table:
   ```sql
   select * from pg_policies where tablename = 'posts';
   ```

3. **Does the SELECT policy match the row?** Run the policy's USING expression with your user context:
   ```sql
   set local request.jwt.claims = '{"sub": "..."}';
   select author_id = auth.uid() from posts where id = '...';
   ```

4. **Is `auth.uid()` returning what you expect?** It returns NULL for unauthenticated. Check:
   ```sql
   select auth.uid();
   ```

5. **Are you using anon key when authenticated key would help?** Anon key requests run as `anon` role; only anon-applicable policies fire.

## Debugging "users can see things they shouldn't"

The opposite bug: data leaking to unauthorized users.

1. **Is there a too-permissive policy?** Multiple SELECT policies are OR'd — any one allowing access is enough. Audit each policy independently.

2. **Is the policy expression evaluating as expected?** Test with `EXPLAIN`:
   ```sql
   explain select * from posts;
   ```
   See the filter Postgres applied.

3. **Are you bypassing RLS via service_role?** Service role bypasses everything. Check which key the request is using.

4. **Is the policy targeting the wrong role?** A policy `to anon` only applies to anonymous users; the authenticated user might be falling through to other policies.

## Performance: RLS as a WHERE clause

RLS policies are essentially WHERE clauses appended to every query. Performance implications:

- **Index columns referenced by policies.** A policy on `author_id = auth.uid()` needs `author_id` indexed.
- **Simple expressions plan well.** `column = auth.uid()` is fast.
- **Subqueries in policies can be slow.** EXISTS queries in policies execute per row in some cases — index the join tables they reference.
- **Helper functions should be `STABLE`.** Lets Postgres cache the result per query rather than per row.

```sql
-- Function marked STABLE — Postgres can call once per query.
create function public.is_team_member(team uuid) returns boolean as $$
  select exists (
    select 1 from memberships
    where team_id = team and user_id = auth.uid()
  );
$$ language sql security invoker stable;
```

If you skip `STABLE`, Postgres might call the function once per row, scanning memberships repeatedly.

## EXPLAIN with RLS

`EXPLAIN ANALYZE` shows the actual execution plan including RLS-applied filters:

```sql
explain analyze select * from posts where status = 'published';
```

Look for:
- **Sequential scans on policy-checked columns.** Indicates missing indexes.
- **Repeated subquery executions.** Hint that helper functions aren't STABLE or policies are too complex.
- **Filter rows much larger than result rows.** Suggests the policy is doing significant work to filter.

## RLS with computed views

Sometimes you want to expose a computed/joined view to clients. Postgres views inherit RLS from their underlying tables — useful but can produce unexpected behavior.

```sql
create view post_summaries as
  select id, title, author_id, status, created_at
  from posts
  where status = 'published';

-- RLS on `posts` still applies when querying `post_summaries`.
```

Alternative: security-invoker functions returning sets:

```sql
create function public.published_posts() returns setof posts as $$
  select * from posts where status = 'published';
$$ language sql security invoker stable;

select * from public.published_posts();
```

Use views and functions to encapsulate complex query patterns while preserving RLS.

## When RLS is the wrong tool

RLS handles row-level visibility. It struggles with:

- **Column-level permissions.** Hiding specific columns from some users requires either separate tables or careful API design. (Postgres has column-level GRANT but it's clumsy.)
- **Cross-row logic.** "User can see up to 10 posts per day" is a rate-limit, not authz; use functions/triggers.
- **Aggregation visibility.** "Show count of posts but not individual posts" can't be expressed cleanly in RLS.

For these, complement RLS with application-layer or Edge Function logic.

## Testing in CI

Set up an automated test suite that:

1. Provisions a fresh Postgres database with your migrations applied.
2. Seeds test users and rows.
3. Runs tests against the database via supabase-js.
4. Tears down.

`supabase test` is a built-in command that helps with this; many teams use Jest/Vitest with a custom setup that pipes through the local Supabase stack.

Run these tests on every PR. RLS regressions are too quiet to catch otherwise.

## Mistakes to avoid

- **No RLS tests.** Most expensive testing gap in Supabase projects.
- **Manually testing only as the developer.** You're not your worst-case user.
- **Trusting that "it works in the UI" means RLS is correct.** UI tests pass while data leaks.
- **Forgetting `STABLE` on helper functions.** 10-100x slower queries.
- **Not indexing policy-referenced columns.** Sequential scans at scale.

## Summary

- Test RLS by impersonating different users and asserting expected results.
- supabase Studio has user impersonation; psql with `set local` works too.
- Integration tests via supabase-js are the highest-confidence approach.
- "Empty result, no error" is the RLS denial pattern.
- Index columns in policies; mark helper functions STABLE.
- EXPLAIN ANALYZE shows the applied filters and execution plan.
- Views and functions inherit RLS from underlying tables.
- Use RLS for row visibility; complement with app logic for cross-row rules.

Next module: Auth — magic links, OAuth, JWT.
