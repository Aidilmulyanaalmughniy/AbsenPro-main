import { Timestamp } from "firebase/firestore"

/* ===============================
   ROLE SYSTEM
=============================== */

export type UserRole =
  | "publik"
  | "admin"
  | "developer"
  | "owner"

export const ROLE_LEVEL: Record<UserRole, number> = {
  publik: 0,
  admin: 1,
  developer: 2,
  owner: 3
}

/* ===============================
   USER
=============================== */

export interface User {
  uid: string
  username: string
  email: string
  role: UserRole
  createdAt?: Timestamp
}

/* ===============================
   SISWA
=============================== */

export interface Siswa {
  id: string
  nama: string
  uid_rfid: string
  kelas: string
  createdAt?: Timestamp
}

/* ===============================
   STATUS ABSENSI
=============================== */

export type StatusAbsensi =
  | "hadir"
  | "izin"
  | "sakit"
  | "alpha"
  | "terlambat"

/* ===============================
   ABSENSI
=============================== */

export interface Absensi {
  id: string
  uid_rfid: string
  nama: string
  kelas: string

  tanggal: Timestamp
  waktu_scan?: Timestamp

  status: StatusAbsensi

  terlambatMenit?: number | null

  manual?: boolean

  createdAt?: Timestamp
  updatedAt?: Timestamp

  updatedBy?: string
  updatedByRole?: UserRole
}

/* ===============================
   ACTIVITY LOG
=============================== */

export interface ActivityLog {
  id: string
  action: string
  performedBy: string
  performedByRole: UserRole
  targetId?: string
  timestamp: Timestamp
}

/* ===============================
   DASHBOARD STATS
=============================== */

export interface StatData {
  totalSiswa: number
  hadirHariIni: number
  belumAbsen: number
  persentaseKehadiran: number
}

export interface ChartData {
  labels: string[]
  data: number[]
}

/* ===============================
   DEFAULT KELAS
=============================== */

export const KELAS_OPTIONS: string[] = [
  "X PPLG",
  "X DKV",
  "XI PPLG 1",
  "XI PPLG 2",
  "XI DKV"
]