import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

export default function RoteadorProfissional({
  viewMode,
  menuAtivo,
  filterCentro,
  jogoSelecionado,
  setViewMode,
  setMenuAtivo,
  setFilterCentro,
  setJogoSelecionado,
  setLigaAtivaId,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const estadoRef = useRef({});
  const aplicandoRotaRef = useRef(false);
  const ultimoDestinoRef = useRef('');

  function texto(valor) {
    return String(valor || '').toLowerCase().trim();
  }

  function idDoJogo(jogo) {
    return (
      jogo?.id ||
      jogo?.fixture?.id ||
      jogo?.id_jogo ||
      jogo?.home_team ||
      jogo?.time_casa ||
      'selecionado'
    );
  }

  function limparId(valor) {
    return encodeURIComponent(
      String(valor || 'selecionado')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'selecionado'
    );
  }

  function rotaDaTela(estado) {
    const v = texto(estado.viewMode);
    const m = texto(estado.menuAtivo);
    const f = texto(estado.filterCentro);

    if (estado.jogoSelecionado) {
      return '/jogo/' + limparId(idDoJogo(estado.jogoSelecionado));
    }

    if (m.includes('assinar') || m.includes('area vip') || m.includes('área vip')) {
      return '/pro';
    }

    if (v === 'aovivo' || f === 'ao vivo') return '/aovivo';
    if (v === 'encerrado' || f === 'encerrado') return '/encerrado';
    if (v === 'radarpro' || v === 'radar') return '/radar';
    if (v === 'perfil') return '/perfil';
    if (v === 'admin') return '/admin';
    if (v === 'banca' || v === 'banca-pro') return '/banca';
    if (v === 'config' || v === 'configuracoes' || v === 'configurações') return '/config';

    return '/';
  }

  function voltarParaTopo() {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
  }

  function aplicarRota(pathname) {
    const path = String(pathname || '/').toLowerCase();

    if (typeof setJogoSelecionado === 'function' && !path.startsWith('/jogo/')) {
      setJogoSelecionado(null);
    }

    if (typeof setLigaAtivaId === 'function') {
      setLigaAtivaId(null);
    }

    if (path === '/aovivo') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('aovivo');
      if (typeof setFilterCentro === 'function') setFilterCentro('Ao Vivo');
      voltarParaTopo();
      return;
    }

    if (path === '/encerrado') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('encerrado');
      if (typeof setFilterCentro === 'function') setFilterCentro('Encerrado');
      voltarParaTopo();
      return;
    }

    if (path === '/radar') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('radarpro');
      if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
      voltarParaTopo();
      return;
    }

    if (path === '/perfil') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('perfil');
      if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
      voltarParaTopo();
      return;
    }

    if (path === '/admin') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('admin');
      if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
      voltarParaTopo();
      return;
    }

    if (path === '/banca') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('banca-pro');
      if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
      voltarParaTopo();
      return;
    }

    if (path === '/pro') {
      if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
      if (typeof setMenuAtivo === 'function') setMenuAtivo('assinar pro');
      if (typeof setViewMode === 'function') setViewMode('jogos');
      if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
      voltarParaTopo();
      return;
    }

    if (path === '/config') {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
      if (typeof setViewMode === 'function') setViewMode('config');
      if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
      voltarParaTopo();
      return;
    }

    if (path.startsWith('/jogo/')) {
      voltarParaTopo();
      return;
    }

    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setViewMode === 'function') setViewMode('jogos');
    if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
    voltarParaTopo();
  }

  useEffect(() => {
    estadoRef.current = {
      viewMode,
      menuAtivo,
      filterCentro,
      jogoSelecionado,
      pathname: location.pathname || '/',
    };
  }, [viewMode, menuAtivo, filterCentro, jogoSelecionado, location.pathname]);

  useEffect(() => {
    const estado = {
      viewMode,
      menuAtivo,
      filterCentro,
      jogoSelecionado,
    };

    const destino = rotaDaTela(estado);
    const atual = location.pathname || '/';

    if (aplicandoRotaRef.current) return;
    if (destino === atual) return;
    if (ultimoDestinoRef.current === destino) return;

    ultimoDestinoRef.current = destino;
    navigate(destino);
  }, [viewMode, menuAtivo, filterCentro, jogoSelecionado, location.pathname, navigate]);

  useEffect(() => {
    const atual = location.pathname || '/';
    const esperado = rotaDaTela(estadoRef.current);

    if (atual === esperado) return;

    aplicandoRotaRef.current = true;
    aplicarRota(atual);

    const timer = setTimeout(() => {
      aplicandoRotaRef.current = false;
      ultimoDestinoRef.current = atual;
    }, 180);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    let handle = null;
    let ativo = true;

    async function registrarBotaoNativo() {
      try {
        const h = await CapacitorApp.addListener('backButton', () => {
          const path = estadoRef.current.pathname || '/';

          if (path !== '/') {
            navigate('/', { replace: false });
            return;
          }

          CapacitorApp.exitApp();
        });

        if (!ativo && h?.remove) {
          h.remove();
          return;
        }

        handle = h;
      } catch {}
    }

    registrarBotaoNativo();

    return () => {
      ativo = false;

      if (handle?.remove) {
        handle.remove();
      }
    };
  }, [navigate]);

  return null;
}
