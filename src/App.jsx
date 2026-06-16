import React, { useState, useEffect } from 'react';
import { Home, Search, User, Bell, Activity, ChevronRight } from 'lucide-react'; 
import { useFavoritos } from './hooks/useFavoritos';

export default function App() {
  const [viewMode, setViewMode] = useState('jogos');
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  
  const [jogos, setJogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { favoritos, toggleFavorito } = useFavoritos();

  useEffect(() => {
    const carregarDadosPesados = async () => {
      try {
        const response = await fetch('/dados.json');
        const data = await response.json();
        setJogos(Array.isArray(data) ? data : (data.response || []));
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDadosPesados();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white pb-24 font-sans selection:bg-blue-500/30">
      
      {/* ==========================================
          CABEÇALHO GLOBAL
          ========================================== */}
      <header className="px-6 py-5 flex justify-between items-center sticky top-0 bg-[#050816]/90 backdrop-blur-md z-40 border-b border-white/5">
         <div>
            <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
               BETANALYTICS<span className="text-white">PRO</span>
            </h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Inteligência Artificial</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-[#0f172a] border border-blue-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
         </div>
      </header>

      {/* ==========================================
          ÁREA CENTRAL DE CONTEÚDO
          ========================================== */}
      <main className="w-full max-w-3xl mx-auto pt-6">

        {isLoading && (
          <div className="flex flex-col justify-center items-center h-64 gap-4 animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-sm text-slate-400 font-medium">A sincronizar algoritmos...</p>
          </div>
        )}

        {/* TELA 1: INÍCIO (Lista de Jogos) */}
        {!isLoading && viewMode === 'jogos' && !jogoSelecionado && (
          <div className="px-4 animate-fade-in pb-10">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                   <Activity className="w-5 h-5 text-blue-500" />
                   Jogos do Dia
                </h2>
             </div>

             <div className="space-y-3">
                {jogos.length > 0 ? (
                   jogos.map((jogo, index) => (
                      <div 
                         key={index} 
                         onClick={() => setJogoSelecionado(jogo)}
                         className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-blue-500/50 hover:bg-[#151f38] transition-all group"
                      >
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-[#050816] px-2 py-1 rounded-md">
                               {jogo.liga || jogo.league?.name || "Liga Principal"}
                            </span>
                            <span className="text-xs font-bold text-blue-400">
                               {jogo.tempo || jogo.fixture?.status?.elapsed || "Em breve"}'
                            </span>
                         </div>
                         
                         <div className="flex justify-between items-center">
                            <div className="flex-1">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold text-sm sm:text-base">{jogo.timeCasa || jogo.teams?.home?.name || "Time Casa"}</span>
                                  <span className="font-black text-lg">{jogo.golsCasa || jogo.goals?.home || 0}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                  <span className="font-bold text-sm sm:text-base">{jogo.timeFora || jogo.teams?.away?.name || "Time Fora"}</span>
                                  <span className="font-black text-lg">{jogo.golsFora || jogo.goals?.away || 0}</span>
                               </div>
                            </div>
                            <div className="ml-4 pl-4 border-l border-white/5 flex flex-col items-center justify-center">
                               <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" />
                            </div>
                         </div>
                      </div>
                   ))
                ) : (
                   <div className="text-center bg-[#0f172a] rounded-2xl p-8 border border-white/5">
                      <p className="text-slate-400 text-sm">Nenhum jogo encontrado no momento.</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* TELA 2: BUSCA */}
        {!isLoading && viewMode === 'busca' && !jogoSelecionado && (
          <div className="px-4 animate-fade-in w-full">
            <div className="mb-6">
                <h2 className="text-lg font-black uppercase tracking-wider mb-4">🔍 Buscar Partidas</h2>
                <input 
                  type="text" 
                  placeholder="Pesquisar equipa ou liga..." 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 text-center">
                <p className="text-slate-400 text-sm">Utilize a barra acima para encontrar jogos específicos.</p>
            </div>
          </div>
        )}

        {/* TELA 3: RADAR DE ALERTAS */}
        {!isLoading && viewMode === 'alertas' && !jogoSelecionado && (
          <div className="px-4 animate-fade-in w-full">
            <h2 className="text-lg font-black uppercase tracking-wider mb-4 text-center">Radar de Oportunidades</h2>
            <div className="bg-[#0f172a] border border-yellow-500/30 rounded-3xl p-4 sm:p-6 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] transform-gpu">
                <h3 className="text-sm font-black text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                   🔔 Configurar Push
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                   Receba avisos diretos no telemóvel quando os nossos algoritmos detetarem padrões de alta probabilidade.
                </p>
                
                <button 
                   onClick={async () => {
                     const { solicitarPermissaoNotificacao } = await import('./services/notificacoes');
                     solicitarPermissaoNotificacao();
                   }} 
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm mb-6"
                >
                   ATIVAR NOTIFICAÇÕES
                </button>

                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#050816] p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold text-white">Value Bets (EV > 10%)</span>
                        <input type="checkbox" className="toggle-checkbox w-5 h-5 accent-blue-500" defaultChecked />
                    </div>
                    <div className="flex justify-between items-center bg-[#050816] p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold text-white">Pressão Alta Ao Vivo</span>
                        <input type="checkbox" className="toggle-checkbox w-5 h-5 accent-blue-500" defaultChecked />
                    </div>
                    <div className="flex justify-between items-center bg-[#050816] p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold text-white">Queda brusca de Odds</span>
                        <input type="checkbox" className="toggle-checkbox w-5 h-5 accent-blue-500" />
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* TELA 4: PERFIL */}
        {!isLoading && viewMode === 'perfil' && !jogoSelecionado && (
          <div className="px-4 animate-fade-in w-full">
            <h2 className="text-lg font-black uppercase tracking-wider mb-4">👤 Meu Perfil</h2>
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 text-center">
                <div className="w-20 h-20 bg-[#050816] rounded-full mx-auto mb-4 flex items-center justify-center border border-blue-500/30">
                   <User className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-1">Apostador Pro</h3>
                <p className="text-sm text-slate-400 mb-6">Membro VIP Ativo</p>
                <div className="space-y-3">
                   <button className="w-full bg-[#050816] border border-white/5 py-3 rounded-xl font-bold text-sm hover:border-blue-500/50 transition-colors">
                      Estatísticas Pessoais
                   </button>
                   <button className="w-full bg-[#050816] border border-white/5 py-3 rounded-xl font-bold text-sm hover:border-blue-500/50 transition-colors">
                      Configurações da Conta
                   </button>
                </div>
            </div>
          </div>
        )}

        {/* TELA 5: PAINEL DE JOGO INDIVIDUAL (Quando clica num jogo da lista) */}
        {!isLoading && jogoSelecionado && (
          <div className="px-4 animate-fade-in">
             <button 
                onClick={() => setJogoSelecionado(null)}
                className="mb-4 text-sm font-bold text-slate-400 hover:text-white flex items-center gap-1"
             >
                &larr; Voltar
             </button>
             
             <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 text-center">
                <h2 className="text-xl font-black mb-2">
                   {jogoSelecionado.timeCasa || jogoSelecionado.teams?.home?.name} vs {jogoSelecionado.timeFora || jogoSelecionado.teams?.away?.name}
                </h2>
                <p className="text-slate-400 text-sm mb-6">Painel de Análise Avançada (Será importado aqui)</p>
             </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MENU DE NAVEGAÇÃO INFERIOR
          ========================================== */}
      <nav className="fixed bottom-0 w-full max-w-3xl mx-auto left-1/2 -translate-x-1/2 bg-[#090b14] border-t border-white/5 px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl backdrop-blur-md bg-opacity-90 pb-safe">
        
        <button 
          onClick={() => {setViewMode('jogos'); setJogoSelecionado(null);}} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
        </button>

        <button 
          onClick={() => {setViewMode('busca'); setJogoSelecionado(null);}}
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'busca' ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Busca</span>
        </button>

        <button 
          onClick={() => {setViewMode('alertas'); setJogoSelecionado(null);}} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'alertas' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Bell className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Alertas</span>
        </button>

        <button 
          onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}}
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'perfil' ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>

      </nav>
    </div>
  );
}