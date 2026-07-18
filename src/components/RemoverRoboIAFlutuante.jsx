import { useEffect } from 'react';

export default function RemoverRoboIAFlutuante() {
  useEffect(() => {
    const esconderRoboFlutuante = () => {
      try {
        const largura = window.innerWidth || document.documentElement.clientWidth;
        const altura = window.innerHeight || document.documentElement.clientHeight;

        const todos = Array.from(
          document.querySelectorAll('button, a, [role="button"], div, span')
        );

        todos.forEach((el) => {
          const texto = (el.innerText || el.textContent || '').trim().toUpperCase();
          const html = el.innerHTML || '';
          const aria = (el.getAttribute?.('aria-label') || '').toUpperCase();

          const temRobo =
            texto.includes('🤖') ||
            html.includes('🤖') ||
            html.includes('1F916') ||
            aria.includes('IA');

          if (!temRobo) return;

          let alvo = el.closest('button, a, [role="button"]') || el;

          // Sobe alguns níveis para pegar o círculo azul inteiro
          for (let i = 0; i < 6; i++) {
            const parent = alvo.parentElement;
            if (!parent || parent === document.body) break;

            const parentRect = parent.getBoundingClientRect?.();
            const alvoRect = alvo.getBoundingClientRect?.();

            if (!parentRect || !alvoRect) break;

            const parentStyle = window.getComputedStyle(parent);

            const parentPequeno =
              parentRect.width <= 150 &&
              parentRect.height <= 150;

            const parentFlutuante =
              parentStyle.position === 'fixed' ||
              parentStyle.position === 'absolute';

            if (parentPequeno || parentFlutuante) {
              alvo = parent;
            } else {
              break;
            }
          }

          const rect = alvo.getBoundingClientRect?.();
          if (!rect) return;

          const style = window.getComputedStyle(alvo);

          const estaNaDireita =
            rect.left > largura * 0.55 ||
            rect.right > largura - 180;

          const estaNaParteDeBaixo =
            rect.top > altura * 0.42;

          const acimaDoMenuInferior =
            rect.bottom < altura - 105;

          const tamanhoDeRoboFlutuante =
            rect.width <= 150 &&
            rect.height <= 150;

          const pareceFlutuante =
            style.position === 'fixed' ||
            style.position === 'absolute' ||
            tamanhoDeRoboFlutuante;

          const textoAlvo = (alvo.innerText || alvo.textContent || '').trim().toUpperCase();

          const naoEhMenuInferior =
            !textoAlvo.includes('INÍCIO') &&
            !textoAlvo.includes('INICIO') &&
            !textoAlvo.includes('AO VIVO') &&
            !textoAlvo.includes('COPA') &&
            !textoAlvo.includes('PERFIL') &&
            !textoAlvo.includes('RADAR IA') &&
            !textoAlvo.includes('ADMIN');

          if (
            estaNaDireita &&
            estaNaParteDeBaixo &&
            acimaDoMenuInferior &&
            tamanhoDeRoboFlutuante &&
            pareceFlutuante &&
            naoEhMenuInferior
          ) {
            alvo.style.display = 'none';
            alvo.style.visibility = 'hidden';
            alvo.style.pointerEvents = 'none';
            alvo.setAttribute('data-bet-removido', 'robo-ia-flutuante-final');
          }
        });
      } catch {}
    };

    esconderRoboFlutuante();

    const observer = new MutationObserver(() => {
      esconderRoboFlutuante();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const timer = setInterval(esconderRoboFlutuante, 300);

    window.addEventListener('resize', esconderRoboFlutuante);
    window.addEventListener('scroll', esconderRoboFlutuante, true);

    return () => {
      observer.disconnect();
      clearInterval(timer);
      window.removeEventListener('resize', esconderRoboFlutuante);
      window.removeEventListener('scroll', esconderRoboFlutuante, true);
    };
  }, []);

  return null;
}
