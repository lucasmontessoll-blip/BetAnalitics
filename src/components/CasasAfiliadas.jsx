import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { casasAfiliadas } from '../config/casasAfiliadas.js';

export default function CasasAfiliadas() {
  const abrirCasa = (casa) => {
    if (!casa?.link || casa.link.includes('SEU-LINK-AFILIADO')) {
      alert(`Configure o link afiliado da ${casa.nome} antes de abrir.`);
      return;
    }

    // Abre em nova aba para não fechar o seu aplicativo
    window.open(casa.link, '_blank');
  };

  return (
    <section className="px-4 mt-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Casas Parceiras
          </h2>
          <p className="text-[10px] text-slate-500 font-bold">
            Acesse pelas indicações oficiais do BetAnalytics
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-black">
          <ShieldCheck className="w-3 h-3" />
          18+
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {casasAfiliadas.map((casa) => (
          <button
            key={casa.id}
            onClick={() => abrirCasa(casa)}
            className={`bg-gradient-to-br ${casa.cor} rounded-3xl p-4 text-left shadow-lg active:scale-95 transition-all relative overflow-hidden`}
          >
            <div className="absolute right-3 top-3 opacity-70">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>

            <div className="text-3xl mb-3">{casa.logo}</div>

            <h3 className="text-white text-lg font-black leading-tight">
              {casa.nome}
            </h3>

            <p className="text-white/90 text-[10px] font-black uppercase mt-1">
              {casa.bonus}
            </p>

            <p className="text-white/80 text-[10px] mt-2 leading-snug">
              {casa.descricao}
            </p>

            <div className="mt-4 bg-black/25 text-white text-[10px] font-black py-2 px-3 rounded-2xl text-center">
              ACESSAR CASA
            </div>
          </button>
        ))}
      </div>

      <p className="text-[9px] text-slate-600 mt-3 leading-relaxed">
        Jogue com responsabilidade. Conteúdo indicado apenas para maiores de 18 anos.
      </p>
    </section>
  );
}