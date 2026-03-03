import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function RealtimeBadge({ className, showLabel = true }: RealtimeBadgeProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-emerald-500/10 border border-emerald-500/20",
        className
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.75, 0, 0.75],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Realtime</span>
        </div>
      )}
    </div>
  );
}
