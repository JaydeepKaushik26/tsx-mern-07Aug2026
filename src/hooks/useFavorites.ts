import { useCallback, useEffect, useState } from 'react';
import { addFavorite, listFavorites, removeFavorite } from '../api/favoritesApi';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const { accessToken, isAuthenticated } = useAuth();
  const [favoriteUrls, setFavoriteUrls] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setFavoriteUrls(new Set());
      return;
    }
    setIsLoading(true);
    listFavorites(accessToken)
      .then((records) => setFavoriteUrls(new Set(records.map((r) => r.characterUrl))))
      .catch(() => setFavoriteUrls(new Set()))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, accessToken]);

  const toggleFavorite = useCallback(
    async (characterUrl: string, characterName: string) => {
      if (!accessToken) return;
      const isFavorite = favoriteUrls.has(characterUrl);

      // Optimistic update, rolled back on failure.
      setFavoriteUrls((prev) => {
        const next = new Set(prev);
        if (isFavorite) next.delete(characterUrl);
        else next.add(characterUrl);
        return next;
      });

      try {
        if (isFavorite) await removeFavorite(accessToken, characterUrl);
        else await addFavorite(accessToken, characterUrl, characterName);
      } catch {
        setFavoriteUrls((prev) => {
          const next = new Set(prev);
          if (isFavorite) next.add(characterUrl);
          else next.delete(characterUrl);
          return next;
        });
      }
    },
    [accessToken, favoriteUrls]
  );

  return { favoriteUrls, toggleFavorite, isLoading };
}
