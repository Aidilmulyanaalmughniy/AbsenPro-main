// Mock data for demo purposes
import type { Siswa, Absensi, User } from '@/types';

export const mockSiswa: Siswa[] = [
  { id: '1', nama: 'Ahmad Fauzi', uid_rfid: 'RFID001', kelas: 'VII-A', createdAt: new Date() },
  { id: '2', nama: 'Budi Santoso', uid_rfid: 'RFID002', kelas: 'VII-A', createdAt: new Date() },
  { id: '3', nama: 'Citra Dewi', uid_rfid: 'RFID003', kelas: 'VII-A', createdAt: new Date() },
  { id: '4', nama: 'Dedi Pratama', uid_rfid: 'RFID004', kelas: 'VII-B', createdAt: new Date() },
  { id: '5', nama: 'Eka Sari', uid_rfid: 'RFID005', kelas: 'VII-B', createdAt: new Date() },
  { id: '6', nama: 'Fajar Nugroho', uid_rfid: 'RFID006', kelas: 'VII-C', createdAt: new Date() },
  { id: '7', nama: 'Gita Permata', uid_rfid: 'RFID007', kelas: 'VIII-A', createdAt: new Date() },
  { id: '8', nama: 'Hadi Wijaya', uid_rfid: 'RFID008', kelas: 'VIII-A', createdAt: new Date() },
  { id: '9', nama: 'Indah Lestari', uid_rfid: 'RFID009', kelas: 'VIII-B', createdAt: new Date() },
  { id: '10', nama: 'Joko Susilo', uid_rfid: 'RFID010', kelas: 'VIII-C', createdAt: new Date() },
  { id: '11', nama: 'Kartika Sari', uid_rfid: 'RFID011', kelas: 'IX-A', createdAt: new Date() },
  { id: '12', nama: 'Lutfi Hakim', uid_rfid: 'RFID012', kelas: 'IX-A', createdAt: new Date() },
  { id: '13', nama: 'Maya Anggraini', uid_rfid: 'RFID013', kelas: 'IX-B', createdAt: new Date() },
  { id: '14', nama: 'Nanda Pratama', uid_rfid: 'RFID014', kelas: 'IX-B', createdAt: new Date() },
  { id: '15', nama: 'Oscar Wijaya', uid_rfid: 'RFID015', kelas: 'VII-A', createdAt: new Date() },
];

export const mockAbsensi: Absensi[] = [
  { id: '1', uid_rfid: 'RFID001', nama: 'Ahmad Fauzi', kelas: 'VII-A', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
  { id: '2', uid_rfid: 'RFID002', nama: 'Budi Santoso', kelas: 'VII-A', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
  { id: '3', uid_rfid: 'RFID003', nama: 'Citra Dewi', kelas: 'VII-A', tanggal: new Date(), status: 'izin', createdAt: new Date() },
  { id: '4', uid_rfid: 'RFID004', nama: 'Dedi Pratama', kelas: 'VII-B', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
  { id: '5', uid_rfid: 'RFID005', nama: 'Eka Sari', kelas: 'VII-B', tanggal: new Date(), status: 'sakit', createdAt: new Date() },
  { id: '6', uid_rfid: 'RFID007', nama: 'Gita Permata', kelas: 'VIII-A', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
  { id: '7', uid_rfid: 'RFID008', nama: 'Hadi Wijaya', kelas: 'VIII-A', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
  { id: '8', uid_rfid: 'RFID009', nama: 'Indah Lestari', kelas: 'VIII-B', tanggal: new Date(), status: 'alpha', createdAt: new Date() },
  { id: '9', uid_rfid: 'RFID011', nama: 'Kartika Sari', kelas: 'IX-A', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
  { id: '10', uid_rfid: 'RFID012', nama: 'Lutfi Hakim', kelas: 'IX-A', tanggal: new Date(), status: 'hadir', createdAt: new Date() },
];

export const mockUsers: User[] = [
  { uid: 'admin1', username: 'admin', email: 'admin@absensipro.com', role: 'admin', createdAt: new Date() },
  { uid: 'dev1', username: 'developer', email: 'dev@absensipro.com', role: 'developer', createdAt: new Date() },
];
