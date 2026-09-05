import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  ShieldCheck
} from 'lucide-react';

export default function AssinaturaPlayStore({
  onVoltar
}) {
  return (
    <main
      data-bet-play-consumption-only="true"
      className="absolute inset-0 z-[999] min-h-screen overflow-y-auto bg-[#050816] px-4 pb-28 pt-24 text-white"
    >
      <div className="mx-auto max-w-xl">
        <section className="relative overflow-hidden rounded-[30px] border border-blue-400/15 bg-[#0f172a] p-6 shadow-2xl">
          <div className="absolute right-0 top-0 h-48 w-48 -translate-y-16 translate-x-16 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              Versão Google Play
            </span>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
                <Crown className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-black">
                  BetAnalytics PRO
                </h1>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Acesso vinculado à sua conta
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                <div>
                  <p className="text-sm font-black text-white">
                    Acesso PRO existente continua disponível
                  </p>

                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-400">
                    Se a sua conta já possui acesso PRO ativo,
                    entre normalmente e utilize os recursos
                    vinculados à sua conta.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-400/10 bg-blue-500/[0.05] p-4">
              <p className="text-[11px] font-semibold leading-relaxed text-slate-300">
                Esta versão do aplicativo não oferece compra,
                checkout ou meios de pagamento dentro do app.
              </p>
            </div>

            <button
              type="button"
              onClick={onVoltar}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-wide text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao aplicativo
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
