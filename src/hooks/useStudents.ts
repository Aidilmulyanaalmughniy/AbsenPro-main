import { useState, useEffect, useCallback } from 'react'
import type { Siswa } from '@/types'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { canAccess } from '@/lib/permissions'
import { logActivity } from '@/lib/activityLogger'

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'

import { db } from '@/lib/firebase'

interface UseStudentsReturn {
  siswa: Siswa[]
  loading: boolean
  error: string | null
  addStudent: (data: Omit<Siswa, 'id' | 'createdAt'>) => Promise<void>
  updateStudent: (id: string, data: Partial<Siswa>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  importCSV: (file: File) => Promise<void>
  getStudentByRFID: (uid_rfid: string) => Siswa | undefined
}

export function useStudents(
  selectedKelas: string = 'all'
): UseStudentsReturn {

  const { userRole } = useAuth()

  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [loading, setLoading] = useState(true)

  // =========================
  // REALTIME LISTENER
  // =========================
  useEffect(() => {
    setLoading(true)

    const q =
      selectedKelas !== 'all'
        ? query(collection(db, 'siswa'), where('kelas', '==', selectedKelas))
        : collection(db, 'siswa')

    const unsubscribe = onSnapshot(q, snapshot => {
      const data: Siswa[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Siswa, 'id'>)
      }))

      setSiswa(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedKelas])

  // =========================
  // VALIDATE DUPLICATE RFID
  // =========================
  const isRFIDExist = (uid_rfid: string, excludeId?: string) => {
    return siswa.some(
      s => s.uid_rfid === uid_rfid && s.id !== excludeId
    )
  }

  // =========================
  // ADD STUDENT
  // =========================
  const addStudent = useCallback(async (
    data: Omit<Siswa, 'id' | 'createdAt'>
  ) => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin menambah siswa')
      return
    }

    if (isRFIDExist(data.uid_rfid)) {
      toast.error('UID RFID sudah terdaftar')
      return
    }

    const docRef = await addDoc(collection(db, 'siswa'), {
      ...data,
      createdAt: serverTimestamp()
    })

    await logActivity('ADD_SISWA', docRef.id)

    toast.success('Siswa berhasil ditambahkan')
  }, [userRole, siswa])

  // =========================
  // UPDATE STUDENT
  // =========================
  const updateStudent = useCallback(async (
    id: string,
    data: Partial<Siswa>
  ) => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin mengubah siswa')
      return
    }

    if (data.uid_rfid && isRFIDExist(data.uid_rfid, id)) {
      toast.error('UID RFID sudah dipakai')
      return
    }

    await updateDoc(doc(db, 'siswa', id), data)

    await logActivity('UPDATE_SISWA', id)

    toast.success('Data siswa diperbarui')
  }, [userRole, siswa])

  // =========================
  // DELETE STUDENT
  // =========================
  const deleteStudent = useCallback(async (id: string) => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin menghapus siswa')
      return
    }

    await deleteDoc(doc(db, 'siswa', id))

    await logActivity('DELETE_SISWA', id)

    toast.success('Siswa berhasil dihapus')
  }, [userRole])

  // =========================
  // IMPORT CSV (FIREBASE)
  // =========================
  const importCSV = useCallback(async (file: File) => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin import CSV')
      return
    }

    return new Promise<void>((resolve, reject) => {

      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n')
          const headers = lines[0].split(',').map(h => h.trim())

          let count = 0

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue

            const values = lines[i].split(',').map(v => v.trim())
            const student: any = {}

            headers.forEach((header, index) => {
              if (header === 'nama') student.nama = values[index]
              if (header === 'uid_rfid') student.uid_rfid = values[index]
              if (header === 'kelas') student.kelas = values[index]
            })

            if (
              student.nama &&
              student.uid_rfid &&
              student.kelas &&
              !isRFIDExist(student.uid_rfid)
            ) {

              await addDoc(collection(db, 'siswa'), {
                ...student,
                createdAt: serverTimestamp()
              })

              count++
            }
          }

          await logActivity('IMPORT_CSV_SISWA')

          toast.success(`${count} siswa berhasil diimpor`)
          resolve()

        } catch (error) {
          toast.error('Gagal mengimpor CSV')
          reject(error)
        }
      }

      reader.readAsText(file)
    })

  }, [userRole, siswa])

  const getStudentByRFID = useCallback(
    (uid_rfid: string) =>
      siswa.find(s => s.uid_rfid === uid_rfid),
    [siswa]
  )

  return {
    siswa,
    loading,
    error: null,
    addStudent,
    updateStudent,
    deleteStudent,
    importCSV,
    getStudentByRFID
  }
}