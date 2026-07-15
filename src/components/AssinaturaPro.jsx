import { ArrowLeft, Calendar, ChevronRight, CreditCard, Crown, DollarSign, Lock, User, Zap } from 'lucide-react';

export default function AssinaturaPro({
  form,
  setForm,
  metodoPagamento,
  setMetodoPagamento,
  pagamentoStatus,
  setPagamentoStatus,
  planoPro,
  iniciarPagamentoPix,
  limparCpf,
  onVoltar,
}) {
  return (
<div className="px-4 pt-24 animate-fade-in pb-28 min-h-screen bg-[#050816] text-white absolute inset-0 z-[999] overflow-y-auto">
<div className="fixed top-0 left-0 w-full bg-[#050816]/95 backdrop-blur-xl z-[9999] px-5 py-4 border-b border-white/10 flex items-center gap-3 shadow-xl"><button onClick={onVoltar} className="p-2 bg-[#0f172a] border border-white/10 rounded-full hover:border-yellow-500/50 transition flex-shrink-0"><ArrowLeft className="w-5 h-5 text-white" /></button><span className="font-black text-white uppercase tracking-widest text-xs">Voltar ao App</span></div>
<div className="bg-[#0f172a] border border-yellow-500/20 rounded-3xl p-6 text-white shadow-[0_0_40px_rgba(234,179,8,0.08)] mt-4 relative overflow-hidden">
<div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
<h2 className="text-2xl font-black mb-2 flex items-center gap-2 relative z-10"><Crown className="w-6 h-6 text-yellow-400" />BetAnalytics<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">PRO</span></h2>
<p className="text-sm font-bold mb-6 text-slate-400 relative z-10">Registe-se e desbloqueie o Radar IA, Value Bets e analises avancadas em tempo real.</p>
<div className="bg-[#050816]/60 rounded-2xl p-5 mb-5 border border-white/5 relative z-10">
<h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-slate-300"><User className="w-4 h-4 text-yellow-500" /> Criar Conta / Login</h3>
<div className="space-y-3">
<input type="text" value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome Completo" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
<input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (Login)" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
<div className="relative"><Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-500" /><input type="password" value={form.senha || ''} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Senha (minimo 6 caracteres)" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" /></div>
<div className="flex gap-3"><div className="w-1/2 relative"><User className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" /><input type="text" value={form.cpf || ''} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="CPF" className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-3 pl-9 text-white placeholder:text-slate-500 text-xs outline-none focus:border-yellow-500 transition-colors" /></div><div className="w-1/2 relative"><Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" /><input type="date" value={form.nascimento || ''} onChange={(e) => setForm({ ...form, nascimento: e.target.value })} className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-3 pl-9 text-white placeholder:text-slate-500 text-xs outline-none focus:border-yellow-500 transition-colors" /></div></div>
</div>
</div>
<div className="bg-[#050816]/60 rounded-2xl p-5 mb-6 border border-white/5 relative z-10">
<h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-slate-300"><DollarSign className="w-4 h-4 text-yellow-500" /> Forma de Pagamento</h3>
<div className="grid grid-cols-3 gap-3">
<button onClick={() => { setMetodoPagamento('pix'); setPagamentoStatus(s => ({ ...s, erro: '', sucesso: '', pix: null })); }} className={`font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1.5 border transition-all ${metodoPagamento === 'pix' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-[#050816] text-slate-500 border-white/5 hover:border-white/20'}`}><Zap className="w-5 h-5" /> PIX</button>
<button onClick={() => { setMetodoPagamento('credito'); setPagamentoStatus(s => ({ ...s, erro: '', sucesso: '', pix: null })); }} className={`font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1.5 border transition-all ${metodoPagamento === 'credito' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-[#050816] text-slate-500 border-white/5 hover:border-white/20'}`}><CreditCard className="w-5 h-5" /> Credito</button>
<button onClick={() => { setMetodoPagamento('debito'); setPagamentoStatus(s => ({ ...s, erro: '', sucesso: '', pix: null })); }} className={`font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1.5 border transition-all ${metodoPagamento === 'debito' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-[#050816] text-slate-500 border-white/5 hover:border-white/20'}`}><CreditCard className="w-5 h-5" /> Debito</button>
</div>
<div className="mt-4 rounded-2xl border border-white/10 bg-[#050816] p-4">
<div className="flex items-center justify-between gap-3 mb-3">
<div>
<div className="text-xs font-black text-white uppercase">Plano PRO Mensal</div>
<div className="text-[10px] text-slate-400 font-bold">Liberacao somente apos pagamento aprovado</div>
</div>
<div className="text-lg font-black text-yellow-400">R$ {planoPro.valor.toFixed(2).replace('.', ',')}</div>
</div>
{pagamentoStatus.erro && (<div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[11px] font-bold text-red-400">{pagamentoStatus.erro}</div>)}
{pagamentoStatus.sucesso && (<div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] font-bold text-emerald-400">{pagamentoStatus.sucesso}</div>)}
{metodoPagamento === 'pix' && (
<div className="space-y-3">
<p className="text-[11px] font-bold text-slate-400">O QR Code sera gerado pelo Mercado Pago. O VIP so libera quando o pagamento constar como aprovado.</p>
{pagamentoStatus.pix?.qr_code_base64 && (
<div className="bg-white rounded-2xl p-3 flex justify-center">
<img src={`data:image/jpeg;base64,${pagamentoStatus.pix.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48 object-contain" />
</div>
)}
{pagamentoStatus.pix?.qr_code && (
<div>
<label className="text-[10px] font-black text-slate-400 uppercase">Pix Copia e Cola</label>
<textarea readOnly value={pagamentoStatus.pix.qr_code} className="mt-2 w-full min-h-[90px] rounded-xl bg-[#020617] border border-white/10 p-3 text-[10px] text-slate-200 outline-none" />
<button onClick={() => navigator.clipboard?.writeText(pagamentoStatus.pix.qr_code)} className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 py-2 text-xs font-black text-white">COPIAR CODIGO PIX</button>
</div>
)}
{pagamentoStatus.pix?.ticket_url && (
<a href={pagamentoStatus.pix.ticket_url} target="_blank" rel="noopener noreferrer" className="block text-center rounded-xl bg-blue-600 py-3 text-xs font-black text-white">ABRIR PIX NO MERCADO PAGO</a>
)}
<button onClick={iniciarPagamentoPix} disabled={pagamentoStatus.loading} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex justify-center items-center gap-2 disabled:opacity-60 relative z-10">
{pagamentoStatus.loading ? 'GERANDO PAGAMENTO...' : 'GERAR QR CODE PIX'} <ChevronRight className="w-5 h-5" />
</button>
</div>
)}
{(metodoPagamento === 'credito' || metodoPagamento === 'debito') && (
<form id="form-checkout" className="space-y-3">
<p className="text-[11px] font-bold text-slate-400">Os dados do cartao sao tokenizados pelo Mercado Pago. O VIP so libera se o pagamento for aprovado.</p>
<div>
<label className="text-[9px] font-black text-slate-500 uppercase">Numero do cartao</label>
<div id="form-checkout__cardNumber" className="mt-1 min-h-[44px] w-full rounded-xl bg-[#020617] border border-white/10 px-4 py-3 text-white"></div>
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label className="text-[9px] font-black text-slate-500 uppercase">Validade</label>
<div id="form-checkout__expirationDate" className="mt-1 min-h-[44px] rounded-xl bg-[#020617] border border-white/10 px-4 py-3 text-white"></div>
</div>
<div>
<label className="text-[9px] font-black text-slate-500 uppercase">CVV</label>
<div id="form-checkout__securityCode" className="mt-1 min-h-[44px] rounded-xl bg-[#020617] border border-white/10 px-4 py-3 text-white"></div>
</div>
</div>
<input id="form-checkout__cardholderName" defaultValue={form.nome || ''} placeholder="Nome impresso no cartao" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
<input id="form-checkout__cardholderEmail" defaultValue={form.email || ''} placeholder="E-mail" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
<div className="grid grid-cols-2 gap-3">
<select id="form-checkout__identificationType" className="w-full bg-[#020617] border border-white/10 rounded-xl px-3 py-3 text-white text-xs outline-none focus:border-yellow-500 transition-colors"></select>
<input id="form-checkout__identificationNumber" defaultValue={limparCpf(form.cpf || '')} placeholder="CPF" className="w-full bg-[#020617] border border-white/10 rounded-xl px-3 py-3 text-white placeholder:text-slate-500 text-xs outline-none focus:border-yellow-500 transition-colors" />
</div>
<select id="form-checkout__issuer" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors"></select>
<select id="form-checkout__installments" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors"></select>
<button id="form-checkout__submit" type="submit" disabled={pagamentoStatus.loading} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex justify-center items-center gap-2 disabled:opacity-60 relative z-10">
{pagamentoStatus.loading ? 'PROCESSANDO...' : `PAGAR NO ${metodoPagamento === 'credito' ? 'CREDITO' : 'DEBITO'}`} <ChevronRight className="w-5 h-5" />
</button>
</form>
)}
</div>
</div>
</div>
</div>
  );
}
