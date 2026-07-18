import React from 'react';

export default function LogoOficialApp({ viewMode, setViewMode }) {
  if (viewMode !== 'jogos') return null;

  return (
    <div className="px-4 mt-3 mb-2 animate-fade-in">
      <button
        type="button"
        onClick={() => setViewMode?.('radar')}
        className="w-full rounded-[1.75rem] bg-[#050816] border border-blue-500/20 overflow-hidden shadow-[0_0_35px_rgba(37,99,235,0.18)] active:scale-[0.99]"
      >
        <img
          src="/logo-oficial.png"
          alt="BetAnalytics PRO"
          className="w-full h-auto block"
        />
      </button>
    </div>
  );
}
