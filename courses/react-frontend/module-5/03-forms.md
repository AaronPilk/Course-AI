---
module: 5
position: 3
title: "Forms and validation"
objective: "React Hook Form + Zod in practice."
estimated_minutes: 7
---

# Forms and validation

## The forms problem

Forms are the most state-heavy part of most React apps. Every input is state. Every blur, every focus, every change, every submit is an event. Validation runs as users type. Errors need to display per-field. Async validation (is this email already taken?) adds another layer.

Doing this with raw useState becomes ceremony quickly. Two libraries dominate in 2026:

- **React Hook Form** — performance-oriented, refs-based, minimal re-renders.
- **Formik** — older, fully-controlled, fewer optimizations. Less common in new code.

Combined with **Zod** for schema validation, React Hook Form is the modern default.

## Why React Hook Form

Compared to controlled state per field:

- **Fewer re-renders.** Inputs are uncontrolled (ref-based); only the form itself re-renders when needed.
- **Better TypeScript support.** Schema-derived types flow through.
- **Less boilerplate.** No manual onChange / value plumbing.
- **Built-in validation.** Per-field, sync or async.

For a form with 20 fields, RHF can be 10x faster than fully-controlled forms in raw useState.

## Basic usage

```tsx
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email required' })} />
      {errors.email && <p>{errors.email.message}</p>}
      
      <input
        type="password"
        {...register('password', {
          required: 'Password required',
          minLength: { value: 8, message: 'At least 8 characters' },
        })}
      />
      {errors.password && <p>{errors.password.message}</p>}
      
      <button type="submit">Log in</button>
    </form>
  );
}
```

- `register` connects inputs to the form's ref/state system.
- `handleSubmit` wraps your submit handler with validation.
- `errors` is automatically populated with validation messages.

## Zod schema validation

Schema-based validation centralizes rules:

```tsx
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  age: z.number().min(13, 'Must be 13+'),
});

type FormData = z.infer<typeof schema>;

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  // ...
}
```

Benefits:

- One source of truth for validation.
- Type inference (`z.infer<typeof schema>`) keeps form types in sync.
- Same schema can run server-side (Server Actions, API routes).
- Composable schemas (extend, omit, merge).

This combo (RHF + Zod) is the dominant 2026 pattern.

## Controller for non-native inputs

Custom or third-party inputs (date pickers, rich text editors, custom selects) don't accept refs the way native inputs do. Use `Controller`:

```tsx
import { Controller } from 'react-hook-form';
import { DatePicker } from 'some-library';

<Controller
  name="birthday"
  control={control}
  render={({ field, fieldState }) => (
    <>
      <DatePicker {...field} />
      {fieldState.error && <p>{fieldState.error.message}</p>}
    </>
  )}
/>
```

`Controller` bridges between RHF's internals and components that need controlled props.

## Watching field values

Sometimes one field's value affects another field's rendering. `watch`:

```tsx
const accountType = watch('accountType');

return (
  <>
    <select {...register('accountType')}>
      <option value="personal">Personal</option>
      <option value="business">Business</option>
    </select>
    
    {accountType === 'business' && (
      <input {...register('businessName')} />
    )}
  </>
);
```

`watch('field')` returns the current value and re-renders the component when it changes. Use sparingly — every `watch` triggers re-renders. For most cases, you don't need it.

## Async validation

Checking email uniqueness against the server:

```tsx
<input
  {...register('email', {
    required: 'Required',
    validate: async (value) => {
      const res = await fetch(`/api/check-email?email=${value}`);
      const { available } = await res.json();
      return available || 'Email already taken';
    },
  })}
/>
```

Async validators run on submit (and on blur if you configure it). For real-time async validation (debounced), pair with `watch` and a custom hook — or use a dedicated async-validation library.

## Default values

```tsx
const { register, handleSubmit } = useForm<FormData>({
  defaultValues: {
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
});
```

For server-fetched defaults (editing an existing record):

```tsx
const { register, reset } = useForm<FormData>();

useEffect(() => {
  fetchUser(userId).then((user) => {
    reset({
      name: user.name,
      email: user.email,
    });
  });
}, [userId]);
```

`reset` populates fields with new values. Use after fetching to pre-fill an edit form.

## Submit handlers

```tsx
const onSubmit = async (data: FormData) => {
  try {
    await api.createPost(data);
    toast.success('Created!');
    reset();
  } catch (err) {
    toast.error('Failed: ' + err.message);
  }
};

const onInvalid = (errors) => {
  console.log('Validation errors:', errors);
};

<form onSubmit={handleSubmit(onSubmit, onInvalid)}>
```

`handleSubmit` calls `onSubmit` if validation passes; `onInvalid` (optional) if it fails.

## Touched, dirty, isSubmitting

```tsx
const {
  formState: {
    errors,
    isDirty,        // Has any field changed from default?
    isSubmitting,   // Is the submit handler running?
    isValid,        // All current values pass validation?
    touchedFields,  // Which fields the user has interacted with
  },
} = useForm();
```

- Disable submit while `isSubmitting`.
- Highlight errors only on `touchedFields` to avoid premature error display.
- Show "unsaved changes" warning when `isDirty`.

These flags handle the common UX needs.

## Field arrays

For dynamic lists (add/remove rows):

```tsx
import { useFieldArray } from 'react-hook-form';

const { control } = useForm();
const { fields, append, remove } = useFieldArray({
  control,
  name: 'addresses',
});

return (
  <>
    {fields.map((field, index) => (
      <div key={field.id}>
        <input {...register(`addresses.${index}.street`)} />
        <button onClick={() => remove(index)}>Remove</button>
      </div>
    ))}
    <button onClick={() => append({ street: '' })}>Add</button>
  </>
);
```

`field.id` is RHF's generated key — use as React key, NOT array index (different).

## Server Actions integration (Next.js)

For Next.js App Router with Server Actions, you can pair RHF + Zod with server-side validation:

```tsx
// Shared schema:
// lib/schemas.ts
export const postSchema = z.object({ title: z.string().min(1), body: z.string().min(10) });

// Server Action validates the same schema:
'use server';
export async function createPost(formData: FormData) {
  const result = postSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { errors: result.error.flatten() };
  // ...
}

// Client form uses RHF + Zod for instant feedback:
const { register, handleSubmit } = useForm({ resolver: zodResolver(postSchema) });
```

Same schema runs in both places. Client validation gives instant feedback; server validation is the security boundary.

## Common gotchas

**Number inputs.** Browser inputs return strings even for `type="number"`. Zod can coerce: `z.coerce.number()`.

**Booleans from checkboxes.** Native checkboxes give boolean from `event.target.checked`. RHF handles this; just register normally.

**File inputs.** `register` gives a FileList; access via `data.file[0]` or use `Controller` for custom handling.

**Conditional fields.** Use `watch` to show/hide; clear values when hidden via `unregister` or omit from submission.

## Mistakes to avoid

- **Fully-controlled forms with raw useState.** Boilerplate, perf issues.
- **No schema.** Validation scattered, errors inconsistent.
- **Watching everything.** Re-renders on every keystroke.
- **No async validation.** Server-side rules invisible to users.
- **Resetting without `reset()`.** Manual field-by-field clearing.
- **Forgetting to sync server validation with client schema.** Same rule twice; mismatch leads to confusing UX.

## Summary

- React Hook Form + Zod is the modern React forms pattern.
- `register` connects inputs; `handleSubmit` wraps validation.
- Zod schemas centralize validation rules; `z.infer` derives types.
- Controller for non-native inputs.
- Field arrays for dynamic lists.
- Share schemas with Server Actions for unified validation.
- formState gives all the UX hooks (isSubmitting, isDirty, errors).

Next: accessibility fundamentals.
