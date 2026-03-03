import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  color: 'cyan' | 'emerald' | 'red' | 'amber' | 'blue';
  trend?: number;
  delay?: number;
}

const colorVariants = {
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
};

export function StatCard({ 
  title, 
  value, 
  suffix = '', 
  icon: Icon, 
  color, 
  trend,
  delay = 0 
}: StatCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "relative overflow-hidden rounded-[20px] p-6",
        "bg-[#1e293b] border border-white/5",
        "shadow-lg shadow-black/20",
        "transition-shadow duration-300",
        "hover:shadow-xl hover:shadow-black/30",
        "group"
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-br from-transparent via-transparent to-white/5"
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colors.bg,
            colors.border,
            "border"
          )}>
            <Icon className={cn("w-6 h-6", colors.text)} />
          </div>
          
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-3xl font-bold text-white"
          >
            {value.toLocaleString()}{suffix}
          </motion.h3>
          <p className="text-sm text-white/50">{title}</p>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className={cn(
        "absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20",
        colors.bg.replace('/10', '')
      )} />
    </motion.div>
  );
}
