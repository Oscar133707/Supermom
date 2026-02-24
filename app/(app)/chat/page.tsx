import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">AI Coach</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask anything about your workouts or diet.
        </p>
      </div>
      <ChatWindow />
    </div>
  );
}
