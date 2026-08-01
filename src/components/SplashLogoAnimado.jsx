import React from 'react';

export default function SplashLogoAnimado() {
  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center overflow-hidden relative">
      <style>{`
        @keyframes logoEntradaProfissional {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          45% {
            opacity: 1;
            transform: translateY(0) scale(1.015);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes textoEntradaProfissional {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes barraProfissional {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        .logo-splash-clean {
          animation: logoEntradaProfissional 1.05s cubic-bezier(.2,.9,.2,1) both;
          background: transparent !important;
          box-shadow: none !important;
          filter: none !important;
          border: none !important;
          outline: none !important;
        }

        .texto-splash-clean {
          animation: textoEntradaProfissional .65s ease-out .45s both;
        }

        .barra-splash-clean {
          animation: barraProfissional 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-[370px] px-8 flex flex-col items-center">
        <img
          src="/logo-topo.png"
          alt="BetAnalytics PRO"
          className="logo-splash-clean w-full max-w-[320px] h-auto object-contain select-none"
          draggable="false"
          style={{
            background: 'transparent',
            boxShadow: 'none',
            filter: 'none',
            border: 'none',
            outline: 'none'
          }}
        />

        <div className="texto-splash-clean mt-8 w-44 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <div className="barra-splash-clean h-full w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        </div>

        <p className="texto-splash-clean mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/70">
          Carregando inteligência IA
        </p>
      </div>
    </div>
  );
}
