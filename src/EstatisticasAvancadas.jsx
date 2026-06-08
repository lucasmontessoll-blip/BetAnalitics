import React from 'react';
import { jsPDF } from 'jspdf';
import { Calendar, BarChart3, Download, Lock } from 'lucide-react';

export default function EstatisticasAvancadas({ apostas, isPro, onUnlockPro }) {

  // 1. CALENDÁRIO DE PERFORMANCE
  const gerarCalendarioPerformance = () => {
    const dias = {};
    apostas.forEach(a => {
      const data = a.data;
      if (!dias[data]) dias[data] = 0;
      if (a.resultado === "green") {
        dias[data] += ((a.stake * a.odd) - a.stake);
      } else {
        dias[data] -= a.stake;
      }
    });
    return dias;
  };

  // 2. HEATMAP SEMANAL
  const heatmapSemanal = () => {
    const dias = { Dom:0, Seg:0, Ter:0, Qua:0, Qui:0, Sex:0, Sab:0 };
    const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    apostas.forEach(a => {
      const diaStr = a.data; 
      // Ajuste de fuso horário para garantir o dia correto
      const dataObj = new Date(diaStr + 'T12:00:00');
      const diaIdx = dataObj.getDay();
      if(a.resultado === 'green'){
        dias[nomes[diaIdx]]++;
      }
    });
    return dias;
  };

  // 3. COMPARAÇÃO MENSAL
  const compararMeses = () => {
    const meses = {};
    apostas.forEach(a => {
      const dataObj = new Date(a.data + 'T12:00:00');
      const chave = `${String(dataObj.getMonth()+1).padStart(2, '0')}/${dataObj.getFullYear()}`;
      if(!meses[chave]) meses[chave] = 0;
      if(a.resultado === 'green'){
        meses[chave] += ((a.stake*a.odd)-a.stake);
      }else{
        meses[chave] -= a.stake;
      }
    });
    return Object.entries(meses);
  };

  // 4. EXPORTAÇÃO PDF
  const gerarPDF = () => {
    const doc = new jsPDF();
    const lucroTotal = apostas.reduce((acc,a)=> a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
    
    doc.setFillColor(15, 23, 42); // Cor do painel
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("BetAnalytics PRO - Relatório", 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Total de Apostas: ${apostas.length}`, 20, 60);
    doc.text(`Lucro Total: R$ ${lucroTotal.toFixed(2)}`, 20, 75);
    
    doc.setFontSize(10);
    doc.text("Documento gerado automaticamente pela IA.", 20, 90);
    
    doc.save('relatorio-betanalytics.pdf');
  };

  // 5. BLOQUEIO DE SISTEMA PRO
  if (!isPro) {
    return (
      <div className="bg-[#0f172a] rounded-3xl p-8 mb-6 border border-yellow-500/20 shadow-lg relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[#050816]/80 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6">
            <Lock className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="font-black text-white text-lg mb-2">Estatísticas Avançadas PRO</h3>
            <p className="text-xs text-slate-300 mb-6">Desbloqueie o Calendário de Performance, Heatmap, Gráficos Mensais e Relatórios em PDF.</p>
            <button onClick={onUnlockPro} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(234,179,8,0.4)]">Fazer Upgrade Agora</button>
        </div>
        {/* Fundo simulado desfocado para aguçar a curiosidade */}
        <div className="grid grid-cols-7 gap-2 w-full opacity-30 blur-sm pointer-events-none">
            {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-10 bg-green-500/20 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-6">
        
        {/* CALENDÁRIO */}
        <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400"/> Calendário de Lucro</h2>
            <div className="grid grid-cols-7 gap-2">
                {Object.entries(gerarCalendarioPerformance()).map(([data,lucro]) => (
                <div key={data} className={`p-2 rounded-xl text-center flex flex-col items-center justify-center h-14 ${lucro > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : lucro < 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    <span className="text-xs font-black">{new Date(data + 'T12:00:00').getDate()}</span>
                </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* HEATMAP */}
            <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg">
                <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><BarChart3 className="w-4 h-4 text-orange-400"/> Dias Fortes (Heatmap)</h2>
                <div className="grid grid-cols-7 gap-1.5">
                    {Object.entries(heatmapSemanal()).map(([dia,valor]) => (
                    <div key={dia} className={`rounded-lg p-2 text-center flex flex-col items-center border border-white/5 ${valor > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800/50 text-slate-500'}`}>
                        <span className="text-[9px] uppercase font-bold">{dia}</span>
                        <span className="font-black text-sm">{valor}</span>
                    </div>
                    ))}
                </div>
            </div>

            {/* MESES */}
            <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg">
                <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400"/> Comparação Mensal</h2>
                <div className="flex flex-col gap-2">
                    {compararMeses().map(([mes,lucro]) => (
                        <div key={mes} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                            <span className="text-xs font-bold text-slate-300">{mes}</span>
                            <span className={`text-xs font-black ${lucro > 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {lucro.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PDF */}
        <button onClick={gerarPDF} className="w-full bg-red-600 hover:bg-red-500 transition-colors text-white font-black py-4 rounded-2xl shadow-[0_0_15px_rgba(220,38,38,0.3)] text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <Download className="w-5 h-5"/> Baixar Relatório Completo (PDF)
        </button>

    </div>
  );
}