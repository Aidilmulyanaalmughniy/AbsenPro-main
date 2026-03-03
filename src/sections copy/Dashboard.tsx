import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { FilterBar } from '@/components/FilterBar';
import { WeeklyChart } from '@/components/WeeklyChart';
import { useStats } from '@/hooks/useStats';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { selectedKelas, selectedDate } = useApp();
  const { stats, chartData } = useStats(selectedDate, selectedKelas);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">
            Ringkasan data absensi siswa secara realtime
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Siswa"
          value={stats.totalSiswa}
          icon={Users}
          color="cyan"
          delay={0}
        />
        <StatCard
          title="Hadir Hari Ini"
          value={stats.hadirHariIni}
          icon={UserCheck}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Belum Absen"
          value={stats.belumAbsen}
          icon={UserX}
          color="red"
          delay={0.2}
        />
        <StatCard
          title="Persentase Kehadiran"
          value={stats.persentaseKehadiran}
          suffix="%"
          icon={TrendingUp}
          color="cyan"
          delay={0.3}
        />
      </div>

      {/* Chart */}
      <WeeklyChart labels={chartData.labels} data={chartData.data} />
    </motion.div>
  );
}
