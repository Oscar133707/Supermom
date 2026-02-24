'use client';

import { useState, useTransition } from 'react';
import { completeSession, uncompleteSession } from '@/actions/workouts';
import { cn } from '@/lib/utils';

interface Props {
  sessionId: string;
  completed: boolean;
}

export function CompleteSessionButton({ sessionId, completed: initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (completed) {
        await uncompleteSession(sessionId);
        setCompleted(false);
      } else {
        await completeSession(sessionId);
        setCompleted(true);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'w-full py-3 rounded-xl font-semibold text-sm transition-all',
        completed
          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30 hover:bg-green-500/30'
          : 'bg-brand-400 text-black hover:bg-brand-500',
        'disabled:opacity-60 disabled:cursor-not-allowed',
      )}
    >
      {isPending ? (
        <span>Saving…</span>
      ) : completed ? (
        <span>✅ Completed — tap to undo</span>
      ) : (
        <span>Mark as Complete</span>
      )}
    </button>
  );
}
