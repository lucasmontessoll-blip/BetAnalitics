// ============================================================================
// ⚙️ CONFIGURAÇÕES GERAIS E TEMA
// ============================================================================
export const API_URL = 'https://betanalitics.onrender.com/api';
export const theme = { bgApp: '#090a0f', bgPanel: '#13161f', bgHover: '#1c202d', border: '#232838', cyan: '#00d4b6', yellow: '#facc15', textMain: '#f8fafc', textMuted: '#64748b', red: '#ef4444', green: '#10b981' };

// ============================================================================
// 🛠️ FUNÇÕES AUXILIARES OTIMIZADAS
// ============================================================================
export const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
export const getWeekDays = (b) => Array.from({length: 7}, (_, i) => { const d = new Date(b + "T12:00:00Z"); d.setDate(d.getDate() + i - 3); return { iso: d.toISOString().split('T')[0], nome: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()], dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}` }; });
export const generateMockMomentum = () => Array.from({length: 46}, (_, i) => ({ time: i * 2, pressao: Math.floor(Math.random() * 100) - 50 }));
export const getPrediction = (p, name) => (Array.isArray(p) ? p.find(i => i.type?.developer_name === name)?.predictions || null : null);

export const processarTrends = (dados, homeId, awayId) => {
  if (!Array.isArray(dados)) return null;
  const statsMap = {};
  dados.forEach(t => {
    const statName = t.type?.name; const teamId = t.participant_id; const value = t.data?.value ?? t.value; const minute = t.minute || 90;
    if (!statsMap[statName]) statsMap[statName] = { type: statName, home: 0, away: 0, _mH: -1, _mA: -1 };
    if (teamId === homeId && minute > statsMap[statName]._mH) { statsMap[statName].home = value; statsMap[statName]._mH = minute; } 
    else if (teamId === awayId && minute > statsMap[statName]._mA) { statsMap[statName].away = value; statsMap[statName]._mA = minute; }
  });
  return Object.values(statsMap).map(({ type, home, away }) => ({ type, home, away }));
};

// 🚀 FORMATADOR DE CLASSIFICAÇÃO (Processa o seu arquivo de 2800 linhas)
export const formatarClassificacaoAPI = (dadosBrutos) => {
    if (!Array.isArray(dadosBrutos)) return [];
    return dadosBrutos.map(item => {
        const getStat = (code) => item.details?.find(d => d.type?.code === code)?.value || 0;
        return {
            position: item.position,
            team_name: item.participant?.name || "Equipe",
            logo: item.participant?.image_path || "",
            points: item.points || 0,
            matches_played: getStat('overall-matches-played'),
            won: getStat('overall-won'),
            draw: getStat('overall-draw'),
            lost: getStat('overall-lost'),
            goal_diff: getStat('goal-difference')
        };
    }).sort((a, b) => a.position - b.position);
};

// ============================================================================
// 📋 ARSENAL DE ESPORTES (Aba "Esportes")
// ============================================================================
export const listaEsportesFino = [
    { name: 'Futebol', icon: '⚽' }, { name: 'Basquetebol', icon: '🏀' },
    { name: 'Tênis', icon: '🎾' }, { name: 'Futebol Am.', icon: '🏈' },
    { name: 'Beisebol', icon: '⚾' }, { name: 'Voleibol', icon: '🏐' },
    { name: 'Hóquei Gelo', icon: '🏒' }, { name: 'Rugby', icon: '🏉' },
    { name: 'E-Sports', icon: '🎮' }, { name: 'UFC / MMA', icon: '🥊' },
    { name: 'Fórmula 1', icon: '🏎️' }, { name: 'Golfe', icon: '⛳' },
    { name: 'Futsal', icon: '🥅' }, { name: 'Andebol', icon: '🤾' },
    { name: 'Tênis de Mesa', icon: '🏓' }, { name: 'Snooker', icon: '🎱' },
    { name: 'Dardos', icon: '🎯' }, { name: 'Críquete', icon: '🏏' },
    { name: 'Ciclismo', icon: '🚴' }, { name: 'Badminton', icon: '🏸' },
    { name: 'Polo Aquático', icon: '🤽' }, { name: 'MotoGP', icon: '🏍️' }
];

// ============================================================================
// 🌎 ARSENAL DE LIGAS
// ============================================================================
export const listaLigas = [
    { name: 'Todos', icon: '🌍' },
    { name: 'Brasileirão Série A', icon: '🇧🇷' }, { name: 'Brasileirão Série B', icon: '🇧🇷' }, 
    { name: 'Brasileirão Série C', icon: '🇧🇷' }, { name: 'Copa do Brasil', icon: '🏆' }, 
    { name: 'Libertadores', icon: '🌎' }, { name: 'Copa Sul-Americana', icon: '🌎' },
    { name: 'Champions League', icon: '⭐' }, { name: 'Europa League', icon: '🇪🇺' },
    { name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, { name: 'La Liga', icon: '🇪🇸' },
    { name: 'Serie A Italiana', icon: '🇮🇹' }, { name: 'Bundesliga', icon: '🇩🇪' },
    { name: 'MLS (EUA)', icon: '🇺🇸' }, { name: 'Saudi Pro League', icon: '🇸🇦' },
    { name: 'Eliminatórias Copa', icon: '🏆' }
];

// ============================================================================
// 🏆 MOCKS DE TABELAS DE CLASSIFICAÇÃO
// ============================================================================
export const MOCK_STANDINGS_LALIGA = [{position:1,team_name:"Real Madrid",logo:"https://cdn.sportmonks.com/images/soccer/teams/12/3468.png",points:78,matches_played:31,won:24,draw:6,lost:1,goal_diff:50},{position:2,team_name:"FC Barcelona",logo:"https://cdn.sportmonks.com/images/soccer/teams/19/83.png",points:70,matches_played:31,won:21,draw:7,lost:3,goal_diff:27},{position:3,team_name:"Girona",logo:"https://cdn.sportmonks.com/images/soccer/teams/11/11.png",points:65,matches_played:31,won:20,draw:5,lost:6,goal_diff:24},{position:4,team_name:"Atlético Madrid",logo:"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png",points:61,matches_played:31,won:19,draw:4,lost:8,goal_diff:23}];
export const MOCK_STANDINGS_PREMIER = [{position:1,team_name:"Arsenal",logo:"https://cdn.sportmonks.com/images/soccer/teams/14/14.png",points:74,matches_played:32,won:23,draw:5,lost:4,goal_diff:51},{position:2,team_name:"Manchester City",logo:"https://cdn.sportmonks.com/images/soccer/teams/9/9.png",points:73,matches_played:32,won:22,draw:7,lost:3,goal_diff:44},{position:3,team_name:"Liverpool",logo:"https://cdn.sportmonks.com/images/soccer/teams/8/8.png",points:71,matches_played:32,won:21,draw:8,lost:3,goal_diff:41}];
export const MOCK_STANDINGS_BRASILEIRAO = [{position:1,team_name:"Flamengo",logo:"https://cdn.sportmonks.com/images/soccer/teams/2/98.png",points:15,matches_played:6,won:5,draw:0,lost:1,goal_diff:8},{position:2,team_name:"Palmeiras",logo:"https://cdn.sportmonks.com/images/soccer/teams/3/99.png",points:14,matches_played:6,won:4,draw:2,lost:0,goal_diff:6},{position:3,team_name:"Botafogo",logo:"https://cdn.sportmonks.com/images/soccer/teams/4/100.png",points:13,matches_played:6,won:4,draw:1,lost:1,goal_diff:7}];

// ============================================================================
// 🎯 DADOS REAIS E MOCKS DE JOGOS
// ============================================================================
const RAW_API_RESPONSE = [
  {"id":19439572,"league":{"name":"La Liga"},"starting_at":"2026-04-22 17:00:00","state":{"developer_name":"FT"},"venue":{"name":"Estadio Manuel Martínez Valero"},"participants":[{"id":1099,"name":"Elche","image_path":"https://cdn.sportmonks.com/images/soccer/teams/11/1099.png","meta":{"location":"home"}},{"id":7980,"name":"Atlético Madrid","image_path":"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png","meta":{"location":"away"}}],"scores":[{"participant_id":1099,"score":{"goals":3},"description":"CURRENT"},{"participant_id":7980,"score":{"goals":2},"description":"CURRENT"}],"events":[{"id":156677864,"minute":18,"player_name":"David Affengruber","type":{"code":"goal"},"participant_id":1099},{"id":156678195,"minute":36,"player_name":"Nico González","type":{"code":"goal"},"participant_id":7980}]},
  {"id":19439261,"league":{"name":"La Liga"},"starting_at":"2025-08-23 17:30:00","state":{"developer_name":"FT"},"participants":[{"id":7980,"name":"Atlético Madrid","image_path":"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png","meta":{"location":"home"}},{"id":1099,"name":"Elche","image_path":"https://cdn.sportmonks.com/images/soccer/teams/11/1099.png","meta":{"location":"away"}}],"scores":[{"participant_id":7980,"score":{"goals":1},"description":"CURRENT"},{"participant_id":1099,"score":{"goals":1},"description":"CURRENT"}],"events":[{"id":150997631,"minute":8,"player_name":"Alexander Sørloth","type":{"code":"goal"},"participant_id":7980}]}
];

const JOGOS_MANUAIS = [
  {id:1,league_name:"La Liga",starting_at:"2026-04-20 16:00:00",status:"Live",home_team:"Real Madrid",home_id:101,away_team:"FC Barcelona",away_id:102,home_image:"https://cdn.sportmonks.com/images/soccer/teams/12/3468.png",away_image:"https://cdn.sportmonks.com/images/soccer/teams/19/83.png",scores:[{score:{goals:2}},{score:{goals:1}}],scoreHome:2,scoreAway:1,result_info:"65:30",venue:"Santiago Bernabéu",odds_format:{home:"1.85",draw:"3.50",away:"4.20"},predictions:[{type:{developer_name:'FULLTIME_RESULT_PROBABILITY'},predictions:{home:55.5,draw:20.5,away:24.0}}],sidelined:[],events:[],lineups:[],xgfixture:[]}
];

export const MOCK_GAMES = [...JOGOS_MANUAIS, ...RAW_API_RESPONSE.map(f => {
    const h = f.participants?.find(p => p.meta?.location === 'home') || f.participants?.[0];
    const a = f.participants?.find(p => p.meta?.location === 'away') || f.participants?.[1];
    return {
        id: f.id, league_name: f.league?.name, starting_at: f.starting_at, status: f.state?.developer_name === 'FT' ? 'Finished' : 'Live',
        home_team: h?.name, home_id: h?.id, away_team: a?.name, away_id: a?.id, home_image: h?.image_path, away_image: a?.image_path,
        scoreHome: f.scores?.find(s => s.participant_id === h?.id)?.score?.goals ?? 0, scoreAway: f.scores?.find(s => s.participant_id === a?.id)?.score?.goals ?? 0,
        result_info: f.result_info, predictions: [], odds_format: { home: "-", draw: "-", away: "-" }, venue: f.venue?.name || "Estádio",
        events: f.events || [], lineups: [], xgfixture: [], stats: processarTrends(f.trends || f.statistics, h?.id, a?.id)
    };
})];