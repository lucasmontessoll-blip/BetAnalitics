import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCcw, Home, Database } from 'lucide-react';

export default function SemConexaoPro({ setViewMode, telaCompleta = false }) {
  const [online, setOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);

    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);

    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);

  if (online && !telaCompleta) return null;

  if (!telaCompleta) {
    return (
      <button
        type="button"
        onClick={() => setViewMode?.('sem-conexao')}
        className="mx-4 mt-2 mb-1 w-[calc(100%-2rem)] rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-center gap-3 text-left active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-400/20 flex items-center justify-center shrink-0">
          <WifiOff className="w-5 h-5 text-red-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black text-red-300 uppercase tracking-wider">
            Sem conexão
          </div>
          <div className="text-[10px] font-bold text-red-100/70 truncate">
            Usando dados salvos/demonstração.
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="px-4 animate-fade-in pb-28 w-full min-h-[70vh] flex items-center justify-center">
      <div className="w-full bg-[#0f172a] border border-white/10 rounded-[2rem] p-6 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <WifiOff className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">
          Sem conexão
        </h1>

        <p className="text-sm text-slate-400 font-semibold leading-relaxed mb-5">
          Verifique sua internet. Enquanto isso, o app pode exibir dados salvos ou demonstrativos.
        </p>

        <div className="bg-[#050816] border border-white/10 rounded-3xl p-4 mb-5 flex gap-3 text-left">
          <Database className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-black text-white uppercase">Modo seguro</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">
              Favoritos, histórico IA, banca e configurações continuam disponíveis localmente.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-12 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Tentar
          </button>

          <button
            type="button"
            onClick={() => setViewMode?.('jogos')}
            className="h-12 rounded-2xl bg-[#050816] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Início
          </button>
        </div>
      </div>
    </div>
  );
}
