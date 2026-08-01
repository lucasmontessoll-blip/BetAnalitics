import React from 'react';
import { Landmark, Star, ShieldCheck, ExternalLink, Gift, AlertTriangle, TrendingUp } from 'lucide-react';

const casas = [
  {
    nome: 'Bet365',
    bonus: 'Oferta afiliada a configurar',
    destaque: 'Boa cobertura de mercados',
    odd: '1.82',
    link: '',
  },
  {
    nome: 'Betano',
    bonus: 'Oferta afiliada a configurar',
    destaque: 'Popular no Brasil',
    odd: '1.85',
    link: '',
  },
  {
    nome: 'KTO',
    bonus: 'Oferta afiliada a configurar',
    destaque: 'Foco em apostas esportivas',
    odd: '1.88',
    link: '',
  },
];

export default function CasasParceirasPro({ setViewMode }) {
  const abrir = (casa) => {
    if (!casa.link) {
      setViewMode?.('config');
      return;
    }

    window.open(casa.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-4">
        

        <div>
          <div className="text-xl font-black text-white">Casas Parceiras</div>
          <div className="text-[11px] text-slate-500 font-bold">Afiliados, odds e ofertas</div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-purple-700 via-blue-800 to-slate-950 border border-purple-300/20 p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-purple-100 mb-3">
            <Landmark className="w-4 h-4" />
            Monetização
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">
            Área comercial de parceiros
          </h1>

          <p className="text-xs text-purple-100/80 font-semibold mt-3 leading-relaxed">
            Use esta tela para exibir casas parceiras, melhores odds, ofertas e links afiliados.
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 mb-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <div className="text-xs font-black text-amber-300 uppercase">Links ainda precisam ser configurados</div>
          <div className="text-[11px] text-amber-100/70 font-semibold mt-1 leading-relaxed">
            Troque os placeholders pelos seus links reais de afiliado antes de usar comercialmente.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {casas.map((casa, index) => (
          <div key={casa.nome} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                <Landmark className="w-7 h-7 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-black text-white truncate">{casa.nome}</div>

                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-black">{(4.8 - index * 0.1).toFixed(1)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-bold mt-1">
                  {casa.destaque}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-[#050816] border border-white/10 rounded-2xl p-3">
                    <div className="text-[9px] text-slate-600 font-black uppercase">Odd exemplo</div>
                    <div className="text-xl font-black text-emerald-400">{casa.odd}</div>
                  </div>

                  <div className="bg-[#050816] border border-white/10 rounded-2xl p-3">
                    <div className="text-[9px] text-slate-600 font-black uppercase">Oferta</div>
                    <div className="text-xs font-black text-purple-300 truncate">{casa.bonus}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => abrir(casa)}
                className="h-12 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {casa.link ? 'Abrir casa' : 'Configurar link'}
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode?.('banca-pro')}
                className="h-12 rounded-2xl bg-[#050816] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Ver banca
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mt-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-sm font-black text-white">Jogo responsável</div>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold leading-relaxed">
          Esta tela deve sempre mostrar aviso +18, risco de perda financeira e orientação de banca. Links afiliados não devem prometer lucro.
        </div>
      </div>

      <button
        type="button"
        onClick={() => setViewMode?.('vip-pro')}
        className="w-full h-14 rounded-2xl bg-purple-600 text-white text-sm font-black flex items-center justify-center gap-2 mt-5 active:scale-[0.98]"
      >
        <Gift className="w-5 h-5" />
        Ver Área VIP PRO
      </button>
    </div>
  );
}
