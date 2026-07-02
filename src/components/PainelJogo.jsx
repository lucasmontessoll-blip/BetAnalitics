import React,{useMemo,useState} from 'react';
import {ArrowLeft,Star,BarChart3,MessageCircle,PlayCircle,Image,Shield,Users,Activity,Target,TrendingUp,Trophy,Calendar,Clock,Percent,ChevronRight,Camera,Info,Flame,Zap} from 'lucide-react';

const abas=[
  {id:'detalhes',label:'Detalhes'},
  {id:'formacoes',label:'Formações'},
  {id:'estatisticas',label:'Estatísticas'},
  {id:'comentario',label:'Comentário'},
  {id:'partidas',label:'Partidas'},
  {id:'fase',label:'Fase eliminatória'},
  {id:'midia',label:'Mídia'},
  {id:'probabilidades',label:'Probabilidades'}
];

function n(v,padrao=0){const x=Number(v);return Number.isFinite(x)?x:padrao;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function pct(v){return `${Math.round(v)}%`;}
function escudo(url,nome){return url||`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nome||'Time')}`;}

export default function PainelJogo({jogo,setJogoSelecionado,bancaInicial=1000,gerarExplicacaoIA,calcularStake,calcularKelly}) {
  const [aba,setAba]=useState('detalhes');
  const home=jogo?.home_team||'Time Casa';
  const away=jogo?.away_team||'Time Fora';
  const liga=jogo?.league_name||'Competição';
  const status=jogo?.status||'Not Started';
  const minuto=jogo?.time_elapsed||jogo?.elapsed||'';
  const scoreHome=n(jogo?.scoreHome ?? jogo?.goals_home,0);
  const scoreAway=n(jogo?.scoreAway ?? jogo?.goals_away,0);
  const odd=n(jogo?.odd_principal,1.82);
  const confianca=clamp(n(jogo?.confianca_ia,87),1,99);
  const ev=(((confianca/100)*odd)-1)*100;
  const aoVivo=status==='Live'||String(minuto).includes("'");
  const finalizado=status==='Finished'||status==='FT';
  const naoIniciado=status==='Not Started'||status==='NS';

  const dados=useMemo(()=>{
    const casaAtaque=clamp(54+(confianca-80)*0.7,45,72);
    const foraAtaque=100-casaAtaque;
    const posseCasa=clamp(48+(confianca-80)*0.35+(scoreHome-scoreAway)*3,38,66);
    const posseFora=100-posseCasa;
    const chutesCasa=clamp(Math.round(8+(confianca-75)/4+scoreHome*2),5,21);
    const chutesFora=clamp(Math.round(7+(100-confianca)/9+scoreAway*2),4,19);
    const escanteiosCasa=clamp(Math.round(3+(chutesCasa/5)),1,10);
    const escanteiosFora=clamp(Math.round(2+(chutesFora/6)),1,9);
    const probCasa=clamp(confianca,35,78);
    const probEmpate=clamp(24-(probCasa-50)*0.25,12,33);
    const probFora=clamp(100-probCasa-probEmpate,10,45);
    const stake=typeof calcularStake==='function'?calcularStake(bancaInicial,confianca,odd):Math.max(5,Math.round(bancaInicial*0.03));
    const kelly=typeof calcularKelly==='function'?calcularKelly(confianca/100,odd):Math.max(0,(((confianca/100)*(odd-1))-(1-confianca/100))/(odd-1));
    return{casaAtaque,foraAtaque,posseCasa,posseFora,chutesCasa,chutesFora,escanteiosCasa,escanteiosFora,probCasa,probEmpate,probFora,stake,kelly:clamp(kelly*100,0,12)};
  },[jogo,bancaInicial,calcularStake,calcularKelly,confianca,odd,scoreHome,scoreAway]);

  const jogadoresCasa=['Goleiro','Lateral D.','Zagueiro','Zagueiro','Lateral E.','Volante','Meia','Meia Of.','Ponta D.','Centroavante','Ponta E.'];
  const jogadoresFora=['Goleiro','Lateral D.','Zagueiro','Zagueiro','Lateral E.','Volante','Meia','Meia Of.','Ponta D.','Centroavante','Ponta E.'];
  const eventos=[
    {min:"12'",txt:`${home} começa pressionando pelo lado direito.`},
    {min:"23'",txt:`Finalização perigosa de ${away}, defesa segura.`},
    {min:"36'",txt:`Gol confirmado para ${home}. A IA aumenta a confiança.`},
    {min:"52'",txt:`Posse equilibrada, mas ${home} gera mais chances claras.`},
    {min:"67'",txt:`Odd em queda para ${home}. Possível value bet detectado.`}
  ];
  const ultimosCasa=['W','W','D','W','L'];
  const ultimosFora=['D','W','L','W','D'];

  const StatBar=({nome,casa,fora})=>(<div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 mb-3"><div className="flex justify-between text-xs font-black text-white mb-2"><span>{casa}</span><span className="text-slate-400">{nome}</span><span>{fora}</span></div><div className="flex h-2 rounded-full overflow-hidden bg-slate-800"><div style={{width:`${clamp(casa,5,95)}%`}} className="bg-blue-500"></div><div style={{width:`${clamp(fora,5,95)}%`}} className="bg-red-500"></div></div></div>);
  const MiniCard=({icon:Icon,titulo,valor,sub,cor='text-blue-400'})=>(<div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4"><div className={`w-9 h-9 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-center mb-3 ${cor}`}><Icon className="w-5 h-5"/></div><div className="text-[10px] text-slate-500 font-black uppercase">{titulo}</div><div className="text-xl font-black text-white">{valor}</div>{sub&&<div className="text-[10px] text-slate-500 font-bold mt-1">{sub}</div>}</div>);
  const ResultadoTopo=()=>(
    <div className="bg-white text-slate-900 rounded-b-[28px] shadow-xl px-4 pt-4 pb-0 mb-5">
      <div className="flex items-center justify-between mb-3">
        <button onClick={()=>setJogoSelecionado(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><ArrowLeft className="w-5 h-5"/></button>
        <div className="text-center"><div className="text-[11px] font-black text-slate-500">{liga}</div><div className="text-[10px] font-bold text-slate-400">{jogo?.starting_at?new Date(jogo.starting_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'Hoje • 16:00'}</div></div>
        <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Star className="w-5 h-5 text-slate-400"/></button>
      </div>
      <div className="grid grid-cols-[1fr_90px_1fr] items-center gap-2 pb-4">
        <div className="text-center"><img src={escudo(jogo?.home_image,home)} className="w-14 h-14 mx-auto rounded-full object-contain mb-2" alt={home}/><div className="text-[11px] font-black line-clamp-2">{home}</div></div>
        <div className="text-center"><div className="text-3xl font-black tracking-tight">{scoreHome} - {scoreAway}</div><div className={`text-[10px] font-black mt-1 ${aoVivo?'text-red-500':finalizado?'text-slate-500':'text-blue-600'}`}>{aoVivo?`${minuto||'Ao vivo'}`:finalizado?'Finalizado':'Não iniciado'}</div>{aoVivo&&<div className="mt-2 inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full text-[9px] font-black uppercase"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>Live</div>}</div>
        <div className="text-center"><img src={escudo(jogo?.away_image,away)} className="w-14 h-14 mx-auto rounded-full object-contain mb-2" alt={away}/><div className="text-[11px] font-black line-clamp-2">{away}</div></div>
      </div>
      <div className="flex overflow-x-auto no-scrollbar border-t border-slate-100">
        {abas.map(a=><button key={a.id} onClick={()=>setAba(a.id)} className={`px-4 py-3 text-[11px] font-black whitespace-nowrap border-b-2 ${aba===a.id?'text-blue-600 border-blue-600':'text-blue-400/70 border-transparent'}`}>{a.label}</button>)}
      </div>
    </div>
  );

  const Detalhes=()=>(
    <div className="px-4 pb-28">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MiniCard icon={Zap} titulo="Confiança IA" valor={pct(confianca)} sub="Leitura premium" cor="text-yellow-400"/>
        <MiniCard icon={TrendingUp} titulo="Value EV+" valor={`${ev.toFixed(1)}%`} sub={ev>0?'Valor positivo':'Aguardar mercado'} cor={ev>0?'text-emerald-400':'text-red-400'}/>
        <MiniCard icon={Target} titulo="Odd principal" valor={odd.toFixed(2)} sub="Mercado 1X2" cor="text-blue-400"/>
        <MiniCard icon={Flame} titulo="Stake sugerida" valor={`R$ ${Math.round(dados.stake)}`} sub={`Kelly ${dados.kelly.toFixed(1)}%`} cor="text-purple-400"/>
      </div>
      <div className="bg-[#0f172a] border border-yellow-500/20 rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3"><Info className="w-5 h-5 text-yellow-400"/><h3 className="font-black text-white text-sm">Leitura do jogo</h3></div>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">A IA identifica vantagem para <b className="text-white">{home}</b> com base em pressão ofensiva, odd atual, momento da partida e força recente. Use como apoio de análise, não como garantia de lucro.</p>
        <button onClick={()=>gerarExplicacaoIA?.(jogo)} className="mt-4 w-full bg-blue-600 text-white rounded-2xl py-3 text-xs font-black uppercase active:scale-95">Explicar com IA</button>
      </div>
    </div>
  );

  const Formacoes=()=>(
    <div className="px-4 pb-28">
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-900 rounded-3xl p-4 border border-emerald-400/20 mb-4">
        <div className="flex justify-between text-white text-xs font-black mb-4"><span>{home}</span><span>4-3-3</span></div>
        <div className="grid grid-cols-3 gap-2 text-center">{jogadoresCasa.map((j,i)=><div key={i} className="bg-white/10 border border-white/10 rounded-xl p-2"><div className="w-7 h-7 bg-blue-500 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-black text-white">{i+1}</div><div className="text-[9px] font-bold text-white">{j}</div></div>)}</div>
      </div>
      <div className="bg-gradient-to-b from-slate-700 to-slate-900 rounded-3xl p-4 border border-white/10">
        <div className="flex justify-between text-white text-xs font-black mb-4"><span>{away}</span><span>4-2-3-1</span></div>
        <div className="grid grid-cols-3 gap-2 text-center">{jogadoresFora.map((j,i)=><div key={i} className="bg-white/10 border border-white/10 rounded-xl p-2"><div className="w-7 h-7 bg-red-500 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-black text-white">{i+1}</div><div className="text-[9px] font-bold text-white">{j}</div></div>)}</div>
      </div>
    </div>
  );

  const Estatisticas=()=>(
    <div className="px-4 pb-28">
      <StatBar nome="Posse de bola" casa={Math.round(dados.posseCasa)} fora={Math.round(dados.posseFora)}/>
      <StatBar nome="Ataques perigosos" casa={Math.round(dados.casaAtaque)} fora={Math.round(dados.foraAtaque)}/>
      <StatBar nome="Finalizações" casa={dados.chutesCasa} fora={dados.chutesFora}/>
      <StatBar nome="Escanteios" casa={dados.escanteiosCasa} fora={dados.escanteiosFora}/>
      <div className="grid grid-cols-3 gap-3">
        <MiniCard icon={Activity} titulo="Ritmo" valor={aoVivo?'Alto':'Médio'} cor="text-red-400"/>
        <MiniCard icon={Shield} titulo="Risco" valor={ev>10?'Baixo':'Médio'} cor="text-emerald-400"/>
        <MiniCard icon={Percent} titulo="IA" valor={pct(confianca)} cor="text-yellow-400"/>
      </div>
    </div>
  );

  const Comentario=()=>(
    <div className="px-4 pb-28">
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400"/>Comentário ao vivo</h3>
        <div className="space-y-4">{eventos.map((e,i)=><div key={i} className="flex gap-3"><div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">{e.min}</div><div className="flex-1 border-b border-white/5 pb-3"><p className="text-xs text-slate-300 font-semibold leading-relaxed">{e.txt}</p></div></div>)}</div>
      </div>
    </div>
  );

  const Partidas=()=>(
    <div className="px-4 pb-28">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4"><div className="text-xs font-black text-white mb-3">{home}</div><div className="flex gap-2">{ultimosCasa.map((r,i)=><span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${r==='W'?'bg-emerald-500 text-white':r==='D'?'bg-yellow-500 text-black':'bg-red-500 text-white'}`}>{r}</span>)}</div></div>
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4"><div className="text-xs font-black text-white mb-3">{away}</div><div className="flex gap-2">{ultimosFora.map((r,i)=><span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${r==='W'?'bg-emerald-500 text-white':r==='D'?'bg-yellow-500 text-black':'bg-red-500 text-white'}`}>{r}</span>)}</div></div>
      </div>
      {[1,2,3].map((_,i)=><div key={i} className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 mb-3 flex items-center justify-between"><div><div className="text-xs font-black text-white">{home} x {away}</div><div className="text-[10px] text-slate-500 font-bold mt-1">Confronto direto • {2025-i}</div></div><div className="text-lg font-black text-white">{i===0?'2 - 1':i===1?'1 - 1':'0 - 2'}</div></div>)}
    </div>
  );

  const Fase=()=>(
    <div className="px-4 pb-28">
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 mb-4">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400"/>Fase eliminatória</h3>
        <div className="space-y-3">
          <div className="bg-[#050816] border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between"><span className="text-xs font-black text-white">{home}</span><span className="text-blue-400 font-black">Atual</span><span className="text-xs font-black text-white">{away}</span></div>
          <div className="ml-6 border-l border-white/10 pl-4">
            <div className="bg-[#050816] border border-white/10 rounded-2xl p-4 mb-3"><div className="text-[10px] text-slate-500 font-black uppercase">Próxima fase provável</div><div className="text-sm text-white font-black mt-1">Semifinal / Rodada seguinte</div></div>
            <div className="bg-[#050816] border border-yellow-500/20 rounded-2xl p-4"><div className="text-[10px] text-yellow-400 font-black uppercase">Chance de avançar</div><div className="text-2xl text-white font-black mt-1">{pct(dados.probCasa)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );

  const Midia=()=>(
    <div className="px-4 pb-28">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-4 min-h-[130px] flex flex-col justify-between"><Camera className="w-8 h-8 text-blue-400"/><div><div className="text-sm font-black text-white">Fotos do jogo</div><div className="text-[10px] text-slate-500 font-bold">Galeria prévia</div></div></div>
        <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-4 min-h-[130px] flex flex-col justify-between"><PlayCircle className="w-8 h-8 text-red-400"/><div><div className="text-sm font-black text-white">Melhores momentos</div><div className="text-[10px] text-slate-500 font-bold">Vídeos e lances</div></div></div>
      </div>
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Image className="w-5 h-5 text-purple-400"/>Central de mídia</h3>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">Quando a API de mídia estiver conectada, esta área receberá fotos, vídeos, escalações oficiais, lances importantes e melhores momentos.</p>
      </div>
    </div>
  );

  const Probabilidades=()=>(
    <div className="px-4 pb-28">
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 mb-4">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400"/>Probabilidades 1X2</h3>
        <div className="space-y-3">
          {[{nome:home,p:dados.probCasa,cor:'bg-blue-500'},{nome:'Empate',p:dados.probEmpate,cor:'bg-yellow-500'},{nome:away,p:dados.probFora,cor:'bg-red-500'}].map(x=><div key={x.nome}><div className="flex justify-between text-xs font-black text-white mb-1"><span>{x.nome}</span><span>{pct(x.p)}</span></div><div className="h-3 bg-[#050816] rounded-full overflow-hidden"><div className={`${x.cor} h-full rounded-full`} style={{width:`${x.p}%`}}></div></div></div>)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MiniCard icon={Target} titulo="Casa" valor={(100/dados.probCasa).toFixed(2)} cor="text-blue-400"/>
        <MiniCard icon={Target} titulo="Empate" valor={(100/dados.probEmpate).toFixed(2)} cor="text-yellow-400"/>
        <MiniCard icon={Target} titulo="Fora" valor={(100/dados.probFora).toFixed(2)} cor="text-red-400"/>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5"><div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Melhor leitura IA</div><div className="text-lg font-black text-white">{home} com proteção / mercado principal</div><div className="text-xs text-slate-400 font-semibold mt-2">EV calculado: {ev.toFixed(1)}% • stake sugerida R$ {Math.round(dados.stake)}</div></div>
    </div>
  );

  const render=()=>({detalhes:<Detalhes/>,formacoes:<Formacoes/>,estatisticas:<Estatisticas/>,comentario:<Comentario/>,partidas:<Partidas/>,fase:<Fase/>,midia:<Midia/>,probabilidades:<Probabilidades/>}[aba]||<Detalhes/>);

  return (
    <div className="min-h-screen bg-[#050816] text-white animate-fade-in">
      <ResultadoTopo/>
      {render()}
    </div>
  );
}
