import { AlertTriangle } from 'lucide-react';

export default function LesoesCard({ injuries = [] }) {
  if (!Array.isArray(injuries) || !injuries.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Nenhuma lesao informada pela API-Football para esta partida.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5 mb-4">
        <AlertTriangle className="w-3 h-3" />
        Lesoes e desfalques
      </div>

      <div className="space-y-2">
        {injuries.map((item, index) => (
          <div key={`${item?.player?.id || index}-${item?.team?.id || ''}`} className="bg-[#050816] border border-red-500/10 rounded-2xl p-3 flex items-center gap-3">
            <img src={item?.team?.logo} className="w-8 h-8 object-contain flex-shrink-0" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-white truncate">{item?.player?.name || 'Jogador'}</div>
              <div className="text-[10px] font-bold text-slate-500 truncate">{item?.team?.name || '-'} • {item?.league?.name || '-'}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black uppercase text-red-300">{item?.type || 'Lesao'}</div>
              <div className="text-[9px] font-bold text-slate-500 max-w-[110px] truncate">{item?.reason || '-'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
