import React, { useState, useEffect } from 'react';
// IMPORTANTE: Adicionámos o ícone Bell (Sino) aqui em cima!
import { Home, Search, User, Bell } from 'lucide-react'; 

// 1. Importando o nosso novo Custom Hook
import { useFavoritos } from './hooks/useFavoritos';

// (Mantenha aqui as importações dos seus outros componentes)
// import HeaderNav from './components/HeaderNav';
// import PainelJogo from './components/PainelJogo';

export default function App() {
  // Estados principais da navegação
  const [viewMode, setViewMode] = useState('jogos');
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  
  // Estado para os jogos e para o Loading
  const [jogos, setJogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Usando o Custom Hook (Apagámos o useState antigo dos favoritos!)
  const { favoritos, toggleFavorito } = useFavoritos();

  // 3. Otimização de Velocidade: Carregando o dados.json de forma assíncrona
  useEffect(() => {
    const carregarDadosPesados = async () => {
      try {
        // O ficheiro dados.json agora deve estar dentro da pasta 'public/'
        const response = await fetch('/dados.json');
        const data = await response.json();
        setJogos(data);
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      } finally {
        // Quer dê erro ou sucesso, tiramos a tela de loading
        setIsLoading(false);
      }
    };
    
    carregarDadosPesados();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white pb-24 font-sans selection:bg-blue-500/30">
      
      {/* ==========================================
          ÁREA CENTRAL DE CONTEÚDO
          ========================================== */}
      <main className="w-full max-w-3xl mx-auto pt-6">

        {/* Efeito de Loading elegante enquanto baixa o JSON */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-sm text-slate-400 animate-pulse">A carregar algoritmos...</p>
          </div>
        )}

        {/* TELA 1: ALERTAS INTELIGENTES (Substituiu o Ranking) */}
        {!isLoading && viewMode === 'alertas' && (
          <div className="px-4 animate-fade-in w-full">
            {/* Se você tiver o componente HeaderNav, ele entra aqui. Senão, pode criar um cabeçalho simples */}
            <div className="mb-6 flex items-center justify-between">
                <button onClick={() => setViewMode('jogos')} className="text-slate-400 hover:text-white">
                   &larr; Voltar
                </button>
                <h2 className="text-lg font-black uppercase tracking-wider">🔔 Radar de Oportunidades</h2>
                <div className="w-8"></div> {/* Espaçador para centralizar o título */}
            </div>

            <div className="bg-[#0f172a] border border-yellow-500/30 rounded-3xl p-4 sm:p-6 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] transform-gpu">
                <h3 className="text-sm font-black text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                   Configurar Notificações Push
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
                        <input type="checkbox" className="toggle-checkbox" defaultChecked />
                    </div>
                    <div className="flex justify-between items-center bg-[#050816] p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold text-white">Pressão Alta Ao Vivo (Heat > 80)</span>
                        <input type="checkbox" className="toggle-checkbox" defaultChecked />
                    </div>
                    <div className="flex justify-between items-center bg-[#050816] p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold text-white">Queda brusca de Odds</span>
                        <input type="checkbox" className="toggle-checkbox" />
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* TELA 2: LISTA DE JOGOS (Mantenha o seu código original aqui) */}
        {!isLoading && viewMode === 'jogos' && !jogoSelecionado && (
          <div className="px-4 animate-fade-in">
             <p>Aqui entra a sua lista de jogos...</p>
             {/* Exemplo: <ListaJogos jogos={jogos} onSelect={setJogoSelecionado} /> */}
          </div>
        )}

        {/* TELA 3: PAINEL DE JOGO (Mantenha o seu código original aqui) */}
        {!isLoading && jogoSelecionado && (
          <div className="animate-fade-in">
             <p>Aqui entra o seu Painel de Jogo Premium...</p>
             {/* Exemplo: <PainelJogo jogo={jogoSelecionado} onBack={() => setJogoSelecionado(null)} /> */}
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
          className="flex flex-col items-center gap-1.5 transition-colors text-slate-500 hover:text-slate-300"
        >
          <Search className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Busca</span>
        </button>

        {/* O NOVO BOTÃO DE ALERTAS (Substituiu o Ranking) */}
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