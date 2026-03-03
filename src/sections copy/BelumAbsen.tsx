import { BelumAbsenList } from '@/components/BelumAbsenList';
import { FilterBar } from '@/components/FilterBar';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance } from '@/hooks/useAttendance';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function BelumAbsen() {
  const { selectedKelas, selectedDate } = useApp();
  const { siswa, loading: loadingSiswa } = useStudents(selectedKelas);
  const { absensi, loading: loadingAbsensi } = useAttendance(selectedDate, selectedKelas);

  // Calculate students who haven't checked in
  const belumAbsen = useMemo(() => {
    const absenRFIDs = new Set(absensi.map(a => a.uid_rfid));
    return siswa.filter(s => !absenRFIDs.has(s.uid_rfid));
  }, [siswa, absensi]);

  const loading = loadingSiswa || loadingAbsensi;

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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Belum Absen</h1>
          <p className="text-white/50 mt-1">
            Daftar siswa yang belum melakukan absensi hari ini
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Belum Absen List */}
      <BelumAbsenList siswa={belumAbsen} loading={loading} />
    </motion.div>
  );
}
