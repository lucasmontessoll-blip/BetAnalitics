import { useEffect, useState } from 'react';
import { ArrowLeftRight, Trophy, AlertTriangle } from 'lucide-react';
import { buscarTransferenciasApiFootball, buscarTrofeusApiFootball, buscarSidelinedApiFootball } from '../../services/apiFootballExtraClient.js';

export default function JogadorExtras({ playerId, coachId }) {
  const [dados, setDados] = useState({ transferencias: [], trofeus: [], sidelined: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId && !coachId) return;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        const [transferencias, trofeus, sidelined] = await Promise.allSettled([
          playerId ? buscarTransferenciasApiFootball({ player: playerId, signal: controller.signal }) : Promise.resolve([]),
          buscarTrofeusApiFootball({ player: playerId || undefined, coach: coachId || undefined, signal: controller.signal }),
          buscarSidelinedApiFootball({ player: playerId || undefined, coach: coachId || undefined, signal: controller.signal }),
        ]);

        setDados({
          transferencias: transferencias.status === 'fulfilled' ? transferencias.value || [] : [],
          trofeus: trofeus.status === 'fulfilled' ? trofeus.value || [] : [],
          sidelined: sidelined.status === 'fulfilled' ? sidelined.value || [] : [],
        });
      } catch (e) {
        console.error('Erro extras jogador:', e);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [playerId, coachId]);

  if (loading) {
    return <div className="p-4 text-center text-xs font-black text-blue-400 animate-pulse">Carregando carreira...</div>;
  }

  const Card = ({ titulo, icon: Icon, cor, children }) => (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
      <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-3 ${cor}`}>
        <Icon className="w-3 h-3" />
        {titulo}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-3 mt-4">
      <Card titulo="Transferências" icon={ArrowLeftRight} cor="text-cyan-400">
        {dados.transferencias.length ? dados.transferencias.slice(0, 8).map((item, idx) => (
          <div key={`tr-${idx}`} className="bg-[#050816] rounded-xl p-3 border border-white/5 mb-2 last:mb-0">
            <div className="text-xs font-black text-white">{item?.player?.name || 'Jogador'}</div>
            {(item?.transfers || []).slice(0, 3).map((tr, i) => (
              <div key={`tr-in-${i}`} className="text-[10px] font-bold text-slate-400 mt-1">
                {tr?.date || '-'} • {tr?.teams?.out?.name || '-'} → {tr?.teams?.in?.name || '-'} • {tr?.type || '-'}
              </div>
            ))}
          </div>
        )) : <div className="text-xs font-bold text-slate-500">Sem transferências disponíveis.</div>}
      </Card>

      <Card titulo="Troféus" icon={Trophy} cor="text-yellow-400">
        {dados.trofeus.length ? dados.trofeus.slice(0, 10).map((t, idx) => (
          <div key={`tp-${idx}`} className="flex justify-between gap-2 text-[10px] font-bold text-slate-300 border-b border-white/5 py-2 last:border-b-0">
            <span className="truncate">{t?.league || t?.place || 'Troféu'}</span>
            <span className="text-yellow-300 whitespace-nowrap">{t?.season || '-'}</span>
          </div>
        )) : <div className="text-xs font-bold text-slate-500">Sem troféus disponíveis.</div>}
      </Card>

      <Card titulo="Sidelined / Marginalizado" icon={AlertTriangle} cor="text-red-400">
        {dados.sidelined.length ? dados.sidelined.slice(0, 8).map((s, idx) => (
          <div key={`sd-${idx}`} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-2 last:mb-0">
            <div className="text-xs font-black text-white">{s?.player?.name || s?.coach?.name || 'Registro'}</div>
            <div className="text-[10px] font-bold text-red-200">{s?.type || s?.reason || '-'}</div>
            <div className="text-[9px] font-bold text-slate-500">{s?.start || '-'} até {s?.end || '-'}</div>
          </div>
        )) : <div className="text-xs font-bold text-slate-500">Sem registros de sidelined.</div>}
      </Card>
    </div>
  );
}
