import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

interface Props {
  hadir: number
  tidakHadir: number
  belumAbsen: number
}

export function AttendanceDonutChart({
  hadir,
  tidakHadir,
  belumAbsen
}: Props) {

  const data = [
    { name: 'Hadir', value: hadir, color: '#10B981' },
    { name: 'Tidak Hadir', value: tidakHadir, color: '#EF4444' },
    { name: 'Belum Absen', value: belumAbsen, color: '#F59E0B' }
  ]

  const total = hadir + tidakHadir + belumAbsen

  const persen =
    total > 0 ? Math.round((hadir / total) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 shadow-2xl"
    >

      {/* TITLE */}
      <h2 className="text-white font-semibold mb-6">
        Distribusi Kehadiran Hari Ini
      </h2>

      {/* CHART */}
      <div className="relative h-72">

        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={75}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: 'drop-shadow(0px 0px 6px rgba(255,255,255,0.1))'
                  }}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* CENTER SMART DISPLAY */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

          <motion.span
            key={persen}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-white"
          >
            {persen}%
          </motion.span>

          <span className="text-xs text-white/50 mt-1">
            {total} Siswa
          </span>

        </div>

      </div>

      {/* LEGEND PREMIUM */}
      <div className="mt-6 space-y-3 text-sm">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-white/70">
                {item.name}
              </span>
            </div>

            <span className="text-white font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>

    </motion.div>
  )
}