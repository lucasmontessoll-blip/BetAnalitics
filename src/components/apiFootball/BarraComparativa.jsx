function valor(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'string' && v.includes('%')) return Number(v.replace('%', '')) || 0;
  return Number(v) || 0;
}

export default function BarraComparativa({ label, casa, fora }) {
  const h = valor(casa);
  const a = valor(fora);
  const total = Math.max(h + a, 1);
  const hPct = Math.max(2, Math.min(98, (h / total) * 100));
  const aPct = Math.max(2, Math.min(98, (a / total) * 100));

  const formatar = (v) => v === null || v === undefined ? '-' : String(v);

  return (
    <div className="py-2 border-b border-white/5 last:border-b-0">
      <div className="grid grid-cols-[38px_1fr_38px] items-center gap-2 text-[10px] font-black">
        <span className="text-white text-left">{formatar(casa)}</span>
        <span className="text-slate-400 text-center uppercase tracking-wide">{label}</span>
        <span className="text-white text-right">{formatar(fora)}</span>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-1">
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex justify-end">
          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${hPct}%` }} />
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${aPct}%` }} />
        </div>
      </div>
    </div>
  );
}
