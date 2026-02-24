import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  async function signIn(formData: FormData) {
    'use server';

    const email = formData.get('email') as string;
    if (!email) return;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      redirect('/login?message=Could+not+send+magic+link');
    }

    redirect('/login?message=Check+your+email+for+a+magic+link');
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-3xl font-bold text-white">Supermom</h1>
          <p className="text-gray-400 mt-1">Your personal fitness tracker</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-5">
            We&apos;ll send you a magic link — no password needed.
          </p>

          {params.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                params.message.includes('Check')
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {params.message.replace(/\+/g, ' ')}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send magic link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
