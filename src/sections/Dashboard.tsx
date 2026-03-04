import { TrendingUp, AlertTriangle, Award } from "lucide-react"
import { FilterBar } from "@/components/FilterBar"
import { WeeklyChart } from "@/components/WeeklyChart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useApp } from "@/context/AppContext"
import { motion } from "framer-motion"

export function Dashboard() {
  const { selectedKelas, selectedDate } = useApp()

  const {
    analytics,
    chartData,
    loading
  } = useAnalytics(selectedDate, selectedKelas)

  if (loading) {
    return (
      <div className="text-white/60 p-10">
        Memuat data analitik...
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Executive Analytics Dashboard
        </h1>
        <p className="text-white/50 mt-1">
          Analisis performa kehadiran siswa
        </p>
      </div>

      <FilterBar />

      {/* ================= KPI ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Average 7 Days */}
        <div className="rounded-3xl bg-[#1e293b]/60 border border-white/10 p-6 shadow-xl">
          <p className="text-white/50 text-sm">
            Rata-rata 7 Hari
          </p>
          <h2 className="text-4xl font-bold text-emerald-400 mt-3">
            {analytics.average7Days}%
          </h2>
        </div>

        {/* Weekly Trend */}
        <div className="rounded-3xl bg-[#1e293b]/60 border border-white/10 p-6 shadow-xl">
          <p className="text-white/50 text-sm">
            Perubahan Mingguan
          </p>
          <h2
            className={`text-4xl font-bold mt-3 ${
              analytics.weeklyTrend >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {analytics.weeklyTrend > 0 && "↑ "}
            {analytics.weeklyTrend}%
          </h2>
        </div>

        {/* Best Day */}
        <div className="rounded-3xl bg-[#1e293b]/60 border border-white/10 p-6 shadow-xl">
          <p className="text-white/50 text-sm flex items-center gap-2">
            <Award size={16} />
            Hari Terbaik
          </p>
          <h2 className="text-3xl font-bold text-cyan-400 mt-3">
            {analytics.bestDay}
          </h2>
        </div>

        {/* Risk Count */}
        <div className="rounded-3xl bg-[#1e293b]/60 border border-white/10 p-6 shadow-xl">
          <p className="text-white/50 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            Risiko Disiplin
          </p>
          <h2 className="text-3xl font-bold text-yellow-400 mt-3">
            {analytics.riskCount} Siswa
          </h2>
        </div>

      </div>

      {/* ================= WEEKLY TREND CHART ================= */}
      <div className="rounded-3xl bg-[#1e293b]/60 border border-white/10 p-8 shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-6">
          Tren Kehadiran 7 Hari
        </h3>

        <WeeklyChart
          labels={chartData.labels}
          data={chartData.data}
        />
      </div>

      {/* ================= INSIGHT PANEL ================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-8 shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-4">
          Insight Otomatis
        </h3>

        <p className="text-white/70 leading-relaxed">
          {analytics.insight}
        </p>

        <p className="text-white/40 text-sm mt-4">
          Hari terburuk minggu ini: {analytics.worstDay}
        </p>
      </div>

    </motion.div>
  )
}