import { DollarSign, Radio } from 'lucide-react';

function extrairMercados(lista = []) {
  const mercados = [];

  for (const item of lista || []) {
    if (Array.isArray(item?.bookmakers)) {
      for (const book of item.bookmakers) {
        for (const bet of book?.bets || []) {
          mercados.push({
            casa: book.name,
            mercado: bet.name,
            valores: bet.values || [],
            live: false,
          });
        }
      }
    }

    if (Array.isArray(item?.odds)) {
      for (const odd of item.odds) {
        mercados.push({
          casa: item?.bookmaker?.name || item?.bookmaker || 'Live',
          mercado: odd?.name || odd?.bet || 'Mercado ao vivo',
          valores: odd?.values || odd?.odds || [],
          live: true,
        });
      }
    }
  }

  return mercados.slice(0, 12);
}

export default function OddsLiveCard({ odds = [], oddsLive = [] }) {
  const pre = extrairMercados(odds);
  const live = extrairMercados(oddsLive);

  if (!pre.length && !live.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Odds pré-jogo ou ao vivo ainda não disponíveis neste plano/partida.
      </div>
    );
  }

  const Bloco = ({ titulo, icon: Icon, lista, cor }) => (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-4">
      <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-4 ${cor}`}>
        <Icon className="w-3 h-3" />
        {titulo}
      </div>

      <div className="space-y-2">
        {lista.map((m, index) => (
          <div key={`${m.casa}-${m.mercado}-${index}`} className="bg-[#050816] border border-white/5 rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <div className="text-xs font-black text-white">{m.mercado}</div>
                <div className="text-[9px] font-bold text-slate-500">{m.casa}</div>
              </div>
              {m.live && <span className="text-[8px] font-black uppercase px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/20">Live</span>}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(m.valores || []).slice(0, 6).map((v, i) => (
                <div key={`${v?.value || v?.label || i}`} className="min-w-[74px] bg-[#101827] rounded-xl p-2 text-center border border-white/5">
                  <div className="text-[8px] font-black text-slate-500 uppercase truncate">{v?.value || v?.label || v?.name || '-'}</div>
                  <div className="text-sm font-black text-yellow-400">{v?.odd || v?.price || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {live.length > 0 && <Bloco titulo="Odds ao vivo" icon={Radio} lista={live} cor="text-red-400" />}
      {pre.length > 0 && <Bloco titulo="Cotações pré-jogo" icon={DollarSign} lista={pre} cor="text-yellow-400" />}
    </div>
  );
}
