import { ShieldX } from 'lucide-react';

interface Props {
  text?: string;
}

export function AccessDenied({
  text = 'Anda tidak memiliki akses ke halaman ini'
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShieldX size={60} className="text-red-400 mb-4" />
      <h2 className="text-xl font-semibold text-red-400 mb-2">
        Access Denied
      </h2>
      <p className="text-white/60">{text}</p>
    </div>
  );
}