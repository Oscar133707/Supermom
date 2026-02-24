# SOP 04 — API Conventions

## Architecture: Server Actions Only
All mutations go through Next.js Server Actions in `/actions/*.ts`.
No custom REST API routes (`/api/*`) are needed except `/auth/callback`.

## Server Action Pattern
```typescript
'use server';

export async function doSomething(input: string) {
  // 1. Create server-side Supabase client
  const supabase = await createClient();

  // 2. Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  // 3. For admin actions: call assertAdmin()
  // const { supabase, userId } = await assertAdmin();

  // 4. Perform DB operation
  const { error } = await supabase.from('table').insert({ ... });
  if (error) throw error;

  // 5. Bust cache for affected routes
  revalidatePath('/relevant-path');

  // 6. Optionally redirect (note: this throws, don't try/catch it)
  redirect('/somewhere');
}
```

## Data Fetching Pattern (Server Components)
```typescript
// Fetch directly in the page — no useEffect, no API calls
export default async function MyPage() {
  const data = await getMeasurements();  // calls Server Action or direct supabase
  return <MyComponent data={data} />;
}
```

## File Organization
```
actions/workouts.ts      — getActiveProgram, completeSession, uncompleteSession
actions/measurements.ts  — addMeasurement, getMeasurements
actions/chat.ts          — sendChatMessage, getChatHistory
actions/admin.ts         — createProgram, createSession, assignProgram, getPrograms, etc.
```

## Error Handling
- Server Actions throw `Error` with descriptive messages for auth failures
- Next.js error boundaries catch unhandled errors in production
- Client Components wrap action calls in try/catch to show user-friendly errors

## Caching and Revalidation
- `revalidatePath('/workouts')` after completeSession/uncompleteSession
- `revalidatePath('/measurements')` after addMeasurement
- `revalidatePath('/admin/programs')` after createProgram/deleteProgram
- `revalidatePath('/admin/programs/[id]')` after createSession/deleteSession
