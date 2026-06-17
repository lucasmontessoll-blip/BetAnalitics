import { useState } from 'react';

export function useFavoritos(initial = [101, 102]) {
  const [favoritos, setFavoritos] = useState(initial);

  const toggleFavorito = (e, id) => {
    if (e) e.stopPropagation();
    setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  };

  return { favoritos, toggleFavorito };
}