import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, X, ExternalLink } from 'lucide-react';

const DATA_ATUALIZACAO = '26/06/2026';
const EMAIL_SUPORTE = 'betanlyticspro@gmail.com';

const secoesLegais = [
  {
    id: 'privacidade',
    titulo: 'Politica de Privacidade',
    texto: `
O BetAnalytics PRO respeita a privacidade dos usuarios.

Podemos coletar dados como nome, e-mail, status VIP, dados tecnicos do dispositivo, dados de uso, identificadores de publicidade e informacoes necessarias para funcionamento do app.

Esses dados podem ser usados para criar conta, liberar acesso, melhorar o app, exibir anuncios, medir desempenho, prevenir fraudes e cumprir obrigacoes legais.

O BetAnalytics PRO nao vende dados pessoais sensiveis do usuario. Dados podem ser compartilhados apenas com provedores necessarios, como banco de dados, hospedagem, pagamentos, anuncios e ferramentas de analise.

O usuario pode solicitar acesso, correcao ou exclusao de dados pelo e-mail: ${EMAIL_SUPORTE}.
`
  },
  {
    id: 'termos',
    titulo: 'Termos de Uso',
    texto: `
O BetAnalytics PRO e uma plataforma de analise esportiva, estatistica e informacao.

O aplicativo nao e casa de aposta, nao aceita apostas, nao recebe depositos, nao processa saques, nao vende bilhetes e nao garante lucro.

Ao usar o app, o usuario declara que entende que todas as analises sao apenas informativas e que qualquer decisao tomada com base nelas e de responsabilidade exclusiva do proprio usuario.

E proibido usar o app para fins ilegais, por menores de 18 anos ou de forma que viole leis, regulamentos ou direitos de terceiros.
`
  },
  {
    id: 'responsabilidade',
    titulo: '+18 e Jogo Responsavel',
    texto: `
O BetAnalytics PRO e destinado exclusivamente a maiores de 18 anos.

As analises, probabilidades, odds, alertas, estatisticas e informacoes exibidas nao garantem resultados, acertos ou ganhos financeiros.

Use as informacoes com responsabilidade. Nunca use dinheiro destinado a despesas essenciais, nunca tente recuperar perdas e nunca tome decisoes sob pressao emocional.

Caso perceba perda de controle, comportamento compulsivo ou dificuldade de parar, procure ajuda especializada.
`
  },
  {
    id: 'parceiros',
    titulo: 'Casas Parceiras e Links Externos',
    texto: `
O BetAnalytics PRO pode exibir nomes, marcas, anuncios ou links de terceiros.

Quando o usuario acessa um site externo, ele sai do ambiente do BetAnalytics PRO e passa a estar sujeito aos termos, politicas, regras, bonus, verificacoes e condicoes da empresa terceira.

O BetAnalytics PRO nao controla casas parceiras, nao opera apostas, nao define odds, nao aprova pagamentos, nao realiza saques e nao se responsabiliza por decisoes, perdas, bloqueios, promocoes ou regras de terceiros.

Antes de utilizar qualquer servico externo, leia os Termos de Uso e a Politica de Privacidade da respectiva empresa.
`
  },
  {
    id: 'anuncios',
    titulo: 'Publicidade e Anuncios',
    texto: `
O BetAnalytics PRO pode exibir anuncios de terceiros por meio de redes como Google AdMob, Google AdSense ou plataformas semelhantes.

Essas redes podem usar identificadores de publicidade, dados tecnicos e informacoes permitidas para exibir e medir anuncios.

O usuario pode controlar anuncios personalizados nas configuracoes do dispositivo ou nas opcoes fornecidas pelas plataformas de publicidade.
`
  }
];

export default function LegalCompliance({ modo = 'painel' }) {
  const [aberto, setAberto] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState(secoesLegais[0]);
  const [idadeConfirmada, setIdadeConfirmada] = useState(
    localStorage.getItem('betanalytics_18_confirmado') === 'true'
  );

  const confirmarIdade = () => {
    localStorage.setItem('betanalytics_18_confirmado', 'true');
    setIdadeConfirmada(true);
  };

  if (!idadeConfirmada) {
    return (
      <div className="fixed inset-0 bg-[#050816] z-[999999] flex items-center justify-center px-5 text-white">
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-yellow-400" />
            </div>

            <div>
              <h1 className="text-xl font-black">Aviso +18</h1>
              <p className="text-xs text-slate-400 font-bold">
                Conteudo destinado a maiores de idade
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              O BetAnalytics PRO e uma plataforma de analise esportiva e estatistica.
            </p>

            <p>
              O app nao e casa de aposta, nao aceita apostas, nao processa pagamentos
              de apostas e nao garante lucro.
            </p>

            <p>
              Ao continuar, voce declara ter 18 anos ou mais e concorda em usar as
              informacoes com responsabilidade.
            </p>
          </div>

          <button
            onClick={confirmarIdade}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 transition text-white font-black py-4 rounded-2xl text-sm uppercase"
          >
            Tenho 18 anos ou mais e aceito continuar
          </button>

          <button
            onClick={() => window.location.href = 'https://www.google.com'}
            className="w-full mt-3 bg-white/5 text-slate-400 font-bold py-3 rounded-2xl text-xs"
          >
            Sair
          </button>

          <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">
            Use com responsabilidade. Informacoes meramente estatisticas e educativas.
          </p>
        </div>
      </div>
    );
  }

  if (modo === 'botao') {
    return (
      <>
        <button
          onClick={() => setAberto(true)}
          className="text-[10px] text-slate-500 underline font-bold"
        >
          Privacidade, Termos e +18
        </button>

        {aberto && (
          <ModalLegal
            secaoAtiva={secaoAtiva}
            setSecaoAtiva={setSecaoAtiva}
            setAberto={setAberto}
          />
        )}
      </>
    );
  }

  return (
    <>
      <section className="px-4 mt-4 mb-6">
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-black text-white uppercase">
                Seguranca, +18 e Jogo Responsavel
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">
                BetAnalytics e analise esportiva. Nao somos casa de aposta.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Conteudo destinado a maiores de 18 anos. As analises sao informativas,
            nao garantem resultados e nao representam recomendacao financeira.
          </p>

          <button
            onClick={() => setAberto(true)}
            className="mt-4 w-full bg-white/5 border border-white/10 rounded-2xl py-3 text-xs font-black text-blue-400 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Ver Politica, Termos e Avisos
          </button>
        </div>
      </section>

      {aberto && (
        <ModalLegal
          secaoAtiva={secaoAtiva}
          setSecaoAtiva={setSecaoAtiva}
          setAberto={setAberto}
        />
      )}
    </>
  );
}

function ModalLegal({ secaoAtiva, setSecaoAtiva, setAberto }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-[999999] flex items-end sm:items-center justify-center">
      <div className="bg-[#0f172a] text-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="font-black text-sm uppercase">
              Central Legal BetAnalytics
            </h2>
            <p className="text-[10px] text-slate-500">
              Atualizado em {DATA_ATUALIZACAO}
            </p>
          </div>

          <button
            onClick={() => setAberto(false)}
            className="p-2 bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 p-3 border-b border-white/10 no-scrollbar">
          {secoesLegais.map((secao) => (
            <button
              key={secao.id}
              onClick={() => setSecaoAtiva(secao)}
              className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap ${
                secaoAtiva.id === secao.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {secao.titulo}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <h3 className="text-xl font-black mb-4">
            {secaoAtiva.titulo}
          </h3>

          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {secaoAtiva.texto}
          </div>

          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-xs uppercase mb-2">
              <AlertTriangle className="w-4 h-4" />
              Aviso importante
            </div>

            <p className="text-[11px] text-yellow-100/80 leading-relaxed">
              O BetAnalytics PRO nao garante resultados, nao opera apostas e nao
              se responsabiliza por decisoes tomadas pelo usuario. Use as informacoes
              apenas como apoio estatistico.
            </p>
          </div>

          <div className="mt-4 text-[10px] text-slate-600">
            Suporte: betanlyticspro@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}