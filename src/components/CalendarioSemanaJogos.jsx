import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

function toISO(date) {
  const d = new Date(date);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return ano + '-' + mes + '-' + dia;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function CalendarioSemanaJogos({ viewMode }) {
  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [inicio, setInicio] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selecionado, setSelecionado] = useState(() => toISO(new Date()));

  const dias = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const data = addDays(inicio, index);
      const iso = toISO(data);
      const ehHoje = iso === toISO(hoje);

      return {
        data,
        iso,
        diaSemana: nomesDias[data.getDay()],
        diaMes: String(data.getDate()).padStart(2, '0'),
        mes: String(data.getMonth() + 1).padStart(2, '0'),
        ehHoje,
      };
    });
  }, [inicio, hoje]);

  useEffect(() => {
    if (viewMode !== 'jogos') return;

    const esconderElementosAntigos = () => {
      try {
        const todos = Array.from(document.querySelectorAll('div, section, nav'));

        const hero = todos
          .filter((el) => {
            const txt = (el.innerText || '').toLowerCase();

            return (
              txt.includes('betanalytics pro') &&
              txt.includes('ver oportunidades') &&
              txt.includes('precisao ia')
            );
          })
          .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0];

        if (hero) {
          hero.style.display = 'none';
        }

        const abas = todos
          .filter((el) => {
            const txt = (el.innerText || '').toLowerCase();

            return (
              txt.includes('todos') &&
              txt.includes('ao vivo') &&
              txt.includes('brasileir') &&
              txt.includes('champions') &&
              txt.includes('premier league')
            );
          })
          .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0];

        if (abas) {
          abas.style.display = 'none';
        }
      } catch {}
    };

    esconderElementosAntigos();

    const timer = setTimeout(esconderElementosAntigos, 350);

    return () => clearTimeout(timer);
  }, [viewMode]);

  if (viewMode !== 'jogos') return null;

  const selecionarDia = (dia) => {
    setSelecionado(dia.iso);

    try {
      window.dispatchEvent(
        new CustomEvent('betSelecionarDataJogo', {
          detail: { data: dia.iso },
        })
      );
    } catch {}
  };

  return (
    <div className="px-4 mt-3 mb-4 animate-fade-in">
      <div className="bg-[#0f172a] border border-white/10 rounded-[1.75rem] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <CalendarDays className="w-4 h-4" />
              Calendario
            </div>

            <div className="text-white text-lg font-black mt-1">
              Semana de jogos
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInicio((d) => addDays(d, -7))}
              className="w-9 h-9 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-center active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </button>

            <button
              type="button"
              onClick={() => setInicio((d) => addDays(d, 7))}
              className="w-9 h-9 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-center active:scale-95"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dias.map((dia) => {
            const ativo = selecionado === dia.iso;

            return (
              <button
                key={dia.iso}
                type="button"
                onClick={() => selecionarDia(dia)}
                className={
                  'rounded-2xl p-2 min-h-[76px] border flex flex-col items-center justify-center active:scale-95 transition ' +
                  (ativo
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_22px_rgba(37,99,235,0.35)]'
                    : 'bg-[#050816] border-white/10 text-slate-400')
                }
              >
                <span className="text-[9px] font-black uppercase">
                  {dia.diaSemana}
                </span>

                <span className="text-lg font-black mt-1">
                  {dia.diaMes}
                </span>

                <span className="text-[8px] font-black opacity-70">
                  {dia.ehHoje ? 'Hoje' : dia.mes}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 bg-[#050816] border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase">
              Data selecionada
            </div>

            <div className="text-sm text-white font-black">
              {selecionado.split('-').reverse().join('/')}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-emerald-400 font-black uppercase">
              Jogos do dia
            </div>

            <div className="text-xs text-slate-400 font-bold">
              Lista abaixo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
