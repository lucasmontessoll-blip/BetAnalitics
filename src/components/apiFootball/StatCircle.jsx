export default function StatCircle({ value = 0, label = '', sub = '', tone = 'emerald' }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = tone === 'red' ? '#ef4444' : tone === 'yellow' ? '#eab308' : '#22c55e';

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="w-16 h-16 rounded-full grid place-items-center"
        style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(239,68,68,.85) 0deg)` }}
      >
        <div className="w-12 h-12 rounded-full bg-[#0f172a] grid place-items-center text-center">
          <div className="text-[11px] font-black text-white leading-none">{pct}%</div>
        </div>
      </div>
      <div className="text-[9px] font-black text-slate-300 mt-1 uppercase text-center">{label}</div>
      {sub && <div className="text-[8px] font-bold text-slate-500 text-center">{sub}</div>}
    </div>
  );
}
