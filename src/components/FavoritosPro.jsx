import React, { useMemo, useState } from 'react';
import {
  Bell,
  Brain,
  ChevronRight,
  Heart,
  Pin,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  User
} from 'lucide-react';

/* BET_ETAPA_32C_FAVORITOS_PREMIUM */

const TABS = [
  { id: 'times', label: 'Times', icon: Star },
  { id: 'competicoes', label: 'Competições', icon: Trophy },
  { id: 'atletas', label: 'Atletas', icon: User },
  { id: 'jogos', label: 'Jogos', icon: Pin },
  { id: 'alertas', label: 'Alertas', icon: Bell }
];

const INITIAL_DATA = {
  times: [
    { id: 'time-1', nome: 'Flamengo', detalhe: 'Brasil · favorito demo' },
    { id: 'time-2', nome: 'Palmeiras', detalhe: 'Brasil · favorito demo' }
  ],
  competicoes: [
    { id: 'comp-1', nome: 'Brasileirão Série A', detalhe: 'Brasil' },
    { id: 'comp-2', nome: 'Champions League', detalhe: 'Europa' }
  ],
  atletas: [
    { id: 'atl-1', nome: 'Artilheiro em destaque', detalhe: 'Monitoramento IA' }
  ],
  jogos: [
    { id: 'jogo-1', nome: 'Flamengo x Palmeiras', detalhe: 'Salvo para análise IA' }
  ],
  alertas: [
    { id: 'alerta-1', nome: 'Odd acima de 1.80', detalhe: 'Alerta de oportunidade ativo' }
  ]
};

function cloneInitialData() {
  return Object.fromEntries(
    Object.entries(INITIAL_DATA).map(([key, items]) => [
      key,
      items.map((item) => ({ ...item }))
    ])
  );
}

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem('bet_favoritos_pro_v1') || 'null');

    if (!stored || typeof stored !== 'object') return cloneInitialData();

    return {
      ...cloneInitialData(),
      ...stored
    };
  } catch {
    return cloneInitialData();
  }
}

function tabInfo(id) {
  return TABS.find((item) => item.id === id) || TABS[0];
}

function totalItems(data) {
  return Object.values(data).reduce(
    (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
    0
  );
}

export default function FavoritosPro({
  setViewMode,
  setAiOpen,
  setAiQuery
}) {
  const [tab, setTab] = useState('times');
  const [data, setData] = useState(loadFavorites);
  const [search, setSearch] = useState('');
  const [newItem, setNewItem] = useState('');

  const activeTab = tabInfo(tab);
  const ActiveIcon = activeTab.icon;

  const list = useMemo(() => {
    const current = Array.isArray(data[tab]) ? data[tab] : [];
    const term = search.trim().toLocaleLowerCase('pt-BR');

    if (!term) return current;

    return current.filter((item) => {
      const name = String(item?.nome || '').toLocaleLowerCase('pt-BR');
      const detail = String(item?.detalhe || '').toLocaleLowerCase('pt-BR');
      return name.includes(term) || detail.includes(term);
    });
  }, [data, search, tab]);

  const total = totalItems(data);
  const alerts = Array.isArray(data.alertas) ? data.alertas.length : 0;

  function save(next) {
    setData(next);

    try {
      localStorage.setItem('bet_favoritos_pro_v1', JSON.stringify(next));
    } catch {}
  }

  function add() {
    const name = newItem.trim();
    if (!name) return;

    const item = {
      id: `${tab}-${Date.now()}`,
      nome: name,
      detalhe: `Adicionado em ${activeTab.label}`
    };

    save({
      ...data,
      [tab]: [item, ...(Array.isArray(data[tab]) ? data[tab] : [])]
    });

    setNewItem('');
  }

  function remove(id) {
    save({
      ...data,
      [tab]: (Array.isArray(data[tab]) ? data[tab] : []).filter(
        (item) => item.id !== id
      )
    });
  }

  function askAI() {
    if (typeof setAiQuery === 'function') {
      setAiQuery(
        'Analise meus favoritos e mostre quais merecem atenção hoje.'
      );
    }

    if (typeof setAiOpen === 'function') {
      setAiOpen(true);
    }
  }

  return (
    <main className="w-full animate-fade-in px-3 pb-28 pt-3 sm:px-4">
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#080c16] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-yellow-400/10 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(234,179,8,0.16),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(37,99,235,0.12),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-yellow-300">
              <Heart className="h-3.5 w-3.5" />
              Central personalizada
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[8px] font-black text-slate-400 ring-1 ring-inset ring-white/[0.06]">
              <Sparkles className="h-3 w-3 text-blue-300" />
              IA ATIVA
            </span>
          </div>

          <h1 className="mt-5 text-[27px] font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl">
            Seus favoritos em um só lugar
          </h1>
          <p className="mt-3 max-w-xl text-[11px] font-medium leading-5 text-slate-400">
            Times, competições, atletas, jogos e alertas usados pela IA para priorizar oportunidades.
          </p>

          <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.035] py-3 ring-1 ring-inset ring-white/[0.055]">
            <div className="text-center">
              <p className="text-lg font-black tabular-nums text-white">{total}</p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-wider text-slate-700">
                itens salvos
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black tabular-nums text-yellow-300">
                {(data.times || []).length}
              </p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-wider text-slate-700">
                times
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black tabular-nums text-red-300">{alerts}</p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-wider text-slate-700">
                alertas
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav className="no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.055] px-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setSearch('');
              }}
              className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3 text-[9px] font-black transition ${
                active ? 'text-white' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-yellow-300' : ''}`} />
              {label}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-yellow-400" />
              )}
            </button>
          );
        })}
      </nav>

      <section className="mt-6 overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        <div className="border-b border-white/[0.055] px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-700">
            Gerenciar {activeTab.label}
          </p>
          <p className="mt-1 text-[10px] font-semibold text-slate-500">
            Pesquise, adicione ou remova itens da sua seleção.
          </p>
        </div>

        <div className="space-y-2.5 px-4 py-4">
          <label className="flex h-11 items-center gap-2 rounded-2xl bg-black/20 px-3 ring-1 ring-inset ring-white/[0.055]">
            <Search className="h-4 w-4 shrink-0 text-slate-700" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar favorito..."
              className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-white outline-none placeholder:text-slate-700"
            />
          </label>

          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={(event) => setNewItem(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') add();
              }}
              placeholder={`Adicionar em ${activeTab.label}`}
              className="h-11 min-w-0 flex-1 rounded-2xl bg-black/20 px-3 text-[11px] font-semibold text-white outline-none ring-1 ring-inset ring-white/[0.055] placeholder:text-slate-700"
            />

            <button
              type="button"
              onClick={add}
              aria-label="Adicionar favorito"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-500 active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        {list.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ActiveIcon className="mx-auto h-8 w-8 text-slate-800" />
            <p className="mt-3 text-sm font-black text-slate-400">
              Nenhum favorito encontrado
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-700">
              Adicione itens para a IA montar alertas personalizados.
            </p>
          </div>
        ) : (
          list.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-4 ${
                index > 0 ? 'border-t border-white/[0.055]' : ''
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <ActiveIcon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-white">{item.nome}</p>
                <p className="mt-1 truncate text-[8px] font-semibold text-slate-600">
                  {item.detalhe}
                </p>
              </div>

              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remover ${item.nome}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={askAI}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-[9px] font-black uppercase tracking-wide text-white transition hover:bg-blue-500 active:scale-[0.99]"
        >
          <Brain className="h-4 w-4" />
          Analisar favoritos
        </button>

        <button
          type="button"
          onClick={() => setViewMode?.('alertas-ia')}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/[0.035] px-3 text-[9px] font-black uppercase tracking-wide text-slate-300 ring-1 ring-inset ring-white/[0.06] active:scale-[0.99]"
        >
          <Bell className="h-4 w-4 text-amber-300" />
          Alertas IA
        </button>
      </div>

      <button
        type="button"
        onClick={() => setViewMode?.('Pesquisa')}
        className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-[9px] font-black uppercase tracking-wide text-slate-600 transition hover:bg-white/[0.025] hover:text-slate-300"
      >
        Adicionar pela pesquisa
        <ChevronRight className="h-4 w-4" />
      </button>
    </main>
  );
}
