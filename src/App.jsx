import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, Target, LogOut, Shield, Award, Crown, User, Mail, CreditCard, CheckCircle, Activity, ChevronRight } from 'lucide-react';

// ============================================================================
// 📊 DADOS DOS GRÁFICOS (Design Exato)
// ============================================================================
const crescimentoBancaGlobal = [ 
  { dia: "Seg", banca: 990 }, { dia: "Ter", banca: 1080 }, { dia: "Qua", banca: 1150 }, 
  { dia: "Qui", banca: 1220 }, { dia: "Sex", banca: 1290 }
];

const desempenhoDiario = [
  { dia: "Seg", acertos: 14, erros: 3 }, { dia: "Ter", acertos: 18, erros: 2 }, 
  { dia: "Qua", acertos: 12, erros: 5 }, { dia: "Qui", acertos: 20, erros: 4 }, 
  { dia: "Sex", acertos: 25, erros: 6 }
];

export default function Perfil({ 
  userData, 
  form, 
  setForm, 
  nivelUsuario, 
  xp, 
  setViewMode, 
  apostas, 
  bancaInicial, 
  metaMensal, 
  setMenuAtivo 
}) {
  
  const [salvando, setSalvando] = useState(false);

  const fazerLogout = () => {
    localStorage.removeItem('bet_sessao_ativa');
    window.location.reload();
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarDados = (e) => {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      alert('Dados atualizados com sucesso!');
    }, 1000);
  };

  // Cálculos de exemplo para a Meta Mensal
  const lucroAtual = 470; // Mock baseado no gráfico
  const progressoMeta = Math.min((lucroAtual / (metaMensal || 2000)) * 100, 100);

  return (
    <div className="pb-20 w-full animate-fade-in text-white pt-2">
      
      {/* =========================================================
          👤 CABEÇALHO DO PERFIL
      ========================================================= */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 p-1 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-full bg-[#050816] flex items-center justify-center border-2 border-transparent">
              <span className="text-2xl font-black text-white">{userData?.nome?.charAt(0) || 'U'}</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {userData?.nome || 'Utilizador'}
              {userData?.is_vip && <Crown className="w-4 h-4 text-yellow-400" />}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-500/20">
                Nível: {nivelUsuario || 'Profissional'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {xp || 350} XP
              </span>
            </div>
          </div>
        </div>
        <button onClick={fazerLogout} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-colors border border-red-500/20">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* =========================================================
          🎯 PROGRESSO DA META MENSAL
      ========================================================= */}
      <div className="mb-6 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-lg relative">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meta Mensal</h3>
            <div className="text-lg font-black text-white">R$ {lucroAtual.toFixed(2)} <span className="text-sm text-slate-500">/ R$ {metaMensal?.toFixed(2) || '2000.00'}</span></div>
          </div>
          <div className="text-blue-400 font-black text-sm">{progressoMeta.toFixed(1)}%</div>
        </div>
        <div className="w-full bg-[#050816] rounded-full h-3 border border-white/5 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full relative" style={{ width: `${progressoMeta}%` }}>
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* =========================================================
          📊 GRÁFICO 1: EVOLUÇÃO DE BANCA (Linhas)
      ========================================================= */}
      <div className="mb-6 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-2xl relative">
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Desempenho Semanal</h3>
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            Crescimento Líquido 
            <span className="text-emerald-400 text-[10px] font-black bg-[#050816] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +47.0%
            </span>
          </h2>
        </div>
        
        <div className="w-full h-48 sm:h-56 relative z-10 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crescimentoBancaGlobal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="dia" stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              />
              <Line 
                type="linear" 
                dataKey="banca" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================================================
          📊 GRÁFICO 2: PRECISÃO DA IA (Barras)
      ========================================================= */}
      <div className="mb-8 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-2xl relative">
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precisão da IA</h3>
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            Acertos vs Erros 
            <span className="text-emerald-400 text-[10px] font-black bg-[#050816] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Target className="w-3 h-3" /> 84% Win Rate
            </span>
          </h2>
        </div>
        
        <div className="w-full h-48 sm:h-56 relative z-10 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={desempenhoDiario} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={6} barGap={4}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="dia" stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey="acertos" name="Greens" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="erros" name="Reds" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================================================
          📝 DADOS PESSOAIS E FORMULÁRIO
      ========================================================= */}
      <div className="mb-8 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-lg">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
          <User className="w-4 h-4" /> Detalhes da Conta
        </h3>
        
        <form onSubmit={salvarDados} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Nome Completo</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="w-4 h-4 text-slate-500"/></div>
              <input type="text" name="nome" value={form?.nome || userData?.nome || ''} onChange={handleInputChange} className="w-full bg-[#050816] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="Seu nome" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Email</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="w-4 h-4 text-slate-500"/></div>
              <input type="email" name="email" value={form?.email || userData?.email || ''} onChange={handleInputChange} className="w-full bg-[#050816] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="seu@email.com" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">CPF / Documento</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><CreditCard className="w-4 h-4 text-slate-500"/></div>
              <input type="text" name="cpf" value={form?.cpf || ''} onChange={handleInputChange} className="w-full bg-[#050816] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="000.000.000-00" />
            </div>
          </div>

          <button type="submit" disabled={salvando} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl mt-2 transition-all active:scale-95 flex justify-center items-center gap-2">
            {salvando ? <span className="animate-pulse">Guardando...</span> : <><CheckCircle className="w-5 h-5"/> Salvar Alterações</>}
          </button>
        </form>
      </div>

      {/* =========================================================
          📜 HISTÓRICO RECENTE
      ========================================================= */}
      <div className="mb-8 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4" /> Atividade Recente
          </h3>
          <span className="text-[10px] text-blue-400 font-bold cursor-pointer">Ver Tudo</span>
        </div>

        {(!apostas || apostas.length === 0) ? (
          <div className="text-center py-6 bg-[#050816] rounded-2xl border border-white/5">
            <p className="text-xs text-slate-500 font-bold">Nenhum registo encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apostas.slice(0, 3).map((aposta, i) => (
              <div key={i} className="flex justify-between items-center bg-[#050816] p-3 rounded-xl border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">{aposta.jogo || 'Jogo Analisado'}</div>
                  <div className="text-[9px] text-slate-400 uppercase mt-0.5">{aposta.data || 'Hoje'}</div>
                </div>
                <div className={`text-xs font-black px-2 py-1 rounded-md ${aposta.resultado === 'green' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {aposta.odd || '@1.85'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          ⚙️ GESTÃO E CONQUISTAS
      ========================================================= */}
      <div className="space-y-3 px-2">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2 mb-4">Gestão da Conta</h3>
        
        {!userData?.is_vip && (
          <button onClick={() => setMenuAtivo('assinar pro')} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 rounded-2xl flex items-center justify-between text-black font-black shadow-[0_0_20px_rgba(234,179,8,0.2)] mb-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6" />
              <span>Fazer Upgrade para VIP PRO</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </button>
        )}

        <button className="w-full bg-[#0f172a] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-sm text-slate-200">Segurança e Privacidade</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>

        <button className="w-full bg-[#0f172a] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-sm text-slate-200">Conquistas Desbloqueadas</span>
          </div>
          <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">3 de 12</span>
        </button>
      </div>

    </div>
  );
}