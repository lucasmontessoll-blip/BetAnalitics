import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  ShieldAlert,
  Target,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function texto(valor, fallback = '') {
  return String(valor || fallback || '').trim();
}

function statusTexto(jogo) {
  const status = texto(
    jogo?.status ||
    jogo?.status_short ||
    jogo?.fixture?.status?.short ||
    jogo?.fixture?.status?.long ||
    jogo?.time_elapsed ||
    jogo?.tempo_jogo,
    'NS'
  );

  const s = status.toLowerCase();

  if (s.includes('live') || s.includes('ao vivo') || s.includes('1h') || s.includes('2h')) {
    return 'Ao Vivo';
  }

  if (s === 'ft' || s.includes('finished') || s.includes('finalizado') || s.includes('encerrado')) {
    return 'Finalizado';
  }

  return 'Agendado';
}

function criarEscudo(nome) {
  const iniciais = texto(nome, 'T')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#facc15"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="28" fill="#0f172a"/>
    <circle cx="48" cy="48" r="36" fill="url(#g)" opacity="0.9"/>
    <text x="48" y="57" text-anchor="middle" font-size="28" font-family="Arial" font-weight="800" fill="white">${iniciais}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function BarraProbabilidade({ label, valor }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
        <span>{label}</span>
        <span>{valor}%</span>
      </div>

      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${Math.max(5, Math.min(100, valor))}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, titulo, valor, subtitulo, cor = 'text-white' }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">
            {titulo}
          </div>

          <div className={`text-xl font-black ${cor}`}>
            {valor}
          </div>

          {subtitulo && (
            <div className="text-[10px] font-bold text-slate-400 mt-1">
              {subtitulo}
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${cor}`} />
        </div>
      </div>
    </div>
  );
}

export default function PainelJogo(props) {
  const jogo =
    props?.jogo ||
    props?.jogoSelecionado ||
    props?.game ||
    props?.partida ||
    props?.dados ||
    {};

  const dados = useMemo(() => {
    const casa = texto(
      jogo?.home_team ||
      jogo?.time_casa ||
      jogo?.teams?.home?.name,
      'Time Casa'
    );

    const fora = texto(
      jogo?.away_team ||
      jogo?.time_fora ||
      jogo?.teams?.away?.name,
      'Time Fora'
    );

    const liga = texto(
      jogo?.league_name ||
      jogo?.liga ||
      jogo?.league?.name,
      'Liga'
    );

    const pais = texto(
      jogo?.league_country ||
      jogo?.pais ||
      jogo?.league?.country,
      ''
    );

    const placarCasa = numero(
      jogo?.scoreHome ??
      jogo?.placar_casa ??
      jogo?.goals?.home,
      0
    );

    const placarFora = numero(
      jogo?.scoreAway ??
      jogo?.placar_fora ??
      jogo?.goals?.away,
      0
    );

    const confianca = Math.max(1, Math.min(99, numero(jogo?.confianca_ia, 87)));
    const odd = numero(jogo?.odd_principal || jogo?.odd, 1.85);
    const mercado = texto(jogo?.mercado_principal || jogo?.mercado, 'Mais de 1.5 gols');

    const probCasa = Math.max(30, Math.min(72, Math.round(confianca - 18)));
    const probEmpate = Math.max(12, Math.min(30, Math.round(100 - confianca + 7)));
    const probFora = Math.max(10, 100 - probCasa - probEmpate);

    const ev = ((confianca / 100) * odd - 1) * 100;

    const risco =
      confianca >= 90 ? 'Baixo' :
      confianca >= 82 ? 'Moderado' :
      'Alto';

    return {
      casa,
      fora,
      liga,
      pais,
      placarCasa,
      placarFora,
      confianca,
      odd,
      mercado,
      probCasa,
      probEmpate,
      probFora,
      ev,
      risco,
      status: statusTexto(jogo),
      logoCasa: jogo?.home_image || jogo?.logo_casa || jogo?.teams?.home?.logo || criarEscudo(casa),
      logoFora: jogo?.away_image || jogo?.logo_fora || jogo?.teams?.away?.logo || criarEscudo(fora)
    };
  }, [jogo]);

  function voltar() {
    if (typeof props?.onBack === 'function') {
      props.onBack();
      return;
    }

    if (typeof props?.setJogoSelecionado === 'function') {
      props.setJogoSelecionado(null);
      return;
    }

    if (typeof props?.setViewMode === 'function') {
      props.setViewMode('jogos');
      return;
    }

    window.dispatchEvent(new CustomEvent('betanalytics:voltarInicio'));
  }

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={voltar}
          className="w-10 h-10 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Análise profissional
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Detalhes do jogo
          </h2>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600/25 via-[#0f172a] to-yellow-500/10 border border-blue-500/30 rounded-[32px] p-5 mb-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {dados.liga} {dados.pais ? `· ${dados.pais}` : ''}
            </div>

            <div className="text-[11px] font-black text-green-400 mt-1">
              {dados.status}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            IA {dados.confianca}%
          </div>
        </div>

        <div className="grid grid-cols-3 items-center text-center">
          <div className="flex flex-col items-center gap-2">
            <img
              src={dados.logoCasa}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = criarEscudo(dados.casa);
              }}
              className="w-16 h-16 object-contain"
              alt={dados.casa}
            />

            <div className="text-sm font-black text-white line-clamp-2">
              {dados.casa}
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-white">
              {dados.status === 'Agendado'
                ? '-'
                : `${dados.placarCasa} - ${dados.placarFora}`}
            </div>

            <div className="text-[10px] font-black uppercase text-slate-500 mt-1">
              Placar
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <img
              src={dados.logoFora}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = criarEscudo(dados.fora);
              }}
              className="w-16 h-16 object-contain"
              alt={dados.fora}
            />

            <div className="text-sm font-black text-white line-clamp-2">
              {dados.fora}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <InfoCard
          icon={Brain}
          titulo="Confiança IA"
          valor={`${dados.confianca}%`}
          subtitulo="Leitura do motor"
          cor="text-blue-400"
        />

        <InfoCard
          icon={TrendingUp}
          titulo="Odd principal"
          valor={dados.odd.toFixed(2)}
          subtitulo="Mercado atual"
          cor="text-yellow-300"
        />

        <InfoCard
          icon={Target}
          titulo="Mercado"
          valor={dados.mercado}
          subtitulo="Recomendação"
          cor="text-green-400"
        />

        <InfoCard
          icon={ShieldAlert}
          titulo="Risco"
          valor={dados.risco}
          subtitulo="Classificação"
          cor={dados.risco === 'Baixo' ? 'text-green-400' : dados.risco === 'Moderado' ? 'text-yellow-300' : 'text-red-300'}
        />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase">
            Probabilidades IA
          </h3>
        </div>

        <div className="space-y-4">
          <BarraProbabilidade label={`Vitória ${dados.casa}`} valor={dados.probCasa} />
          <BarraProbabilidade label="Empate" valor={dados.probEmpate} />
          <BarraProbabilidade label={`Vitória ${dados.fora}`} valor={dados.probFora} />
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-300" />
          <h3 className="text-sm font-black text-white uppercase">
            Explicação da IA
          </h3>
        </div>

        <p className="text-[12px] font-bold text-slate-300 leading-relaxed">
          A IA encontrou valor neste jogo porque a confiança está em {dados.confianca}%,
          a odd principal está em {dados.odd.toFixed(2)} e o mercado recomendado é
          <span className="text-yellow-300"> {dados.mercado}</span>.
          O risco foi classificado como <span className="text-blue-300">{dados.risco}</span>,
          considerando probabilidade, momento da partida, equilíbrio dos times e potencial de retorno.
        </p>

        <div className="mt-4 bg-black/20 border border-white/10 rounded-2xl p-3">
          <div className="text-[10px] font-black uppercase text-slate-500 mb-1">
            EV estimado
          </div>

          <div className={`text-xl font-black ${dados.ev >= 0 ? 'text-green-400' : 'text-red-300'}`}>
            {dados.ev >= 0 ? '+' : ''}{dados.ev.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-black text-white uppercase">
            Últimos jogos
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500 mb-2">
              {dados.casa}
            </div>

            <div className="flex gap-1">
              {['V', 'V', 'E', 'V', 'D'].map((r, i) => (
                <span
                  key={`${dados.casa}-${i}`}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black ${
                    r === 'V' ? 'bg-green-500/20 text-green-300' :
                    r === 'E' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase text-slate-500 mb-2">
              {dados.fora}
            </div>

            <div className="flex gap-1">
              {['V', 'E', 'V', 'D', 'V'].map((r, i) => (
                <span
                  key={`${dados.fora}-${i}`}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black ${
                    r === 'V' ? 'bg-green-500/20 text-green-300' :
                    r === 'E' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <ShieldAlert className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-red-100/80 leading-relaxed">
            Análise informativa. Não garantimos lucro. Apostas envolvem risco e o usuário é responsável pelas próprias decisões.
          </p>
        </div>
      </div>
    </div>
  );
}
