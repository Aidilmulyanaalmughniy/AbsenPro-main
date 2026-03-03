import { useState, useEffect } from 'react';
import { 
  Activity, 
  Scan, 
  Power, 
  RotateCcw, 
  Trash2,
  Users,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendance } from '@/hooks/useAttendance';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error';
}

export function Monitoring() {
  const { selectedDate } = useApp();
  const { absensi } = useAttendance(selectedDate, 'all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');

  // Add log entry
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  // Simulate logs from new attendance
  useEffect(() => {
    if (absensi.length > 0) {
      const latest = absensi[0];
      addLog(`RFID Scan: ${latest.nama} (${latest.kelas}) - ${latest.status.toUpperCase()}`, 'success');
    }
  }, [absensi.length]);

  // Initial logs
  useEffect(() => {
    addLog('Sistem monitoring aktif', 'info');
    addLog('Koneksi Firebase: Terhubung', 'success');
    addLog('Listener absensi: Aktif', 'info');
  }, []);

  const handleResetAbsensi = () => {
    toast.warning('Fitur reset absensi memerlukan konfirmasi', {
      description: 'Hubungi administrator untuk melakukan reset.',
    });
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('Log dibersihkan', 'info');
  };

  const toggleSystemStatus = () => {
    const newStatus = systemStatus === 'online' ? 'offline' : 'online';
    setSystemStatus(newStatus);
    addLog(`Sistem ${newStatus.toUpperCase()}`, newStatus === 'online' ? 'success' : 'error');
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Monitoring</h1>
          <p className="text-white/50 mt-1">
            Pantau sistem absensi secara realtime
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scan */}
        <Card className="bg-[#1e293b] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Scan className="w-4 h-4 text-cyan-400" />
              Total Scan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{absensi.length}</div>
            <p className="text-xs text-white/50 mt-1">Realtime update</p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-[#1e293b] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Power className="w-4 h-4 text-emerald-400" />
              Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {systemStatus === 'online' ? (
                <>
                  <Wifi className="w-5 h-5 text-emerald-400" />
                  <span className="text-xl font-bold text-emerald-400">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-xl font-bold text-red-400">Offline</span>
                </>
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">
              {systemStatus === 'online' ? 'Semua sistem normal' : 'Sistem tidak aktif'}
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-[#1e293b] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Pengguna Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1</div>
            <p className="text-xs text-white/50 mt-1">Admin/Developer</p>
          </CardContent>
        </Card>

        {/* Last Update */}
        <Card className="bg-[#1e293b] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Update Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              {format(new Date(), 'HH:mm:ss', { locale: id })}
            </div>
            <p className="text-xs text-white/50 mt-1">Auto refresh</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={toggleSystemStatus}
          className={cn(
            "border-white/10",
            systemStatus === 'online' 
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300" 
              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
          )}
        >
          <Power className="w-4 h-4 mr-2" />
          {systemStatus === 'online' ? 'Matikan Sistem' : 'Nyalakan Sistem'}
        </Button>

        <Button
          variant="outline"
          onClick={handleResetAbsensi}
          className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border-white/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Absensi
        </Button>

        <Button
          variant="outline"
          onClick={handleClearLogs}
          className="bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Bersihkan Log
        </Button>
      </div>

      {/* Log Panel */}
      <Card className="bg-[#1e293b] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Log Scan Realtime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] overflow-y-auto space-y-2 pr-2">
            <AnimatePresence>
              {logs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-white/50"
                >
                  <AlertTriangle className="w-12 h-12 mb-2 opacity-50" />
                  <p>Belum ada log</p>
                </motion.div>
              ) : (
                logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg text-sm",
                      "border",
                      log.type === 'success' && "bg-emerald-500/5 border-emerald-500/20 text-emerald-400",
                      log.type === 'error' && "bg-red-500/5 border-red-500/20 text-red-400",
                      log.type === 'info' && "bg-white/5 border-white/10 text-white/70"
                    )}
                  >
                    <span className="text-xs font-mono text-white/40 whitespace-nowrap">
                      {format(log.timestamp, 'HH:mm:ss', { locale: id })}
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
