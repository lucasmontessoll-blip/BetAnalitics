import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, CreditCard, Eye, MousePointerClick, RefreshCw, RotateCcw, UserPlus, Users, Wallet } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { carregarDashboard, salvarCusto } from '../services/growthAnalytics.js';

const PERIODOS = [7, 30, 90];
const NOMES = { page_view: 'Visualização', cta_click: 'Clique', signup_started: 'Cadastro iniciado', feature_free_used: 'Recurso gratuito', feature_pro_used: 'Recurso PRO', subscription_cancelled: 'Cancelamento' };
const dinheiro = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = (v) => Number(v || 0).toLocaleString('pt-BR');

function periodo(dias) {
  const to = new Date();
  const from = new Date(to.getTime() - (dias - 1) * 86400000);
  from.setHours(0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
}

function Card({ titulo, valor, detalhe, icon: Icon, cor = 'text-blue-300' }) {
  return <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-4 shadow-lg"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{titulo}</p><Icon className={`h-5 w-5 ${cor}`} aria-hidden="true" /></div><p className="mt-3 text-2xl font-black">{valor}</p><p className="mt-1 text-[11px] font-bold text-slate-500">{detalhe}</p></article>;
}

export default function AdminResumoPro({ setViewMode, userData }) {
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ cost_date: new Date().toISOString().slice(0, 10), source: '', campaign: '', amount: '', notes: '' });

  const carregar = useCallback(async () => {
    setCarregando(true); setErro('');
    try { const p = periodo(dias); setDados(await carregarDashboard(p.from, p.to)); }
    catch (e) { setErro(e?.message || 'Não foi possível carregar as métricas.'); }
    finally { setCarregando(false); }
  }, [dias]);

  useEffect(() => { carregar(); }, [carregar]);
  const m = dados?.metrics || {};
  const funil = useMemo(() => [
    { name: 'Visualizações', total: Number(m.views || 0) }, { name: 'Cliques', total: Number(m.clicks || 0) },
    { name: 'Cadastros', total: Number(m.registrations || 0) }, { name: 'Novos PRO', total: Number(m.new_subscribers || 0) }
  ], [m.views, m.clicks, m.registrations, m.new_subscribers]);

  async function enviarCusto(e) {
    e.preventDefault(); setErro('');
    try { await salvarCusto({ ...form, amount: Number(form.amount) }); setForm((a) => ({ ...a, amount: '', notes: '' })); await carregar(); }
    catch (ex) { setErro(ex?.message || 'Não foi possível salvar o custo.'); }
  }

  if (userData?.is_admin !== true) return <div className="p-8 text-center font-bold text-red-300">Acesso permitido somente ao administrador.</div>;

  return <main className="w-full px-4 pb-28 text-white animate-fade-in">
    <header className="mb-5 flex items-center gap-3"><button type="button" onClick={() => setViewMode?.('perfil')} aria-label="Voltar ao perfil" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a]"><ArrowLeft className="h-5 w-5" /></button><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.2em] text-yellow-400">Área administrativa segura</p><h1 className="text-2xl font-black">Crescimento e conversão</h1><p className="text-[11px] font-bold text-slate-400">Dados reais do servidor, sem dados pessoais nos eventos.</p></div><button type="button" onClick={carregar} disabled={carregando} aria-label="Atualizar métricas" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} /></button></header>
    <nav aria-label="Período" className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">{PERIODOS.map((p) => <button type="button" key={p} onClick={() => setDias(p)} className={`rounded-xl py-3 text-xs font-black ${dias === p ? 'bg-yellow-400 text-black' : 'text-slate-300'}`}>{p} dias</button>)}</nav>
    {erro && <div role="alert" className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">{erro}</div>}
    <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card titulo="Visualizações" valor={numero(m.views)} detalhe={`${numero(m.unique_visitors)} visitantes únicos`} icon={Eye}/><Card titulo="Cliques no link" valor={numero(m.clicks)} detalhe={`${m.click_rate || 0}% das visualizações`} icon={MousePointerClick} cor="text-cyan-300"/><Card titulo="Cadastros" valor={numero(m.registrations)} detalhe={`${m.registration_rate || 0}% dos cliques`} icon={UserPlus} cor="text-emerald-300"/><Card titulo="Uso gratuito" valor={numero(m.free_users)} detalhe="usuários únicos ativos" icon={Users} cor="text-violet-300"/>
      <Card titulo="Assinaturas iniciadas" valor={numero(m.subscription_starts)} detalhe={`${numero(m.approved_payments)} aprovadas`} icon={CreditCard} cor="text-yellow-300"/><Card titulo="Novos assinantes" valor={numero(m.new_subscribers)} detalhe={`${m.paid_rate || 0}% dos cadastros`} icon={BarChart3} cor="text-green-300"/><Card titulo="Renovações" valor={numero(m.renewals)} detalhe={`${numero(m.cancellations)} cancelamentos`} icon={RotateCcw}/><Card titulo="CAC" valor={m.cac == null ? 'Sem base' : dinheiro(m.cac)} detalhe={`Custo ${dinheiro(m.campaign_cost)}`} icon={Wallet} cor="text-orange-300"/>
    </section>
    <section className="mt-5 grid gap-5 lg:grid-cols-2"><Chart title="Evolução diária"><AreaChart data={dados?.timeline || []}><defs><linearGradient id="r51" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={.5}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ffffff12" vertical={false}/><XAxis dataKey="date" tick={{ fill:'#94a3b8', fontSize:10 }} tickFormatter={(v) => v.slice(5)}/><YAxis tick={{ fill:'#94a3b8',fontSize:10 }}/><Tooltip contentStyle={{background:'#020617',border:'1px solid #334155',borderRadius:12}}/><Area type="monotone" dataKey="views" name="Visualizações" stroke="#60a5fa" fill="url(#r51)"/><Area type="monotone" dataKey="registrations" name="Cadastros" stroke="#34d399" fill="transparent"/></AreaChart></Chart><Chart title="Funil de conversão"><BarChart data={funil} layout="vertical"><CartesianGrid stroke="#ffffff12" horizontal={false}/><XAxis type="number" tick={{fill:'#94a3b8',fontSize:10}}/><YAxis dataKey="name" type="category" width={90} tick={{fill:'#cbd5e1',fontSize:10}}/><Tooltip contentStyle={{background:'#020617',border:'1px solid #334155',borderRadius:12}}/><Bar dataKey="total" fill="#facc15" radius={[0,8,8,0]}/></BarChart></Chart></section>
    <section className="mt-5 grid gap-5 lg:grid-cols-2"><article className="rounded-3xl border border-white/10 bg-[#0f172a] p-4"><h2 className="mb-4 font-black">Origem das visualizações</h2><div className="space-y-2">{(dados?.sources || []).map((x) => <div key={x.name} className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-xs"><span>{x.name}</span><strong>{numero(x.views)}</strong></div>)}</div></article><CostForm form={form} setForm={setForm} onSubmit={enviarCusto}/></section>
    <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]"><div className="border-b border-white/10 p-4"><h2 className="font-black">Registros recentes</h2><p className="text-[11px] text-slate-400">Sem e-mail, IP, token ou conteúdo digitado.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-black/20 text-slate-400"><tr>{['Data','Evento','Plataforma','Origem','Campanha'].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{(dados?.recent_events || []).map((x) => <tr key={x.id} className="border-t border-white/5"><td className="p-3">{new Date(x.occurred_at).toLocaleString('pt-BR')}</td><td className="p-3 font-bold">{NOMES[x.event_name] || x.event_name}</td><td className="p-3">{x.platform}</td><td className="p-3">{x.source}</td><td className="p-3">{x.campaign}</td></tr>)}</tbody></table></div></section>
  </main>;
}

function Chart({ title, children }) { return <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-4"><h2 className="mb-4 font-black">{title}</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></article>; }
function CostForm({ form, setForm, onSubmit }) { const field=(key,value)=>setForm({...form,[key]:value}); return <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-4"><h2 className="font-black">Investimento de campanha</h2><p className="mb-4 text-[11px] text-slate-400">Alimenta o cálculo real de CAC.</p><form onSubmit={onSubmit} className="grid grid-cols-2 gap-3"><Input label="Data" type="date" value={form.cost_date} onChange={(e)=>field('cost_date',e.target.value)}/><Input label="Valor (R$)" type="number" min="0" step="0.01" value={form.amount} onChange={(e)=>field('amount',e.target.value)}/><Input label="Origem" value={form.source} maxLength="80" placeholder="Instagram" onChange={(e)=>field('source',e.target.value)}/><Input label="Campanha" value={form.campaign} maxLength="100" placeholder="Lançamento" onChange={(e)=>field('campaign',e.target.value)}/><label className="col-span-2 text-xs font-bold text-slate-300">Observação<input maxLength="240" value={form.notes} onChange={(e)=>field('notes',e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3"/></label><button className="col-span-2 rounded-xl bg-yellow-400 py-3 font-black text-black">Salvar custo</button></form></article>; }
function Input({ label, ...props }) { return <label className="text-xs font-bold text-slate-300">{label}<input required {...props} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3"/></label>; }
