'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/programs', label: 'Programs', icon: '📋' },
  { href: '/admin/assign', label: 'Assign Program', icon: '🎯' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen flex flex-col" style={{ backgroundColor: '#141414', borderRight: '1px solid #2A2A2A' }}>
      <div className="p-5" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center mb-2">
          <span className="text-black font-bold text-sm">S</span>
        </div>
        <div className="font-bold text-lg text-white">Supermom</div>
        <div className="text-xs text-gray-500">Admin Panel</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-400/20 text-brand-400'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]',
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid #2A2A2A' }}>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
        >
          <span>👤</span>
          <span>View as Mom</span>
        </Link>
      </div>
    </aside>
  );
}
