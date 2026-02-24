# SOP 05 — Component Patterns

## Server vs Client Components

### Server Components (default)
Use for: pages that fetch data, static layouts, admin pages
```typescript
// app/(app)/dashboard/page.tsx — Server Component
export default async function DashboardPage() {
  const data = await getActiveProgram();  // Direct server call
  return <div>{data?.name}</div>;
}
```

### Client Components (`'use client'`)
Use for: interactive UI, forms with state, charts, real-time updates
```typescript
// components/workouts/CompleteSessionButton.tsx
'use client';
import { useTransition, useState } from 'react';

export function CompleteSessionButton({ sessionId, completed }: Props) {
  const [isPending, startTransition] = useTransition();
  // ...
}
```

## Key Client Components
| Component | Why Client |
|---|---|
| `AppNav` | Uses `usePathname()` for active link highlighting |
| `AdminSidebar` | Uses `usePathname()` |
| `CompleteSessionButton` | Calls Server Action + optimistic state |
| `ProgressChart` | Recharts doesn't support SSR |
| `ChatWindow` | Manages message state, loading, input |
| `SessionForm` | Dynamic exercise rows (useState) |

## Form Patterns

### Simple forms (Server Actions directly)
```typescript
// In a Server Component page
<form action={addMeasurement}>
  <input name="date" type="date" />
  <button type="submit">Save</button>
</form>
```

### Complex forms (Client Component with action prop)
```typescript
// SessionForm.tsx takes the action as a prop
<SessionForm programId={programId} action={createSession} maxWeek={4} />
```
The bound action: `action.bind(null, programId)` prepends the programId arg.

## Styling Conventions
- `card` class: white rounded card with shadow (`bg-white rounded-2xl shadow-sm border border-gray-100 p-5`)
- `input` class: styled form input
- `btn-primary` / `btn-secondary`: styled buttons
- `brand-*` color scale: purple (brand-600 = #7c3aed)
- Mobile-first: max-w-lg mx-auto for content width

## Loading States
Use Next.js `loading.tsx` files for route-level loading skeletons.
Use `useTransition` in Client Components for action-level loading.
