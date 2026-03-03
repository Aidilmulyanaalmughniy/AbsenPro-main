import { useState, useEffect, useCallback } from 'react'
import type { Absensi } from '@/types'
import { toast } from 'sonner'
import { startOfDay, endOfDay, format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { canAccess } from '@/lib/permissions'
import { logActivity } from '@/lib/activityLogger'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UseAttendanceReturn {
  absensi: Absensi[]
  loading: boolean
  error: string | null
  addAbsensi: (data: Omit<Absensi, 'id' | 'createdAt' | 'status'>) => Promise<void>
  deleteAbsensi: (id: string) => Promise<void>
  updateStatus: (id: string, status: Absensi['status']) => Promise<void>
  generateAlpha: () => Promise<void>
}

export function useAttendance(
  selectedDate: Date = new Date(),
  selectedKelas: string = 'all'
): UseAttendanceReturn {

  const { userRole } = useAuth()
  const [absensi, setAbsensi] = useState<Absensi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ======================================
  // REALTIME LISTENER
  // ======================================

  useEffect(() => {

    setLoading(true)

    const startDate = startOfDay(selectedDate)
    const endDate = endOfDay(selectedDate)

    const q = query(
      collection(db, 'absensi'),
      where('tanggal', '>=', Timestamp.fromDate(startDate)),
      where('tanggal', '<=', Timestamp.fromDate(endDate))
    )

    const unsubscribe = onSnapshot(q, snapshot => {

      let data: Absensi[] = snapshot.docs.map(docSnap => {
        const raw = docSnap.data()
        return {
          id: docSnap.id,
          ...raw,
          tanggal: raw.tanggal?.toDate?.() ?? raw.tanggal,
          createdAt: raw.createdAt?.toDate?.() ?? raw.createdAt,
          waktu_scan: raw.waktu_scan?.toDate?.() ?? raw.waktu_scan
        } as unknown as Absensi
      })

      if (selectedKelas !== 'all') {
        data = data.filter(a => a.kelas === selectedKelas)
      }

      setAbsensi(data)
      setLoading(false)
    })

    return () => unsubscribe()

  }, [selectedDate, selectedKelas])

  // ======================================
  // DETERMINE STATUS (ONLY HERE)
  // ======================================

  const determineStatus = () => {

    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()

    const hadirEnd = 6 * 60 + 35      // 06:35
    const terlambatEnd = 15 * 60 + 10 // 15:10

    if (minutes < hadirEnd) return 'hadir'
    if (minutes >= hadirEnd && minutes <= terlambatEnd) return 'terlambat'

    return 'alpha'
  }

  // ======================================
  // ADD ABSENSI (SCAN RFID)
  // ======================================

  const addAbsensi = useCallback(async (
    data: Omit<Absensi, 'id' | 'createdAt' | 'status'>
  ) => {

    if (!canAccess(userRole, 'admin')) {
      toast.error('Tidak memiliki izin')
      return
    }

    try {

      const now = new Date()
      const today = startOfDay(now)
      const status = determineStatus()

      const id = `${data.uid_rfid}_${format(today, 'yyyyMMdd')}`

      await setDoc(doc(db, 'absensi', id), {
        ...data,
        status,
        waktu_scan: Timestamp.fromDate(now),
        tanggal: Timestamp.fromDate(today),
        createdAt: serverTimestamp()
      }, { merge: true })

      await logActivity('ADD_ABSENSI', id)
      toast.success('Absensi berhasil disimpan')

    } catch {
      toast.error('Gagal menyimpan absensi')
    }

  }, [userRole])

  // ======================================
  // UPDATE STATUS (IZIN / SAKIT)
  // ======================================

  const updateStatus = useCallback(async (
    id: string,
    status: Absensi['status']
  ) => {

    try {
      await updateDoc(doc(db, 'absensi', id), { status })
      await logActivity('UPDATE_STATUS', id)
      toast.success('Status diperbarui')
    } catch {
      toast.error('Gagal update status')
    }

  }, [])

  // ======================================
  // DELETE
  // ======================================

  const deleteAbsensi = useCallback(async (id: string) => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin')
      return
    }

    try {
      await deleteDoc(doc(db, 'absensi', id))
      await logActivity('DELETE_ABSENSI', id)
      toast.success('Absensi dihapus')
    } catch {
      toast.error('Gagal menghapus')
    }

  }, [userRole])

  // ======================================
  // AUTO GENERATE ALPHA AFTER 15:10
  // ======================================

  const generateAlpha = useCallback(async () => {

    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()
    const terlambatEnd = 15 * 60 + 10

    if (minutes < terlambatEnd) return

    try {

      const siswaSnap = await getDocs(collection(db, 'siswa'))
      const today = startOfDay(now)

      const absensiSnap = await getDocs(
        query(
          collection(db, 'absensi'),
          where('tanggal', '>=', Timestamp.fromDate(today)),
          where('tanggal', '<=', Timestamp.fromDate(endOfDay(today)))
        )
      )

      const existingIds = absensiSnap.docs.map(d => d.id)

      for (const siswaDoc of siswaSnap.docs) {

        const siswaData = siswaDoc.data()
        const id = `${siswaData.uid_rfid}_${format(today, 'yyyyMMdd')}`

        if (!existingIds.includes(id)) {

          await setDoc(doc(db, 'absensi', id), {
            uid_rfid: siswaData.uid_rfid,
            nama: siswaData.nama,
            kelas: siswaData.kelas,
            status: 'alpha',
            tanggal: Timestamp.fromDate(today),
            createdAt: serverTimestamp()
          })

        }
      }

      await logActivity('GENERATE_ALPHA')

    } catch {
      console.log('Alpha generation skipped')
    }

  }, [])

  // ======================================
  // AUTO CHECK EVERY MINUTE
  // ======================================

  useEffect(() => {
    const interval = setInterval(() => {
      generateAlpha()
    }, 60000)

    return () => clearInterval(interval)
  }, [generateAlpha])

  return {
    absensi,
    loading,
    error,
    addAbsensi,
    deleteAbsensi,
    updateStatus,
    generateAlpha
  }
}