import { AttendanceTable } from '@/components/AttendanceTable';
import { ExportDropdown } from '@/components/ExportDropdown';
import { FilterBar } from '@/components/FilterBar';
import { useAttendance } from '@/hooks/useAttendance';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export function DataAbsensi() {
  const { selectedKelas, selectedDate, userRole } = useApp();
  const { absensi, loading, deleteAbsensi } = useAttendance(selectedDate, selectedKelas);

  const canExport = userRole === 'admin' || userRole === 'developer';
  const canManage = userRole === 'developer';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Data Absensi
          </h1>
          <p className="text-white/50 mt-1">
            Lihat dan kelola data absensi siswa
          </p>
        </div>

        {canExport && (
          <ExportDropdown 
            data={absensi} 
            selectedKelas={selectedKelas}
            selectedDate={selectedDate}
          />
        )}
      </div>

      <FilterBar />

      <AttendanceTable 
        data={absensi} 
        userRole={userRole}
        onDelete={canManage ? deleteAbsensi : undefined}
        loading={loading}
      />
    </motion.div>
  );
}