import React from 'react';

export default function SplashLogoAnimado() {
  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center overflow-hidden relative">
      <style>{`
        @keyframes splashFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(18px);
            filter: blur(8px);
          }
          45% {
            opacity: 1;
            transform: scale(1.04) translateY(0);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes splashPulseGlow {
          0%, 100% {
            opacity: 0.30;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.70;
            transform: scale(1.08);
          }
        }

        @keyframes splashLine {
          0% {
            width: 0%;
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          100% {
            width: 72%;
            opacity: 1;
          }
        }

        @keyframes splashLoading {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        .splash-logo-animada {
          animation: splashFadeIn 1.15s cubic-bezier(.2,.9,.2,1) both;
        }

        .splash-glow {
          animation: splashPulseGlow 1.9s ease-in-out infinite;
        }

        .splash-line {
          animation: splashLine 1.1s ease-out .35s both;
        }

        .splash-loading-bar {
          animation: splashLoading 1.25s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.20),transparent_48%)]"></div>

      <div className="absolute w-72 h-72 rounded-full bg-blue-600/20 blur-3xl splash-glow"></div>

      <div className="relative z-10 w-full max-w-[360px] px-8 flex flex-col items-center">
        <div className="splash-logo-animada w-full flex flex-col items-center">
          <img
            src="/logo-topo.png"
            alt="BetAnalytics PRO"
            className="w-full max-w-[320px] h-auto object-contain drop-shadow-[0_0_22px_rgba(59,130,246,0.35)]"
            draggable="false"
          />

          <div className="mt-6 h-[3px] rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent splash-line"></div>

          <div className="mt-5 w-40 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent splash-loading-bar"></div>
          </div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/80">
            Carregando inteligência IA
          </p>
        </div>
      </div>
    </div>
  );
}
