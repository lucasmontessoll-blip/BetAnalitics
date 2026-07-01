import React from 'react';
import {
  User,
  Star,
  Settings,
  Crown,
  FileText,
  BookOpen,
  LifeBuoy,
  TrendingUp,
  LogOut,
  ChevronRight,
  Bell,
  Mail,
  ShieldCheck
} from 'lucide-react';

export default function Perfil({
  userData,
  form,
  solicitarPermissaoNotificacao,
  setViewMode,
  setMenuAtivo
}) {
  const nomeUsuario = form?.nome || userData?.nome || 'Usuário BetAnalytics';
  const emailUsuario = userData?.email || form?.email || 'sem-email';
  const isVip = Boolean(userData?.is_vip);

  const fazerLogout = () => {
    localStorage.removeItem('bet_sessao_ativa');
    localStorage.removeItem('bet_user_nome');
    localStorage.removeItem('bet_user_email');
    window.location.reload();
  };

  const abrirSuporte = () => {
    window.location.href = 'mailto:betanlyticspro@gmail.com';
  };

  const abrirPlanoPro = () => {
    if (setMenuAtivo) {
      setMenuAtivo('assinar pro');
      return;
    }

    setViewMode?.('assinar-pro');
  };

  const opcoesPerfil = [
    {
      titulo: 'Favoritos',
      descricao: 'Times, jogos salvos e alertas favoritos',
      icon: Star,
      cor: 'text-yellow-400',
      borda: 'border-yellow-500/20',
      acao: () => setViewMode?.('jogos')
    },
    {
      titulo: 'Configurações',
      descricao: 'Notificações e preferências do aplicativo',
      icon: Settings,
      cor: 'text-blue-400',
      borda: 'border-blue-500/20',
      acao: solicitarPermissaoNotificacao
    },
    {
      titulo: 'Plano PRO',
      descricao: isVip ? 'Gerenciar assinatura ativa' : 'Ver benefícios e assinar',
      icon: Crown,
      cor: 'text-amber-400',
      borda: 'border-amber-500/20',
      acao: abrirPlanoPro
    },
    {
      titulo: 'Termos e Privacidade',
      descricao: 'Política, +18, responsabilidade e condições de uso',
      icon: FileText,
      cor: 'text-slate-300',
      borda: 'border-white/10',
      acao: () => setViewMode?.('termos')
    },
    {
      titulo: 'Educação',
      descricao: 'Odds, EV+, gestão de banca e jogo responsável',
      icon: BookOpen,
      cor: 'text-emerald-400',
      borda: 'border-emerald-500/20',
      acao: () => setViewMode?.('educacao')
    },
    {
      titulo: 'Suporte',
      descricao: 'Fale com o suporte do BetAnalytics PRO',
      icon: LifeBuoy,
      cor: 'text-cyan-400',
      borda: 'border-cyan-500/20',
      acao: abrirSuporte
    },
    {
      titulo: 'Histórico de Assertividade',
      descricao: 'Acompanhar desempenho e acertos da IA',
      icon: TrendingUp,
      cor: 'text-purple-400',
      borda: 'border-purple-500/20',
      acao: () => setViewMode?.('historico')
    }
  ];

  return (
    <div className="w-full pb-8">
      <div className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#050816] border border-blue-500/20 rounded-3xl p-5 mb-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 bottom-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-18 h-18 min-w-18 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.45)] border border-white/10">
            <User className="w-9 h-9 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-white truncate">
                {nomeUsuario}
              </h2>

              {isVip && (
                <span className="bg-yellow-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase">
                  VIP PRO
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              {emailUsuario}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="bg-[#050816] border border-white/10 text-blue-300 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Conta segura
              </span>

              <span className="bg-[#050816] border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                +18
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase">
            Perfil do usuário
          </h3>

          <span className="text-[10px] text-slate-500 font-black uppercase">
            Central simples
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {opcoesPerfil.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.titulo}
                onClick={item.acao}
                className={`w-full bg-[#050816] border ${item.borda} rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition hover:bg-[#111827]`}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${item.cor}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-white uppercase truncate">
                    {item.titulo}
                  </div>

                  <div className="text-[10px] text-slate-500 font-bold mt-1 truncate">
                    {item.descricao}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={fazerLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition hover:bg-red-500/15"
      >
        <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <LogOut className="w-5 h-5 text-red-400" />
        </div>

        <div className="text-left min-w-0 flex-1">
          <div className="text-sm font-black uppercase">
            Sair da conta
          </div>

          <div className="text-[10px] text-red-300/70 font-bold mt-1">
            Encerrar sessão atual
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-red-400/40 flex-shrink-0" />
      </button>

      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
          BetAnalytics PRO é uma plataforma de análise esportiva. Não somos casa de aposta,
          não aceitamos depósitos e não garantimos lucro.
        </p>
      </div>
    </div>
  );
}
