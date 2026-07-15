function corCamisa(lado) {
  return lado === 'home'
    ? 'bg-white text-slate-800 border-slate-300'
    : 'bg-cyan-500 text-slate-900 border-cyan-200';
}

function posicaoPorGrid(grid = '', lado = 'home') {
  const [linhaRaw, colunaRaw] = String(grid || '1:1').split(':');
  const linha = Math.max(1, Number(linhaRaw) || 1);
  const coluna = Math.max(1, Number(colunaRaw) || 1);

  const maxColPorLinha = {
    1: 1,
    2: 5,
    3: 5,
    4: 5,
    5: 5,
  };

  const maxCol = maxColPorLinha[linha] || 5;
  const left = 8 + (coluna / (maxCol + 1)) * 84;
  const baseTop = 8 + (linha - 1) * 18;
  const top = lado === 'home' ? baseTop : 100 - baseTop;

  return {
    left: `${Math.max(6, Math.min(94, left))}%`,
    top: `${Math.max(7, Math.min(93, top))}%`,
  };
}

function PlayerDot({ item, lado }) {
  const p = item?.player || {};
  const style = posicaoPorGrid(p.grid, lado);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      style={style}
      title={p.name}
    >
      <div className={`w-7 h-7 rounded-sm border grid place-items-center text-[10px] font-black shadow-md ${corCamisa(lado)}`}>
        {p.number || '?'}
      </div>
      <div className="max-w-[54px] truncate text-[8px] font-black text-white mt-0.5 drop-shadow">
        {String(p.name || '').split(' ').slice(-1)[0]}
      </div>
    </div>
  );
}

export default function CampoLineup({ home, away }) {
  const homeXI = home?.startXI || [];
  const awayXI = away?.startXI || [];

  if (!homeXI.length && !awayXI.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Escalacoes ainda nao liberadas pela API-Football.
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[330px] rounded-2xl overflow-hidden border-4 border-white/50 bg-green-500 shadow-inner">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/70" />
        <div className="absolute left-1/2 top-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" />
        <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        <div className="absolute left-2 right-2 top-2 h-14 border-2 border-white/70 rounded-b-xl" />
        <div className="absolute left-2 right-2 bottom-2 h-14 border-2 border-white/70 rounded-t-xl" />

        {homeXI.map((item, index) => <PlayerDot key={`h-${index}-${item?.player?.id}`} item={item} lado="home" />)}
        {awayXI.map((item, index) => <PlayerDot key={`a-${index}-${item?.player?.id}`} item={item} lado="away" />)}
      </div>

      <div className="mt-3 bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-2 text-center">
          <div className="p-3 border-r border-white/10">
            <div className="text-[9px] font-black text-slate-500 uppercase">Tecnico</div>
            <div className="text-xs font-black text-white">{home?.coach?.name || '-'}</div>
          </div>
          <div className="p-3">
            <div className="text-[9px] font-black text-slate-500 uppercase">Tecnico</div>
            <div className="text-xs font-black text-white">{away?.coach?.name || '-'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 text-center border-t border-white/10">
          <div className="p-3 border-r border-white/10">
            <div className="text-[9px] font-black text-slate-500 uppercase">Formacao</div>
            <div className="text-xs font-black text-white">{home?.formation || '-'}</div>
          </div>
          <div className="p-3">
            <div className="text-[9px] font-black text-slate-500 uppercase">Formacao</div>
            <div className="text-xs font-black text-white">{away?.formation || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
