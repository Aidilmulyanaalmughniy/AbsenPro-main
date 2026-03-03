import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { usePermission } from './usePermission'
import { toast } from 'sonner'

export function useStudents() {
  const { can } = usePermission()

  const isRFIDExist = async (uid_rfid: string) => {
    const q = query(
      collection(db, 'siswa'),
      where('uid_rfid', '==', uid_rfid)
    )
    const snap = await getDocs(q)
    return !snap.empty
  }

  const ensureKelasExist = async (namaKelas: string) => {
    const q = query(
      collection(db, 'kelas'),
      where('nama', '==', namaKelas)
    )
    const snap = await getDocs(q)

    if (snap.empty) {
      await addDoc(collection(db, 'kelas'), { nama: namaKelas })
    }
  }

  const addStudent = async (data: {
    nama: string
    uid_rfid: string
    kelas: string
  }) => {
    if (!can('developer')) return

    if (await isRFIDExist(data.uid_rfid)) {
      toast.error('UID RFID sudah terdaftar')
      return
    }

    await ensureKelasExist(data.kelas)

    await addDoc(collection(db, 'siswa'), {
      ...data,
      createdAt: new Date()
    })

    toast.success('Siswa berhasil ditambahkan')
  }

  const editStudent = async (id: string, data: any) => {
    if (!can('developer')) return
    await updateDoc(doc(db, 'siswa', id), data)
  }

  const deleteStudent = async (id: string) => {
    if (!can('developer')) return
    await deleteDoc(doc(db, 'siswa', id))
  }

  const importCSV = async (file: File) => {
    if (!can('developer')) return

    const text = await file.text()
    const lines = text.split('\n').slice(1)

    const batch = writeBatch(db)
    let count = 0

    for (const line of lines) {
      if (!line.trim()) continue

      const [nama, uid_rfid, kelas] = line.split(',')

      const exists = await isRFIDExist(uid_rfid.trim())
      if (exists) continue

      await ensureKelasExist(kelas.trim())

      const newRef = doc(collection(db, 'siswa'))

      batch.set(newRef, {
        nama: nama.trim(),
        uid_rfid: uid_rfid.trim(),
        kelas: kelas.trim(),
        createdAt: new Date()
      })

      count++
    }

    await batch.commit()

    toast.success(`${count} siswa berhasil diimpor`)
  }

  return { addStudent, editStudent, deleteStudent, importCSV }
}