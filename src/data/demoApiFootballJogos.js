function logoSvg(nome, cor1 = '#06b6d4', cor2 = '#0f172a') {
  const iniciais = String(nome || 'FC').split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${cor1}"/><stop offset="100%" stop-color="${cor2}"/></linearGradient></defs><path d="M60 7 L101 22 V54 C101 82 82 104 60 114 C38 104 19 82 19 54 V22 Z" fill="url(#g)" stroke="white" stroke-width="5"/><circle cx="60" cy="58" r="28" fill="rgba(0,0,0,.28)"/><text x="60" y="68" text-anchor="middle" font-family="Arial" font-size="28" font-weight="900" fill="#fff">${iniciais}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const T = {
  fla: { id: 1001, name: 'Flamengo', logo: logoSvg('Flamengo', '#ef4444', '#111827') },
  pal: { id: 1002, name: 'Palmeiras', logo: logoSvg('Palmeiras', '#22c55e', '#052e16') },
  cor: { id: 1003, name: 'Corinthians', logo: logoSvg('Corinthians', '#f8fafc', '#111827') },
  sao: { id: 1004, name: 'Sao Paulo', logo: logoSvg('Sao Paulo', '#dc2626', '#111827') },
};

function statistics(home, away, p = 1) {
  const a = p === 1
    ? { sog:[6,3], off:[5,4], total:[15,10], block:[4,3], inside:[9,5], outside:[6,5], fouls:[11,14], corners:[7,4], offsides:[1,2], poss:['58%','42%'], yc:[1,2], rc:[0,0], saves:[2,5], passes:[498,381], acc:[431,309], pct:['87%','81%'] }
    : { sog:[4,5], off:[7,6], total:[13,14], block:[2,3], inside:[7,8], outside:[6,6], fouls:[15,12], corners:[5,6], offsides:[2,1], poss:['49%','51%'], yc:[2,3], rc:[0,0], saves:[4,3], passes:[422,447], acc:[351,372], pct:['83%','84%'] };
  const rows = [['Shots on Goal',a.sog],['Shots off Goal',a.off],['Total Shots',a.total],['Blocked Shots',a.block],['Shots insidebox',a.inside],['Shots outsidebox',a.outside],['Fouls',a.fouls],['Corner Kicks',a.corners],['Offsides',a.offsides],['Ball Possession',a.poss],['Yellow Cards',a.yc],['Red Cards',a.rc],['Goalkeeper Saves',a.saves],['Total passes',a.passes],['Passes accurate',a.acc],['Passes %',a.pct]];
  return [
    { team: home, statistics: rows.map(([type, v]) => ({ type, value: v[0] })) },
    { team: away, statistics: rows.map(([type, v]) => ({ type, value: v[1] })) },
  ];
}

function events(home, away, p = 1) {
  return p === 1 ? [
    { time:{elapsed:12}, team:home, player:{id:1,name:'Pedro'}, assist:{name:'Arrascaeta'}, type:'Goal', detail:'Normal Goal' },
    { time:{elapsed:31}, team:away, player:{id:2,name:'Raphael Veiga'}, assist:{name:'Mayke'}, type:'Goal', detail:'Normal Goal' },
    { time:{elapsed:44}, team:home, player:{id:3,name:'Gerson'}, type:'Card', detail:'Yellow Card' },
    { time:{elapsed:58}, team:home, player:{id:4,name:'Bruno Henrique'}, assist:{name:'Luiz Araujo'}, type:'Goal', detail:'Normal Goal' },
  ] : [
    { time:{elapsed:22}, team:home, player:{id:5,name:'Yuri Alberto'}, assist:{name:'Garro'}, type:'Goal', detail:'Normal Goal' },
    { time:{elapsed:39}, team:away, player:{id:6,name:'Luciano'}, assist:{name:'Lucas Moura'}, type:'Goal', detail:'Normal Goal' },
    { time:{elapsed:76}, team:away, player:{id:7,name:'Arboleda'}, type:'Card', detail:'Yellow Card' },
  ];
}

function lineup(team, side) {
  const names = side === 'home'
    ? ['Rossi','Varela','Leo Ortiz','Leo Pereira','Ayrton Lucas','Pulgar','Gerson','Arrascaeta','Luiz Araujo','Bruno Henrique','Pedro']
    : ['Weverton','Mayke','Gomez','Murilo','Piquerez','Anibal Moreno','Ze Rafael','Raphael Veiga','Estevao','Rony','Flaco Lopez'];
  const grids = ['1:1','2:1','2:2','2:4','2:5','3:2','3:4','4:3','4:1','4:5','5:3'];
  return { team, formation:'4-2-3-1', coach:{ name: side === 'home' ? 'Tecnico Mandante' : 'Tecnico Visitante' }, startXI:names.map((name,i)=>({ player:{ id:team.id*10+i, name, number:i+1, pos:i===0?'G':i<5?'D':i<8?'M':'F', grid:grids[i] }})), substitutes:[] };
}

function players(team, side) {
  const names = side === 'home' ? ['Pedro','Arrascaeta','Gerson','Bruno Henrique','Luiz Araujo'] : ['Raphael Veiga','Rony','Gomez','Estevao','Piquerez'];
  return { team, players:names.map((name,i)=>({
    player:{ id:team.id*100+i, name, photo:logoSvg(name, side==='home'?'#38bdf8':'#facc15', '#111827'), age:25+i, nationality:'Brazil', height:'180 cm', weight:'75 kg' },
    statistics:[{ games:{ minutes:90-i*7, number:i+7, position:i<2?'Attacker':'Midfielder', rating:(7.8-i*.2).toFixed(1), appearences:1 }, shots:{ total:4-Math.min(i,2), on:2-Math.min(i,1) }, goals:{ total:i===0?1:0, assists:i===1?1:0 }, passes:{ total:42+i*7, key:2, accuracy:84-i }, duels:{ total:8+i, won:4+i }, dribbles:{ attempts:3+i, success:2 }, cards:{ yellow:i===2?1:0, red:0 } }]
  }))};
}

function prediction(home, away, hp, dp, ap) {
  return { predictions:{ winner:{ name: hp >= ap ? home : away, comment:'Win or draw' }, advice:`${home} ou empate e mais de 1.5 gols como leitura demo.`, percent:{ home:`${hp}%`, draw:`${dp}%`, away:`${ap}%` } }, comparison:{ form:{home:'62%',away:'38%'}, att:{home:'58%',away:'42%'}, def:{home:'55%',away:'45%'}, h2h:{home:'60%',away:'40%'}, goals:{home:'57%',away:'43%'}, total:{home:`${hp}%`,away:`${ap}%`} } };
}

function oddsPre(h, a, ho, d, ao) { return [{ bookmakers:[{ name:'BetAnalytics Demo', bets:[{ name:'Match Winner', values:[{value:'Home',odd:String(ho)},{value:'Draw',odd:String(d)},{value:'Away',odd:String(ao)}] },{ name:'Goals Over/Under', values:[{value:'Over 2.5',odd:'1.90'},{value:'Under 2.5',odd:'1.88'}] }] }] }]; }
function oddsLive(h,a) { return [{ bookmaker:'Live Demo', odds:[{ name:'Resultado ao vivo', values:[{value:h,odd:'1.62'},{value:'Empate',odd:'3.90'},{value:a,odd:'5.40'}] },{ name:'Proximo gol', values:[{value:h,odd:'1.95'},{value:'Sem gol',odd:'4.60'},{value:a,odd:'2.75'}] }] }]; }
function h2h(home, away) { return [
  { fixture:{id:8001,status:{short:'FT',long:'Match Finished'}}, league:{name:'Brasileirao Serie A',season:2025}, teams:{home,away}, goals:{home:2,away:1} },
  { fixture:{id:8002,status:{short:'FT',long:'Match Finished'}}, league:{name:'Copa do Brasil',season:2024}, teams:{home:away,away:home}, goals:{home:1,away:1} },
]; }
function injuries(team) { return [{ player:{id:team.id*99,name:'Jogador em recuperacao'}, team, league:{name:'Brasileirao Serie A'}, type:'Questionavel', reason:'Desconforto muscular' }]; }

function detail({ fixtureId, home, away, scoreHome, scoreAway, live, elapsed, p }) {
  return { ok:true, fonte:'api-football-demo', fixture:{ fixture:{ id:fixtureId, date:'2026-07-13T22:00:00-03:00', referee:'Arbitro Demo', venue:{name:'Estadio BetAnalytics',city:'Sao Paulo'}, status:{short:live?'2H':'FT',long:live?'Second Half':'Match Finished',elapsed} }, league:{id:71,name:'Brasileirao Serie A',country:'Brazil',season:2026,round:'Rodada Demo'}, teams:{home,away}, goals:{home:scoreHome,away:scoreAway} }, statistics:statistics(home,away,p), events:events(home,away,p), lineups:[lineup(home,'home'),lineup(away,'away')], players:[players(home,'home'),players(away,'away')], injuries:injuries(away), predictions:prediction(home.name, away.name, p===1?52:35, p===1?26:34, p===1?22:31), odds:oddsPre(home.name,away.name,p===1?1.78:2.70,p===1?3.55:3.10,p===1?4.90:2.85), oddsLive: live ? oddsLive(home.name,away.name) : [], h2h:h2h(home,away) };
}

function game({ id, home, away, scoreHome, scoreAway, live, elapsed, conf, odds, p }) {
  return { id:`api-football-demo-${id}`, api_football_id:id, demo_api_football:true, fonte_dados:'api-football-demo', league_id:71, league_name:'Brasileirao Serie A', league_country:'Brazil', season:2026, round:'Rodada Demo', starting_at:'2026-07-13T22:00:00-03:00', status:live?'Live':'Finished', status_short:live?'2H':'FT', status_long:live?'Second Half':'Match Finished', time_elapsed:live?`${elapsed}'`:'', venue:'Estadio BetAnalytics', city:'Sao Paulo', referee:'Arbitro Demo', home_team:home.name, away_team:away.name, home_id:home.id, away_id:away.id, home_image:home.logo, away_image:away.logo, scoreHome, scoreAway, placar_casa:scoreHome, placar_fora:scoreAway, confianca_ia:conf, odd_principal:odds[0], odd_casa:odds[0], odd_empate:odds[1], odd_fora:odds[2], bookmaker:'BetAnalytics Demo', odds:{home:odds[0],draw:odds[1],away:odds[2]}, demoDetalhe:detail({ fixtureId:id, home, away, scoreHome, scoreAway, live, elapsed, p }) };
}

export const JOGOS_DEMO_API_FOOTBALL = [
  game({ id:900001, home:T.fla, away:T.pal, scoreHome:2, scoreAway:1, live:true, elapsed:62, conf:92, odds:[1.78,3.55,4.90], p:1 }),
  game({ id:900002, home:T.cor, away:T.sao, scoreHome:1, scoreAway:1, live:false, elapsed:90, conf:84, odds:[2.70,3.10,2.85], p:2 }),
];
