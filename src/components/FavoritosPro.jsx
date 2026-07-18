import React, { useMemo, useState } from 'react';
import { Star, Trophy, User, Bell, Pin, Search, Plus, ChevronRight, Trash2, Heart, Brain, ArrowLeft } from 'lucide-react';

const abas = [
  { id: 'times', nome: 'Times', icon: Star },
  { id: 'competicoes', nome: 'Competições', icon: Trophy },
  { id: 'atletas', nome: 'Atletas', icon: User },
  { id: 'jogos', nome: 'Jogos', icon: Pin },
  { id: 'alertas', nome: 'Alertas', icon: Bell },
];

const baseInicial = {
  times: [
    { id: 'time-1', nome: 'Flamengo', detalhe: 'Brasil • favorito demo' },
    { id: 'time-2', nome: 'Palmeiras', detalhe: 'Brasil • favorito demo' },
  ],
  competicoes: [
    { id: 'comp-1', nome: 'Brasileirão Série A', detalhe: 'Brasil' },
    { id: 'comp-2', nome: 'Champions League', detalhe: 'Europa' },
  ],
  atletas: [
    { id: 'atl-1', nome: 'Artilheiro em destaque', detalhe: 'Monitoramento IA' },
  ],
  jogos: [
    { id: 'jogo-1', nome: 'Flamengo x Palmeiras', detalhe: 'Salvo para análise IA' },
  ],
  alertas: [
    { id: 'alerta-1', nome: 'Odd acima de 1.80', detalhe: 'Receber alerta de oportunidade' },
  ],
};

function carregar() {
  try {
    return JSON.parse(localStorage.getItem('bet_favoritos_pro_v1') || 'null') || baseInicial;
  } catch {
    return baseInicial;
  }
}

export default function FavoritosPro({ setViewMode, setAiOpen, setAiQuery }) {
  const [aba, setAba] = useState('times');
  const [dados, setDados] = useState(carregar);
  const [busca, setBusca] = useState('');
  const [novo, setNovo] = useState('');

  const salvar = (proximo) => {
    setDados(proximo);
    try {
      localStorage.setItem('bet_favoritos_pro_v1', JSON.stringify(proximo));
    } catch {}
  };

  const lista = useMemo(() => {
    const atual = dados[aba] || [];
    const termo = busca.trim().toLowerCase();

    if (!termo) return atual;

    return atual.filter((item) => {
      return item.nome.toLowerCase().includes(termo) || item.detalhe.toLowerCase().includes(termo);
    });
  }, [aba, busca, dados]);

  const adicionar = () => {
    const nome = novo.trim();
    if (!nome) return;

    const item = {
      id: aba + '-' + Date.now(),
      nome,
      detalhe: 'Adicionado manualmente',
    };

    salvar({
      ...dados,
      [aba]: [item, ...(dados[aba] || [])],
    });

    setNovo('');
  };

  const remover = (id) => {
    salvar({
      ...dados,
      [aba]: (dados[aba] || []).filter((item) => item.id !== id),
    });
  };

  const perguntarIA = () => {
    setAiQuery?.('Analise meus favoritos e mostre quais merecem atenção hoje.');
    setAiOpen?.(true);
  };

  const AbaIcone = abas.find((x) => x.id === aba)?.icon || Star;

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setViewMode?.('Pesquisa')}
          className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div>
          <div className="text-xl font-black text-white">Favoritos PRO</div>
          <div className="text-[11px] text-slate-500 font-bold">Times, competições, jogos e alertas salvos</div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-yellow-500/20 to-blue-700/20 border border-yellow-400/20 p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-3xl bg-yellow-500/15 border border-yellow-400/30 flex items-center justify-center">
            <Heart className="w-7 h-7 text-yellow-400" />
          </div>

          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-yellow-300 font-black">Central personalizada</div>
            <div className="text-lg font-black text-white">Acompanhe só o que importa</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              Seus favoritos ajudam a IA a priorizar jogos, alertas e oportunidades.
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {abas.map((item) => {
          const Icone = item.icon;
          const ativo = aba === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setAba(item.id)}
              className={'shrink-0 h-11 px-4 rounded-2xl border text-xs font-black flex items-center gap-2 ' + (ativo ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#0f172a] border-white/10 text-slate-400')}
            >
              <Icone className="w-4 h-4" />
              {item.nome}
            </button>
          );
        })}
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 h-12 rounded-2xl bg-[#050816] border border-white/10 px-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar favorito..."
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            placeholder={'Adicionar em ' + (abas.find((x) => x.id === aba)?.nome || 'Favoritos')}
            className="flex-1 h-12 rounded-2xl bg-[#050816] border border-white/10 px-4 text-sm text-white outline-none placeholder:text-slate-600"
          />

          <button
            type="button"
            onClick={adicionar}
            className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center active:scale-95"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {lista.length === 0 ? (
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 text-center">
            <AbaIcone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-white font-black">Nenhum favorito encontrado</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Adicione itens para a IA montar alertas personalizados.
            </div>
          </div>
        ) : (
          lista.map((item) => (
            <div key={item.id} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                <AbaIcone className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-white truncate">{item.nome}</div>
                <div className="text-[11px] text-slate-500 font-bold truncate">{item.detalhe}</div>
              </div>

              <button
                type="button"
                onClick={() => remover(item.id)}
                className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={perguntarIA}
          className="h-14 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Brain className="w-4 h-4" />
          Analisar favoritos
        </button>

        <button
          type="button"
          onClick={() => setViewMode?.('alertas-ia')}
          className="h-14 rounded-2xl bg-[#0f172a] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          Alertas IA
        </button>
      </div>

      <button
        type="button"
        onClick={() => setViewMode?.('Pesquisa')}
        className="w-full mt-3 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs font-black flex items-center justify-center gap-2"
      >
        Adicionar pela Pesquisa
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
