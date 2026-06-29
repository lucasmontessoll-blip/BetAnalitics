import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, X, ExternalLink } from 'lucide-react';

const DATA_ATUALIZACAO = '26/06/2026';
const EMAIL_SUPORTE = 'seuemail@exemplo.com';

const secoesLegais = [
  {
    id: 'privacidade',
    titulo: 'Política de Privacidade',
    texto: `
O BetAnalytics PRO respeita a privacidade dos usuários.

Podemos coletar dados como nome, e-mail, status VIP, dados técnicos do dispositivo, dados de uso, identificadores de publicidade e informações necessárias para funcionamento do app.

Esses dados podem ser usados para criar conta, liberar acesso, melhorar o app, exibir anúncios, medir desempenho, prevenir fraudes e cumprir obrigações legais.

O BetAnalytics PRO não vende dados pessoais sensíveis do usuário. Dados podem ser compartilhados apenas com provedores necessários, como banco de dados, hospedagem, pagamentos, anúncios e ferramentas de análise.

O usuário pode solicitar acesso, correção ou exclusão de dados pelo e-mail: ${EMAIL_SUPORTE}.
`
  },
  {
    id: 'termos',
    titulo: 'Termos de Uso',
    texto: `
O BetAnalytics PRO é uma plataforma de análise esportiva, estatística e informação.

O aplicativo não é casa de aposta, não aceita apostas, não recebe depósitos, não processa saques, não vende bilhetes e não garante lucro.

Ao usar o app, o usuário declara que entende que todas as análises são apenas informativas e que qualquer decisão tomada com base nelas é de responsabilidade exclusiva do próprio usuário.

É proibido usar o app para fins ilegais, por menores de 18 anos ou de forma que viole leis, regulamentos ou direitos de terceiros.
`
  },
  {
    id: 'responsabilidade',
    titulo: '+18 e Jogo Responsável',
    texto: `
O BetAnalytics PRO é destinado exclusivamente a maiores de 18 anos.

As análises, probabilidades, odds, alertas, estatísticas e informações exibidas não garantem resultados, acertos ou ganhos financeiros.

Use as informações com responsabilidade. Nunca use dinheiro destinado a despesas essenciais, nunca tente recuperar perdas e nunca tome decisões sob pressão emocional.

Caso perceba perda de controle, comportamento compulsivo ou dificuldade de parar, procure ajuda especializada.
`
  },
  {
    id: 'parceiros',
    titulo: 'Casas Parceiras e Links Externos',
    texto: `
O BetAnalytics PRO pode exibir nomes, marcas, anúncios ou links de terceiros.

Quando o usuário acessa um site externo, ele sai do ambiente do BetAnalytics PRO e passa a estar sujeito aos termos, políticas, regras, bônus, verificações e condições da empresa terceira.

O BetAnalytics PRO não controla casas parceiras, não opera apostas, não define odds, não aprova pagamentos, não realiza saques e não se responsabiliza por decisões, perdas, bloqueios, promoções ou regras de terceiros.

Antes de utilizar qualquer serviço externo, leia os Termos de Uso e a Política de Privacidade da respectiva empresa.
`
  },
  {
    id: 'anuncios',
    titulo: 'Publicidade e Anúncios',
    texto: `
O BetAnalytics PRO pode exibir anúncios de terceiros por meio de redes como Google AdMob, Google AdSense ou plataformas semelhantes.

Essas redes podem usar identificadores de publicidade, dados técnicos e informações permitidas para exibir e medir anúncios.

O usuário pode controlar anúncios personalizados nas configurações do dispositivo ou nas opções fornecidas pelas plataformas de publicidade.
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
                Conteúdo destinado a maiores de idade
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              O BetAnalytics PRO é uma plataforma de análise esportiva e estatística.
            </p>

            <p>
              O app não é casa de aposta, não aceita apostas, não processa pagamentos
              de apostas e não garante lucro.
            </p>

            <p>
              Ao continuar, você declara ter 18 anos ou mais e concorda em usar as
              informações com responsabilidade.
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
            Use com responsabilidade. Informações meramente estatísticas e educativas.
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
                Segurança, +18 e Jogo Responsável
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">
                BetAnalytics é análise esportiva. Não somos casa de aposta.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Conteúdo destinado a maiores de 18 anos. As análises são informativas,
            não garantem resultados e não representam recomendação financeira.
          </p>

          <button
            onClick={() => setAberto(true)}
            className="mt-4 w-full bg-white/5 border border-white/10 rounded-2xl py-3 text-xs font-black text-blue-400 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Ver Política, Termos e Avisos
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
              O BetAnalytics PRO não garante resultados, não opera apostas e não
              se responsabiliza por decisões tomadas pelo usuário. Use as informações
              apenas como apoio estatístico.
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