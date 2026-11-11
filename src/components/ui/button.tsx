import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-[#58298a] active:scale-[0.98]',
        destructive:
          'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98]',
        outline:
          'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]',
        secondary:
          'border border-violet-100 bg-violet-50 text-violet-900 hover:bg-violet-100 active:scale-[0.98]',
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        gold:
          'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-sm shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8.5 rounded-lg px-3 text-xs',
        lg: 'h-11.5 rounded-xl px-6 text-base font-bold',
        icon: 'h-9.5 w-9.5 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
