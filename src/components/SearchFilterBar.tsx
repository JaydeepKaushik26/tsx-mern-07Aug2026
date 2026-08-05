import styled from 'styled-components';

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem 1rem;
  background: ${({ theme }) => theme.colors.bgRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
`;

const SearchInput = styled.input`
  flex: 1 1 220px;
  min-width: 180px;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.85rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDim};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.amber};
  }
`;

const Select = styled.select`
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 0.55rem 0.6rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.8rem;
  max-width: 160px;
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textDim};
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.amber};
  }
`;

const FavoritesToggle = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme, $active }) => ($active ? theme.colors.amber : 'transparent')};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.amber : theme.colors.border)};
  color: ${({ theme, $active }) => ($active ? '#14141c' : theme.colors.text)};
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &:hover {
    border-color: ${({ theme }) => theme.colors.amber};
  }
`;

interface Option {
  id: string;
  name: string;
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: { species: string; film: string; homeworld: string };
  onFilterChange: (key: 'species' | 'film' | 'homeworld', value: string) => void;
  speciesOptions: Option[];
  filmOptions: Option[];
  homeworldOptions: Option[];
  favoritesOnly?: boolean;
  onFavoritesOnlyChange?: (value: boolean) => void;
  showFavoritesToggle?: boolean;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  speciesOptions,
  filmOptions,
  homeworldOptions,
  favoritesOnly = false,
  onFavoritesOnlyChange,
  showFavoritesToggle = false,
}: SearchFilterBarProps) {
  const hasActiveFilters =
    search || filters.species || filters.film || filters.homeworld || favoritesOnly;

  return (
    <Bar role="search">
      <SearchInput
        type="search"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search characters by name"
      />

      <Select
        value={filters.species}
        onChange={(e) => onFilterChange('species', e.target.value)}
        aria-label="Filter by species"
      >
        <option value="">All species</option>
        {speciesOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </Select>

      <Select
        value={filters.film}
        onChange={(e) => onFilterChange('film', e.target.value)}
        aria-label="Filter by film"
      >
        <option value="">All films</option>
        {filmOptions.map((opt) => (
          <option key={opt.id} value={opt.name}>
            {opt.name}
          </option>
        ))}
      </Select>

      <Select
        value={filters.homeworld}
        onChange={(e) => onFilterChange('homeworld', e.target.value)}
        aria-label="Filter by homeworld"
      >
        <option value="">All homeworlds</option>
        {homeworldOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </Select>

      {showFavoritesToggle && (
        <FavoritesToggle
          type="button"
          $active={favoritesOnly}
          onClick={() => onFavoritesOnlyChange?.(!favoritesOnly)}
          aria-pressed={favoritesOnly}
        >
          {favoritesOnly ? '★' : '☆'} Favorites
        </FavoritesToggle>
      )}

      {hasActiveFilters && (
        <ClearButton
          onClick={() => {
            onSearchChange('');
            onFilterChange('species', '');
            onFilterChange('film', '');
            onFilterChange('homeworld', '');
            onFavoritesOnlyChange?.(false);
          }}
        >
          Clear
        </ClearButton>
      )}
    </Bar>
  );
}
