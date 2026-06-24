import React from 'react';
import { Crown } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  return (
    <div className="fixed inset-0 bg-[#050816] z-[99999] animate-fade-in">
      <div className="h-full flex flex-col justify-center items-center px-8">
        
        <Crown className="w-24 h-24 text-blue-500 mb-8 drop-shadow-[0_0_30px_rgba(37,99,235,0.6)]" />

        <h1 className="text-3xl font-black mb-4 text-white text-center tracking-tight">
          Bem-vindo ao <br/><span className="text-blue-500">BetAnalytics PRO</span>
        </h1>

        <p className="text-center text-slate-400 mb-10 font-bold text-sm leading-relaxed max-w-xs">
          A IA mais avançada do mercado para apostas esportivas. Detecte falhas nas odds em tempo real.
        </p>

        <button 
          onClick={onComplete}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase tracking-widest text-sm"
        >
          Começar a Lucrar
        </button>

      </div>
    </div>
  );
}