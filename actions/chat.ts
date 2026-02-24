'use server';

import { createClient } from '@/lib/supabase/server';
import type { ChatMessage } from '@/lib/types';

export async function getChatHistory(): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(100);

  return (data ?? []) as ChatMessage[];
}

export async function sendChatMessage(content: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  // Save user message
  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role: 'user',
    content,
  });

  // ─── PLACEHOLDER: Replace this block with OpenAI / Claude API call in Phase 4 ───
  const assistantContent =
    "I'm still being set up! Oscar will connect me to an AI soon. " +
    'In the meantime, keep up the great work! 💪';
  // ─────────────────────────────────────────────────────────────────────────────────

  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role: 'assistant',
    content: assistantContent,
  });

  return assistantContent;
}
