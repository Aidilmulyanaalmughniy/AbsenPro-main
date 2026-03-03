import { useMemo } from 'react'
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection'
import { Timestamp } from 'firebase/firestore'
import {
  Activity,
  PlusCircle,
  Trash2,
  Edit,
  Shield,
  User,
  Database
} from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface LogData {
  id: string
  action: string
  performedBy: string
  targetId?: string
  timestamp?: Timestamp
}

export function ActivityLogs() {

  const { data: logs, loading } =
    useRealtimeCollection<LogData>('activity_logs')

  // Sort terbaru di atas
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [logs])

  // Icon per action
  const getIcon = (action: string) => {
    if (action.includes('ADD')) return <PlusCircle size={16} />
    if (action.includes('DELETE')) return <Trash2 size={16} />
    if (action.includes('UPDATE')) return <Edit size={16} />
    if (action.includes('ROLE')) return <Shield size={16} />
    return <Database size={16} />
  }

  // Badge warna per action
  const getBadgeColor = (action: string) => {
    if (action.includes('ADD'))
      return 'bg-emerald-500/10 text-emerald-400'
    if (action.includes('DELETE'))
      return 'bg-red-500/10 text-red-400'
    if (action.includes('UPDATE'))
      return 'bg-yellow-500/10 text-yellow-400'
    if (action.includes('ROLE'))
      return 'bg-purple-500/10 text-purple-400'
    return 'bg-cyan-500/10 text-cyan-400'
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Activity className="text-cyan-400" />
        <h1 className="text-3xl font-bold tracking-tight">
          Activity Logs
        </h1>
      </div>

      {/* CARD CONTAINER */}
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl">

        {loading ? (
          <div className="py-20 text-center text-white/40">
            Loading logs...
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="py-20 text-center text-white/40">
            Belum ada aktivitas
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-auto pr-2">

            {sortedLogs.map((log, index) => {

              const time = log.timestamp
                ? format(
                    log.timestamp.toDate(),
                    'dd MMM yyyy • HH:mm:ss'
                  )
                : '-'

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0f172a]/80 backdrop-blur border border-white/10 rounded-xl p-4 flex justify-between items-center shadow-md"
                >
                  {/* LEFT */}
                  <div className="flex items-start gap-4">

                    <div className={`p-2 rounded-lg ${getBadgeColor(log.action)}`}>
                      {getIcon(log.action)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>

                      <div className="text-sm text-white/70">
                        <span className="text-white font-medium">
                          {log.performedBy}
                        </span>
                        {log.targetId && (
                          <>
                            {' '}→{' '}
                            <span className="text-white/50">
                              {log.targetId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-xs text-white/40 whitespace-nowrap">
                    {time}
                  </div>

                </motion.div>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}