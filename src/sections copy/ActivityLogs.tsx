import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';  
import { Timestamp } from 'firebase/firestore';  
import { Activity } from 'lucide-react';  
import { format } from 'date-fns';  
  
interface LogData {  
  id: string;  
  action: string;  
  performedBy: string;  
  targetId?: string;  
  timestamp?: Timestamp;  
}  
  
export function ActivityLogs() {  
  
  const { data: logs, loading } =  
    useRealtimeCollection<LogData>('activity_logs');  
  
  const sortedLogs = [...logs].sort((a, b) => {  
    const timeA = a.timestamp?.seconds || 0;  
    const timeB = b.timestamp?.seconds || 0;  
    return timeB - timeA;  
  });  
  
  return (  
    <div className="space-y-8">  
  
      <div className="flex items-center gap-3">  
        <Activity className="text-cyan-400" />  
        <h1 className="text-2xl font-bold">  
          Activity Logs (Audit Trail)  
        </h1>  
      </div>  
  
      <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">  
  
        {loading ? (  
          <div className="p-10 text-center text-white/40">  
            Loading logs...  
          </div>  
        ) : sortedLogs.length === 0 ? (  
          <div className="p-10 text-center text-white/40">  
            Belum ada aktivitas  
          </div>  
        ) : (  
          <div className="max-h-[600px] overflow-auto">  
            <table className="w-full text-sm">  
              <thead className="bg-black/20 text-white/60 sticky top-0">  
                <tr>  
                  <th className="p-4 text-left">Action</th>  
                  <th className="p-4 text-left">Performed By</th>  
                  <th className="p-4 text-left">Target</th>  
                  <th className="p-4 text-left">Waktu</th>  
                </tr>  
              </thead>  
              <tbody>  
                {sortedLogs.map(log => {  
  
                  const time =  
                    log.timestamp  
                      ? format(  
                          log.timestamp.toDate(),  
                          'dd MMM yyyy HH:mm:ss'  
                        )  
                      : '-';  
  
                  return (  
                    <tr key={log.id} className="border-t border-white/5">  
                      <td className="p-4 text-cyan-400">  
                        {log.action}  
                      </td>  
                      <td className="p-4 text-white/60">  
                        {log.performedBy}  
                      </td>  
                      <td className="p-4 text-white/40">  
                        {log.targetId || '-'}  
                      </td>  
                      <td className="p-4 text-white/40">  
                        {time}  
                      </td>  
                    </tr>  
                  );  
                })}  
              </tbody>  
            </table>  
          </div>  
        )}  
  
      </div>  
  
    </div>  
  );  
}
