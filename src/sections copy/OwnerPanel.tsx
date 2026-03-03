import { useState } from 'react';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { db } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Trash2, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'developer' | 'owner';
}

export function OwnerPanel() {

  const { data: users, loading } =
    useRealtimeCollection<UserData>('users');

  const { user } = useAuth();

  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (id: string, role: string) => {

    if (!user || user.uid === id) {
      toast.error('Tidak bisa mengubah role sendiri');
      return;
    }

    setUpdating(true);

    await updateDoc(doc(db, 'users', id), {
      role
    });

    toast.success('Role berhasil diubah');
    setUpdating(false);
  };

  const handleDelete = async (id: string) => {

    if (!user || user.uid === id) {
      toast.error('Tidak bisa menghapus akun sendiri');
      return;
    }

    if (!confirm('Yakin ingin menghapus user ini?')) return;

    await deleteDoc(doc(db, 'users', id));

    toast.success('User berhasil dihapus');
  };

  return (
    <div className="space-y-8">

      <div className="flex items-center gap-3">
        <Crown className="text-yellow-400" />
        <h1 className="text-2xl font-bold">
          Owner Panel – User Management
        </h1>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-white/40">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-white/40">
            Tidak ada user
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-black/20 text-white/60">
              <tr>
                <th className="p-4 text-left">Username</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-white/5">

                  <td className="p-4">{u.username}</td>
                  <td className="p-4 text-white/60">{u.email}</td>

                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={user?.uid === u.id || updating}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value)
                      }
                      className="bg-black/30 px-3 py-1 rounded"
                    >
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={user?.uid === u.id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-30"
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