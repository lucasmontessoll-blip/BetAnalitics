export const salvarCache = (chave, dados) => {
  localStorage.setItem(
    chave,
    JSON.stringify({
      timestamp: Date.now(),
      dados
    })
  );
};

export const lerCache = (chave, maxAge) => {
  const raw = localStorage.getItem(chave);
  if(!raw) return null;

  const cache = JSON.parse(raw);
  if(Date.now() - cache.timestamp > maxAge) return null;

  return cache.dados;
};