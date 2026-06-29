const abrirCasa = (casa) => {
    if (!casa?.link || casa.link.includes('SEU-LINK-AFILIADO')) {
      alert(`Configure o link afiliado da ${casa.nome} antes de abrir.`);
      return;
    }

    // 🔥 MUDEI AQUI: window.open com '_blank' força abrir fora do seu App (no navegador padrão)
    window.open(casa.link, '_blank');
  };