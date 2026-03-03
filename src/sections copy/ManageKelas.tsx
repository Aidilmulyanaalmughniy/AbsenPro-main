import { useState } from 'react';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Kelas {
  id: string;
  nama: string;
}

export function ManageKelas() {

  const { data: kelasList, loading } =
    useRealtimeCollection<Kelas>('kelas');

  const [newKelas, setNewKelas] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newKelas.trim()) return;

    await addDoc(collection(db, 'kelas'), {
      nama: newKelas
    });

    toast.success('Kelas berhasil ditambahkan');
    setNewKelas('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kelas ini?')) return;

    await deleteDoc(doc(db, 'kelas', id));
    toast.success('Kelas berhasil dihapus');
  };

  const handleUpdate = async () => {
    if (!editId || !editValue.trim()) return;

    await updateDoc(doc(db, 'kelas', editId), {
      nama: editValue
    });

    toast.success('Kelas diperbarui');
    setEditId(null);
  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Manage Kelas</h1>

      {/* ADD FORM */}
      <div className="flex gap-3">
        <input
          value={newKelas}
          onChange={e => setNewKelas(e.target.value)}
          placeholder="Nama kelas baru..."
          className="flex-1 px-4 py-2 bg-[#1e293b] rounded-lg border border-white/10"
        />
        <button
          onClick={handleAdd}
          className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Tambah
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-white/40">
            Loading...
          </div>
        ) : kelasList.length === 0 ? (
          <div className="p-10 text-center text-white/40">
            Belum ada kelas
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-black/20 text-white/60">
              <tr>
                <th className="p-4 text-left">Nama Kelas</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kelasList.map(k => (
                <tr key={k.id} className="border-t border-white/5">
                  <td className="p-4">
                    {editId === k.id ? (
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="px-2 py-1 bg-black/30 rounded"
                      />
                    ) : (
                      k.nama
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-3">

                    {editId === k.id ? (
                      <button
                        onClick={handleUpdate}
                        className="text-green-400"
                      >
                        Simpan
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditId(k.id);
                          setEditValue(k.nama);
                        }}
                        className="text-cyan-400"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(k.id)}
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}