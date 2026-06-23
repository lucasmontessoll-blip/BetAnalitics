import React, { useState, useEffect } from 'react';

export default function JogosAoVivo() {
  const [jogos, setJogos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Função que vai ao nosso server.js buscar os dados atualizados do Supabase
  const buscarJogos = async () => {
    try {
      // Se o frontend e backend rodarem na mesma porta/servidor no Render, basta usar o caminho relativo
      const resposta = await fetch('/api/jogos-ao-vivo');
      if (!resposta.ok) {
        throw new Error('Falha ao conectar com o servidor');
      }
      const dados = await resposta.json();
      setJogos(dados);
      setErro(null);
    } catch (err) {
      console.error("Erro ao carregar jogos:", err);
      setErro("Não foi possível atualizar os placares.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    // Busca os jogos assim que a tela abre
    buscarJogos();

    // Cria um temporizador para atualizar a tela automaticamente a cada 30 segundos
    const intervalo = setInterval(() => {
      buscarJogos();
    }, 30000); 

    // Limpa o temporizador se o utilizador fechar a página
    return () => clearInterval(intervalo);
  }, []);

  if (carregando) {
    return <div style={{ textAlgin: 'center', padding: '20px', color: '#fff' }}>⏳ Carregando radar de jogos ao vivo...</div>;
  }

  if (erro) {
    return <div style={{ color: '#ff4d4d', padding: '20px', textAlign: 'center' }}>⚠️ {erro}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>🎮 Jogos Monitorados</h2>
        <span style={{ backgroundColor: '#22c55e', color: '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
          • EM TEMPO REAL
        </span>
      </div>

      {jogos.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center' }}>Nenhum jogo ao vivo ou agendado encontrado no momento.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {jogos.map((jogo) => (
            <div 
              key={jogo.id_jogo} 
              style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '10px', 
                padding: '15px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid #334155',
                color: '#fff'
              }}
            >
              {/* Status / Tempo do Jogo */}
              <div style={{ width: '25%', textAlign: 'left' }}>
                <span 
                  style={{ 
                    backgroundColor: jogo.tempo_jogo === 'INTERVALO' || jogo.tempo_jogo.includes("'") || jogo.tempo_jogo.includes('MIN') ? '#ef4444' : '#475569',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {jogo.tempo_jogo}
                </span>
              </div>

              {/* Confronto e Placar */}
              <div style={{ width: '75%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Time Casa */}
                <div style={{ width: '40%', textAlign: 'right', fontWeight: 'bold', paddingRight: '10px' }}>
                  {jogo.time_casa}
                </div>

                {/* Caixa do Placar */}
                <div style={{ 
                  backgroundColor: '#0f172a', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  fontSize: '18px',
                  letterSpacing: '4px',
                  color: '#38bdf8',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {jogo.placar_casa}x{jogo.placar_fora}
                </div>

                {/* Time Fora */}
                <div style={{ width: '40%', textAlign: 'left', fontWeight: 'bold', paddingLeft: '10px' }}>
                  {jogo.time_fora}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}