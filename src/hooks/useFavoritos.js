import { useState, useEffect } from 'react';

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState([]);

  // Se já tivermos o Supabase a funcionar, mais tarde chamamos aqui a API
  const toggleFavorito = (id) => {
    setFavoritos(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  return { favoritos, toggleFavorito };
}