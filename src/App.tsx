import { useState } from 'react';
import styled from 'styled-components';
import { AppHeader } from './components/AppHeader';
import { SearchFilterBar } from './components/SearchFilterBar';
import { CharacterCard } from './components/CharacterCard';
import { CharacterGrid, EmptyState } from './components/CharacterGrid';
import { CharacterModal } from './components/CharacterModal';
import { Pagination } from './components/Pagination';
import { Loader } from './components/Loader';
import { ErrorState } from './components/ErrorState';
import { LoginForm } from './components/LoginForm';
import { useSwapiData } from './hooks/useSwapiData';
import type { EnrichedPerson } from './hooks/useSwapiData';
import { useFavorites } from './hooks/useFavorites';
import { useAuth } from './context/AuthContext';
import { extractId } from './types/swapi';

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.5rem 3rem;
`;

const ToolbarWrap = styled.div`
  padding: 1.5rem 1rem 0;
`;

const ResultsMeta = styled.p`
  padding: 1rem 1.5rem 0;
  margin: 0;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textDim};
`;

function App() {
  const { isAuthenticated } = useAuth();
  const { favoriteUrls, toggleFavorite } = useFavorites();

  const {
    isLoading,
    error,
    refetch,
    filteredPeople,
    pagedPeople,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    favoritesOnly,
    setFavoritesOnly,
    speciesOptions,
    filmOptions,
    homeworldOptions,
    planetsById,
  } = useSwapiData(favoriteUrls);

  const [selectedPerson, setSelectedPerson] = useState<EnrichedPerson | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <AppHeader onLoginClick={() => setShowLogin(true)} />

      <Main>
        <ToolbarWrap>
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFilterChange={setFilter}
            speciesOptions={speciesOptions}
            filmOptions={filmOptions}
            homeworldOptions={homeworldOptions}
            favoritesOnly={favoritesOnly}
            onFavoritesOnlyChange={setFavoritesOnly}
            showFavoritesToggle={isAuthenticated}
          />
        </ToolbarWrap>

        {isLoading && <Loader />}

        {!isLoading && error && <ErrorState message={error} onRetry={refetch} />}

        {!isLoading && !error && (
          <>
            <ResultsMeta>
              {filteredPeople.length} character{filteredPeople.length === 1 ? '' : 's'} found
            </ResultsMeta>

            {pagedPeople.length === 0 ? (
              <EmptyState>
                {favoritesOnly
                  ? "You haven't favorited any characters yet."
                  : 'No characters match your search and filters.'}
              </EmptyState>
            ) : (
              <CharacterGrid>
                {pagedPeople.map((person) => (
                  <CharacterCard
                    key={person.url}
                    person={person}
                    onSelect={setSelectedPerson}
                    isFavorite={favoriteUrls.has(person.url)}
                    onToggleFavorite={(p) => toggleFavorite(p.url, p.name)}
                    showFavoriteToggle={isAuthenticated}
                  />
                ))}
              </CharacterGrid>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Main>

      {selectedPerson && (
        <CharacterModal
          person={selectedPerson}
          planet={planetsById.get(extractId(selectedPerson.homeworld))}
          filmCount={selectedPerson.films.length}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {showLogin && !isAuthenticated && <LoginForm onSkip={() => setShowLogin(false)} />}
    </>
  );
}

export default App;
