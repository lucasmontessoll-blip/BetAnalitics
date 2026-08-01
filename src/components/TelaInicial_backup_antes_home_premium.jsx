import React from 'react';
import JogosPorPaisContinente from './JogosPorPaisContinente.jsx';
import LegalCompliance from './LegalCompliance.jsx';

export default function TelaInicial({
  jogos,
  favoritos,
  onToggleFavorito,
  onAbrirJogo,
  renderizarListaJogos,
}) {
  return (
    <div className="px-4 w-full">
      <JogosPorPaisContinente
        jogos={jogos}
        favoritos={favoritos}
        onToggleFavorito={onToggleFavorito}
        onAbrirJogo={onAbrirJogo}
      />

      {typeof renderizarListaJogos === 'function' ? renderizarListaJogos() : null}

      <div className="px-4 mt-10 mb-10 text-center">
        <LegalCompliance modo="botao" />
      </div>
    </div>
  );
}
