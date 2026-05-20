---
module: 2
position: 2
title: "Forms, validation, and useFormState"
objective: "Progressive enhancement that works."
estimated_minutes: 7
---

# Forms, validation, and useFormState

## The form pattern

Forms in the App Router combine Server Actions, validation, and React's state hooks to produce UI that works with or without JavaScript and provides clean error feedback.

The pattern:

1. Server Action validates input.
2. Returns either `{ success }` or `{ errors }`.
3. Client form uses `useFormState` to track the latest result.
4. UI shows errors when present.

Result: clean validation flow, progressive enhancement, server-authoritative validation.

## A complete example

```tsx
// app/posts/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PostSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  body: z.string().min(10, 'Body must be at least 10 chars'),
});

export type FormState = {
  errors?: {
    title?: string[];
    body?: string[];
  };
  message?: string;
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = PostSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  });
  
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  try {
    await db.posts.create({ data: result.data });
  } catch (e) {
    return { message: 'Failed to create post' };
  }
  
  revalidatePath('/posts');
  redirect('/posts');
}
```

```tsx
// app/posts/new/form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPost, type FormState } from '../actions';

const initialState: FormState = {};

export function PostForm() {
  const [state, formAction] = useFormState(createPost, initialState);
  
  return (
    <form action={formAction}>
      <div>
        <label>Title</label>
        <input name="title" />
        {state.errors?.title?.map(err => (
          <p key={err} className="error">{err}</p>
        ))}
      </div>
      
      <div>
        <label>Body</label>
        <textarea name="body" />
        {state.errors?.body?.map(err => (
          <p key={err} className="error">{err}</p>
        ))}
      </div>
      
      {state.message && <p className="error">{state.message}</p>}
      
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>
      {pending ? 'Saving...' : 'Create Post'}
    </button>
  );
}
```

The form action is the Server Action; React calls it on submit. Returned state populates `state` via `useFormState`. Errors display inline. The submit button uses `useFormStatus` to show pending state.

## useFormState

`useFormState` wraps a Server Action and tracks its return value across submissions:

```tsx
const [state, formAction] = useFormState(serverAction, initialState);
```

- `serverAction` is the Server Action.
- `initialState` is what `state` starts as.
- `formAction` is what you pass to `<form action={...}>`.
- `state` updates with the action's return value after each submission.

The Server Action signature becomes `(prevState, formData) => newState`. The first arg is `state` from the previous call.

## useFormStatus

`useFormStatus` reads the status of the parent form:

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}
```

Must be called from a Client Component inside the form (not the form component itself). Gives you `pending` boolean, the form data being submitted, the method, the action.

Use to:
- Disable the submit button during submission.
- Show a loading indicator.
- Disable other form fields.

## Server-side vs client-side validation

The pattern uses server-side validation (in the action). Why not client-side?

- **Server validation is authoritative.** The server is the security boundary; trusted validation runs there.
- **Server validation works without JavaScript.** Progressive enhancement preserved.
- **One source of truth.** No duplicate logic between client and server.

Client-side validation is fine as a UX enhancement — show errors before submission to save a round-trip — but the server still validates. If you only validate on the client, malicious actors bypass it.

For better UX, you can add client-side validation alongside server-side. Use the same Zod schema in both:

```tsx
// app/lib/schemas.ts
export const PostSchema = z.object({ ... });

// Server Action validates with it.
// Client form validates with it via react-hook-form or similar.
```

## Inline error display

Display errors next to the relevant input:

```tsx
<input name="title" />
{state.errors?.title?.map(err => (
  <p key={err} className="error">{err}</p>
))}
```

For form-level errors (auth failures, server errors, network issues):

```tsx
{state.message && <p className="error">{state.message}</p>}
```

A consistent error component reduces UI inconsistency:

```tsx
function FormError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul className="error-list">
      {errors.map(err => <li key={err}>{err}</li>)}
    </ul>
  );
}
```

## Optimistic UI

For mutations where the result is predictable (toggling a like, adding a todo), show the new state immediately before the server confirms:

```tsx
'use client';
import { useOptimistic } from 'react';

export function LikeButton({ post, toggleLike }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    post.liked,
    (state, newState: boolean) => newState
  );
  
  async function handleClick() {
    setOptimisticLiked(!optimisticLiked);
    await toggleLike(post.id);
  }
  
  return (
    <button onClick={handleClick}>
      {optimisticLiked ? '♥' : '♡'}
    </button>
  );
}
```

The UI updates instantly; if the server fails, React reverts. Use for delight on simple toggles. Don't use for complex mutations where rollback would be confusing.

## File uploads

Forms with file inputs work via FormData:

```tsx
<form action={uploadAvatar}>
  <input type="file" name="avatar" accept="image/*" />
  <button>Upload</button>
</form>
```

```tsx
'use server';

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File;
  
  // Upload to Storage / S3 / etc.
  const buffer = await file.arrayBuffer();
  await storage.upload('avatars/...', buffer);
}
```

For large files, consider direct-to-storage uploads with signed URLs to bypass the Server Action's payload limit.

## Reset after success

After successful submission, often you want to reset the form. Use `useRef` on the form and call `reset()` after success:

```tsx
const formRef = useRef<HTMLFormElement>(null);
const [state, formAction] = useFormState(serverAction, initialState);

useEffect(() => {
  if (state.success) {
    formRef.current?.reset();
  }
}, [state]);

return (
  <form ref={formRef} action={formAction}>
    ...
  </form>
);
```

Or redirect after success — the page re-loads with no form state, naturally resetting.

## Disabling double submits

`useFormStatus` already prevents double submits while pending. For extra safety, disable on success too:

```tsx
const { pending } = useFormStatus();
<button disabled={pending}>Submit</button>
```

This handles the common race where users click submit twice while the first request is in flight.

## Mistakes to avoid

- **Only client-side validation.** Server is the security boundary.
- **No `useFormState` for forms with errors.** Errors don't propagate to UI.
- **Calling `useFormStatus` from the form component.** Must be from a child.
- **Optimistic UI on irreversible operations.** Confusing rollback.
- **Big files via FormData without size limits.** Hits Server Action payload caps.

## Summary

- Form + Server Action + `useFormState` + Zod = clean validation pattern.
- Server validates authoritatively; client validation is a UX enhancement.
- `useFormState` tracks action return value across submissions.
- `useFormStatus` for pending state in the submit button.
- `useOptimistic` for simple instant-feedback mutations.
- File uploads via FormData; direct-to-storage for large files.

Next: revalidation and optimistic UI.
