import styled from 'styled-components';
import type { EnrichedPerson } from '../hooks/useSwapiData';
import { colorForSpecies } from '../utils/speciesColor';
import { pictureUrlFor } from '../utils/format';
import { extractId } from '../types/swapi';

const Card = styled.button<{ $bg: string; $accent: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: ${({ theme }) => theme.radius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $bg }) => $bg};
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, border-color 0.22s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid ${({ $accent }) => $accent};
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  &::before {
    top: 8px;
    left: 8px;
    border-right: none;
    border-bottom: none;
  }
  &::after {
    bottom: 8px;
    right: 8px;
    border-left: none;
    border-top: none;
  }

  &:hover,
  &:focus-visible {
    transform: translateY(-6px) scale(1.015);
    border-color: ${({ $accent }) => $accent};
    box-shadow: 0 14px 30px -12px ${({ $accent }) => $accent}66;
  }

  &:hover::before,
  &:hover::after,
  &:focus-visible::before,
  &:focus-visible::after {
    opacity: 1;
  }
`;

const ImageWrap = styled.div<{ $accent: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #0004;

  /* Duotone "holo-scan" wash tied to species color, so a random stock
     photo reads as a stylized in-universe scan rather than a literal,
     mismatched photograph. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, ${({ $accent }) => $accent}cc 0%, transparent 55%),
      linear-gradient(340deg, #05060acc 0%, transparent 60%);
    mix-blend-mode: color;
    pointer-events: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.05) 0px,
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 3px
    );
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 1;
  }
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.55) contrast(1.15) brightness(0.9);
  transition: transform 0.4s ease, filter 0.3s ease;

  ${Card}:hover &, ${Card}:focus-visible & {
    transform: scale(1.08);
    filter: grayscale(0.3) contrast(1.15) brightness(1);
  }
`;

const Body = styled.div`
  padding: 0.9rem 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const IdentChip = styled.span<{ $accent: string }>`
  position: absolute;
  bottom: 0.6rem;
  left: 0.6rem;
  z-index: 2;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: ${({ $accent }) => $accent};
  background: rgba(5, 6, 10, 0.55);
  border: 1px solid ${({ $accent }) => $accent}66;
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  text-transform: uppercase;
`;

const FavoriteButton = styled.span<{ $active: boolean; $accent: string }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(5, 6, 10, 0.55);
  border: 1px solid ${({ $active, $accent }) => ($active ? $accent : 'rgba(255,255,255,0.25)')};
  color: ${({ $active, $accent }) => ($active ? $accent : '#fff')};
  font-size: 0.95rem;
  transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    transform: scale(1.12);
  }
`;

const Name = styled.h3`
  font-size: 1rem;
  line-height: 1.25;
`;

const SpeciesTag = styled.span<{ $accent: string }>`
  align-self: flex-start;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $accent }) => $accent};
  border: 1px solid ${({ $accent }) => $accent}55;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
`;

interface CharacterCardProps {
  person: EnrichedPerson;
  onSelect: (person: EnrichedPerson) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (person: EnrichedPerson) => void;
  showFavoriteToggle?: boolean;
}

export function CharacterCard({
  person,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteToggle = false,
}: CharacterCardProps) {
  const { bg, accent } = colorForSpecies(person.speciesName);
  const imageUrl = pictureUrlFor(extractId(person.url) || person.name);

  return (
    <Card
      $bg={bg}
      $accent={accent}
      onClick={() => onSelect(person)}
      aria-haspopup="dialog"
      aria-label={`View details for ${person.name}`}
    >
      <ImageWrap $accent={accent}>
        <Img src={imageUrl} alt="" loading="lazy" />
        <IdentChip $accent={accent}>ID·{extractId(person.url).padStart(2, '0')}</IdentChip>
        {showFavoriteToggle && (
          <FavoriteButton
            $active={isFavorite}
            $accent={accent}
            role="button"
            tabIndex={0}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${person.name} from favorites` : `Add ${person.name} to favorites`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(person);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.(person);
              }
            }}
          >
            {isFavorite ? '★' : '☆'}
          </FavoriteButton>
        )}
      </ImageWrap>
      <Body>
        <Name>{person.name}</Name>
        <SpeciesTag $accent={accent}>{person.speciesName}</SpeciesTag>
      </Body>
    </Card>
  );
}
