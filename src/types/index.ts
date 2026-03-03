import { Timestamp } from 'firebase/firestore'

// ===============================
// ROLE SYSTEM
// ===============================

export type UserRole =
  | 'publik'
  | 'admin'
  | 'developer'
  | 'owner'

export const ROLE_LEVEL: Record<UserRole, number> = {
  publik: 0,
  admin: 1,
  developer: 2,
  owner: 3
}

// ===============================
// USER
// ===============================

export interface User {
  uid: string
  username: string
  email: string
  role: UserRole
  createdAt: Date | Timestamp
}

// ===============================
// SISWA
// ===============================

export interface Siswa {
  id: string
  nama: string
  uid_rfid: string
  kelas: string
  createdAt: Date | Timestamp
}

// ===============================
// ABSENSI
// ===============================

export type StatusAbsensi =
  | 'hadir'
  | 'izin'
  | 'sakit'
  | 'alpha'
  | 'terlambat'

export interface Absensi {
  id: string
  uid_rfid: string
  nama: string
  kelas: string
  tanggal: Date | Timestamp
  status: StatusAbsensi
  createdAt: Date | Timestamp
  updatedAt?: Date | Timestamp
  updatedBy?: string
  updatedByRole?: UserRole
}

// ===============================
// ACTIVITY LOG
// ===============================

export interface ActivityLog {
  id: string
  action: string
  performedBy: string
  performedByRole: UserRole
  targetId?: string
  timestamp: Date | Timestamp
}
// ===============================
// DEFAULT KELAS (STATIC)
// ===============================

export const KELAS_OPTIONS: string[] = [
  'X PPLG',
  'X DKV',
  'XI PPLG 1',
  'XI PPLG 2',
  'XI DKV'
]