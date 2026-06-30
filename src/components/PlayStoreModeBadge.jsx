import React from 'react';
import {ShieldCheck} from 'lucide-react';
import {APP_MODE} from '../config/appMode.js';

export default function PlayStoreModeBadge(){
  if(!APP_MODE.PLAYSTORE)return null;

  return(
    <div className="px-4 mt-3 mb-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"/>
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-300">Modo seguro Play Store</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
            O BetAnalytics PRO é uma plataforma de análise esportiva. Não somos casa de aposta,
            não aceitamos apostas, não processamos depósitos e não garantimos lucro.
          </p>
        </div>
      </div>
    </div>
  );
}
