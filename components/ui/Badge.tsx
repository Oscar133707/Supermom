import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'success' | 'warning' | 'info' | 'default';
  className?: string;
}

const variants = {
  lime:    'bg-brand-400/20 text-brand-400',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  info:    'bg-blue-500/20 text-blue-400',
  default: 'bg-surface-raised text-gray-300',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
