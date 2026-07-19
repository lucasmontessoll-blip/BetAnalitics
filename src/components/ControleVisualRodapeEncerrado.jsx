import { useEffect } from 'react';

function texto(el) {
  return String(el?.innerText || el?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function esconder(el) {
  if (!el) return;
  el.style.setProperty('display', 'none', 'important');
  el.style.setProperty('visibility', 'hidden', 'important');
  el.style.setProperty('opacity', '0', 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
}

function mostrar(el) {
  if (!el) return;
  if (el.dataset.betOcultoEncerrado === 'true') {
    el.style.removeProperty('display');
    el.style.removeProperty('visibility');
    el.style.removeProperty('opacity');
    el.style.removeProperty('pointer-events');
    delete el.dataset.betOcultoEncerrado;
  }
}

function ehFinalizado(t) {
  const s = String(t || '').toLowerCase();
  return (
    s.includes('finalizado') ||
    s.includes('encerrado') ||
    s.includes('finished') ||
    s.includes(' ft ') ||
    s.endsWith(' ft') ||
    s.includes('tempo encerrado')
  );
}

function pareceCardJogo(el) {
  const t = texto(el).toLowerCase();
  const r = el.getBoundingClientRect?.();

  if (!r) return false;

  const tamanhoCard =
    r.width >= 220 &&
    r.height >= 55 &&
    r.height <= 360;

  const temCaraDeJogo =
    t.includes('confiança') ||
    t.includes('confianca') ||
    t.includes('odd') ||
    t.includes('mercado') ||
    t.includes('finalizado') ||
    t.includes('agendado') ||
    t.includes('ao vivo') ||
    t.includes('live') ||
    t.includes('ft') ||
    t.includes('flamengo') ||
    t.includes('palmeiras') ||
    t.includes('real madrid') ||
    t.includes('manchester city') ||
    t.includes('liverpool') ||
    t.includes('arsenal');

  return tamanhoCard && temCaraDeJogo;
}

function acharCard(el) {
  let atual = el;

  for (let i = 0; i < 8 && atual; i += 1) {
    const r = atual.getBoundingClientRect?.();
    if (!r) break;

    if (pareceCardJogo(atual)) {
      return atual;
    }

    if (!atual.parentElement || atual.parentElement === document.body) break;
    atual = atual.parentElement;
  }

  return el;
}

export default function ControleVisualRodapeEncerrado() {
  useEffect(() => {
    window.__BET_ABA_ATIVA__ = window.__BET_ABA_ATIVA__ || 'Inicio';

    const aplicar = () => {
      try {
        const navs = Array.from(document.querySelectorAll('nav'));

        navs.forEach((nav) => {
          const botoes = Array.from(nav.querySelectorAll('button, a, div'));

          botoes.forEach((btn) => {
            const t = texto(btn).toUpperCase();

            if (t === 'PERFIL' || t.includes('PERFIL')) {
              const alvo = btn.closest('button') || btn;
              esconder(alvo);
            }
          });
        });

        const aba = window.__BET_ABA_ATIVA__;

        const candidatos = Array.from(
          document.querySelectorAll('div, article, button, section')
        );

        const cards = [];

        candidatos.forEach((el) => {
          const t = texto(el);
          if (!t) return;

          const temFinalizado = ehFinalizado(t);
          const temCaraDeJogo =
            t.toLowerCase().includes('confiança') ||
            t.toLowerCase().includes('confianca') ||
            t.toLowerCase().includes('odd') ||
            t.toLowerCase().includes('mercado') ||
            t.toLowerCase().includes('agendado') ||
            t.toLowerCase().includes('ao vivo') ||
            t.toLowerCase().includes('live') ||
            temFinalizado;

          if (!temCaraDeJogo) return;

          const card = acharCard(el);
          if (!card || cards.includes(card)) return;

          cards.push(card);
        });

        cards.forEach((card) => {
          const t = texto(card);
          const finalizado = ehFinalizado(t);

          mostrar(card);

          if (aba === 'Encerrado') {
            if (!finalizado) {
              card.dataset.betOcultoEncerrado = 'true';
              esconder(card);
            }
          } else {
            if (finalizado) {
              card.dataset.betOcultoEncerrado = 'true';
              esconder(card);
            }
          }
        });
      } catch {}
    };

    const clickHandler = (ev) => {
      const alvo = ev.target?.closest?.('button, a, div');
      const t = texto(alvo).toUpperCase();

      if (t.includes('ENCERRADO')) window.__BET_ABA_ATIVA__ = 'Encerrado';
      if (t.includes('INICIO') || t.includes('INÍCIO')) window.__BET_ABA_ATIVA__ = 'Inicio';
      if (t.includes('AO VIVO')) window.__BET_ABA_ATIVA__ = 'Ao Vivo';
      if (t === 'JOGOS' || t.includes('JOGOS')) window.__BET_ABA_ATIVA__ = 'Jogos';

      setTimeout(aplicar, 50);
      setTimeout(aplicar, 250);
      setTimeout(aplicar, 600);
    };

    aplicar();

    const observer = new MutationObserver(() => {
      aplicar();
      setTimeout(aplicar, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const timer = setInterval(aplicar, 500);

    window.addEventListener('click', clickHandler, true);
    window.addEventListener('touchstart', clickHandler, true);

    return () => {
      observer.disconnect();
      clearInterval(timer);
      window.removeEventListener('click', clickHandler, true);
      window.removeEventListener('touchstart', clickHandler, true);
    };
  }, []);

  return null;
}
