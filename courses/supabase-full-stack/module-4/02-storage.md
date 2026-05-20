---
module: 4
position: 2
title: "Storage: buckets, policies, and CDN"
objective: "S3-compatible storage with RLS."
estimated_minutes: 7
---

# Storage: buckets, policies, and CDN

## What Storage gives you

Supabase Storage is S3-compatible object storage with built-in authorization (via RLS policies) and a global CDN. You upload files; Supabase stores them; serves them via signed URLs or public URLs; and enforces who can read/write what.

Use cases:
- User profile avatars.
- Product images for e-commerce.
- Document attachments.
- Generated PDFs and reports.
- Media files for content platforms.
- AI-generated assets.

If your app has any "user uploads a file" feature, Storage is the path. No bucket configuration, no S3 IAM mess, no separate auth system.

## Buckets

Files live in buckets. A bucket is a top-level container — like an S3 bucket. Two kinds:

- **Public buckets.** Files have public URLs anyone can hit. Good for public assets.
- **Private buckets.** Files require authorization to read or write. Authorization comes from RLS policies on the `storage.objects` table.

Create buckets via dashboard (Storage → New Bucket) or SQL:

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

insert into storage.buckets (id, name, public)
values ('private-documents', 'private-documents', false);
```

You can also configure file size limits and allowed MIME types per bucket.

## File paths and naming

Files inside a bucket are identified by their path. Conventions:

- Use the user's ID as a prefix for user-owned files: `avatars/{user_id}/avatar.png`.
- Use a tenant ID prefix for team-scoped files: `documents/{tenant_id}/{file_id}.pdf`.
- Use UUIDs for filenames to avoid collisions.

Example path structure:
```
avatars/
  abc-123-uuid/
    avatar.png
documents/
  tenant-xyz/
    file-uuid.pdf
```

The path is queryable — RLS policies use it to enforce access.

## RLS policies on storage

Storage uses the same RLS engine as your tables. Policies are written against `storage.objects` (which has a `bucket_id` and `name` column):

```sql
-- Users can read their own avatars.
create policy "Users can read own avatar"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can upload their own avatars.
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can replace their own avatars.
create policy "Users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

`storage.foldername(name)` returns the path components as an array. `[1]` is the first folder; in our convention that's the user ID.

The path-based authorization pattern lets you encode "owned by user X" in the file path itself. Combined with RLS, this is secure and fast.

## Uploading files

From the client:

```ts
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });
```

`upsert: true` replaces existing files. `cacheControl` sets the Cache-Control header for served files.

For large files (>5MB), use resumable uploads:

```ts
const { data, error } = await supabase.storage
  .from('videos')
  .uploadToSignedUrl(signedUrl, token, file);
```

The server issues a signed URL with a token; client uploads in chunks; supports pause/resume.

## Reading files

For public buckets, files have direct public URLs:

```ts
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.png`);
// data.publicUrl
```

For private buckets, generate signed URLs:

```ts
const { data, error } = await supabase.storage
  .from('private-documents')
  .createSignedUrl(`tenant-xyz/file-uuid.pdf`, 60 * 60); // 1 hour
// data.signedUrl
```

The signed URL has a built-in token; anyone with the URL can access the file until it expires. Use short expirations for sensitive content.

## Image transformations

Storage supports on-the-fly image transformations: resize, crop, format conversion.

```ts
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.png`, {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',
      format: 'webp',
      quality: 80,
    },
  });
```

Lets you store one high-resolution master and serve appropriately-sized variants per request. Saves bandwidth and storage.

Transformations are processed on the edge and cached at the CDN — fast.

## CDN and global distribution

Storage is fronted by a global CDN. Files served from public URLs (or signed URLs) hit the CDN first; cache hits are fast worldwide.

CDN cache behavior:

- Respects Cache-Control headers from upload metadata.
- Default cache time is generous.
- Cache invalidation happens automatically when a file is replaced (via `upsert`).
- You can purge cache manually via API if needed.

For frequently-changing files, set short cache times. For static assets, set long caches and rely on URL changes (e.g., adding a version hash) for invalidation.

## File size limits

Each Supabase plan has limits:

- Maximum file size per upload (e.g., 50MB on the free plan).
- Maximum total storage per project.
- Bandwidth limits.

For files larger than the limit, use resumable uploads. For massive data (TB+), Storage isn't the right tool; use direct S3 or specialized providers.

## Storage and Edge Functions

You can manipulate files server-side via Edge Functions:

```ts
// Edge Function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Download a file.
const { data, error } = await supabase.storage
  .from('uploads')
  .download(path);

// Process — e.g., extract text from PDF, resize image.
const processed = await processFile(data);

// Upload result.
await supabase.storage
  .from('processed')
  .upload(`${path}.processed`, processed);
```

Service-role key bypasses RLS, so Edge Functions can read/write any file. Use carefully.

## Storage for AI workflows

Common pattern: user uploads an image; Edge Function downloads it, sends to an AI model (image classification, OCR, embedding), stores results in DB.

```
User → uploads image → Storage
       → triggers Edge Function (via Storage hook)
       → Edge Function downloads, calls AI API
       → Stores result in database
       → User polls / subscribes for result
```

Storage hooks (file upload triggers) make this clean. Configure in dashboard.

## Direct upload from browser

Standard pattern uses the SDK; for large files or specific architectures you can issue presigned upload URLs and POST directly:

```ts
// Server: create signed upload URL.
const { data } = await supabase.storage
  .from('uploads')
  .createSignedUploadUrl(`uploads/file-uuid.dat`);

// Client: upload to that URL.
await fetch(data.signedUrl, {
  method: 'POST',
  body: file,
  headers: { 'Content-Type': 'application/octet-stream' },
});
```

Reduces server-side load — uploads bypass your backend.

## Mistakes to avoid

- **All buckets public.** Sensitive files exposed.
- **No RLS policies on private buckets.** Authenticated users see all files.
- **Storing file metadata only in storage.** Use a database table linking to storage paths.
- **Hardcoded long expirations on signed URLs.** Sharable indefinitely; safety risk.
- **Skipping cleanup on row deletion.** Orphan files accumulate.

## Summary

- Buckets are public or private; private uses RLS for authz.
- File paths encode ownership; policies check via storage.foldername.
- Signed URLs for private files with short expirations.
- On-the-fly image transformations (resize, format, quality).
- Global CDN with cache control.
- Edge Functions for server-side file processing.
- Direct browser uploads via signed upload URLs for large files.

Next: edge functions for server logic.
