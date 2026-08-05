import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import type { EnrichedPerson } from '../hooks/useSwapiData';
import type { Planet } from '../types/swapi';
import { formatDateDDMMYYYY, heightInMeters, massInKg, pictureUrlFor } from '../utils/format';
import { colorForSpecies } from '../utils/speciesColor';
import { extractId } from '../types/swapi';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const flickerIn = keyframes`
  0% { opacity: 0; transform: translateY(10px) scale(0.98); filter: brightness(2); }
  40% { opacity: 1; filter: brightness(1.4); }
  60% { opacity: 0.85; filter: brightness(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 10, 0.78);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 100;
  animation: ${fadeIn} 0.15s ease;
`;

const Panel = styled.div<{ $accent: string }>`
  width: 100%;
  max-width: 640px;
  max-height: 88vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ $accent }) => $accent}88;
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: 0 30px 80px -20px ${({ $accent }) => $accent}55;
  animation: ${flickerIn} 0.35s ease;
`;

const Header = styled.div<{ $bg: string }>`
  position: relative;
  display: flex;
  gap: 1.1rem;
  align-items: flex-end;
  padding: 1.25rem;
  background: ${({ $bg }) => $bg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const PortraitWrap = styled.div<{ $accent: string }>`
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, ${({ $accent }) => $accent}cc 0%, transparent 55%),
      linear-gradient(340deg, #05060acc 0%, transparent 60%);
    mix-blend-mode: color;
    pointer-events: none;
  }
`;

const Portrait = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.5) contrast(1.15) brightness(0.95);
`;

const Title = styled.h2`
  font-size: 1.5rem;
`;

const Sub = styled.div`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textDim};
  margin-top: 0.25rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
`;

const Section = styled.section`
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionLabel = styled.h4`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.amberDim};
  margin-bottom: 0.7rem;
`;

const Grid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.85rem 1rem;
  margin: 0;
`;

const Field = styled.div`
  dt {
    font-family: ${({ theme }) => theme.font.mono};
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textDim};
    margin-bottom: 0.2rem;
  }
  dd {
    margin: 0;
    font-size: 0.95rem;
  }
`;

interface CharacterModalProps {
  person: EnrichedPerson;
  planet: Planet | undefined;
  filmCount: number;
  onClose: () => void;
}

export function CharacterModal({ person, planet, filmCount, onClose }: CharacterModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { bg, accent } = colorForSpecies(person.speciesName);
  const imageUrl = pictureUrlFor(extractId(person.url) || person.name);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <Overlay
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Panel
        $accent={accent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-modal-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <Header $bg={bg}>
          <CloseButton onClick={onClose} aria-label="Close">
            ✕
          </CloseButton>
          <PortraitWrap $accent={accent}>
            <Portrait src={imageUrl} alt="" />
          </PortraitWrap>
          <div>
            <Title id="character-modal-title">{person.name}</Title>
            <Sub>{person.speciesName} · {person.gender}</Sub>
          </div>
        </Header>

        <Section>
          <SectionLabel>Character data</SectionLabel>
          <Grid>
            <Field>
              <dt>Height</dt>
              <dd>{heightInMeters(person.height)}</dd>
            </Field>
            <Field>
              <dt>Mass</dt>
              <dd>{massInKg(person.mass)}</dd>
            </Field>
            <Field>
              <dt>Birth year</dt>
              <dd>{person.birth_year}</dd>
            </Field>
            <Field>
              <dt>Films</dt>
              <dd>{filmCount}</dd>
            </Field>
            <Field>
              <dt>Added to archive</dt>
              <dd>{formatDateDDMMYYYY(person.created)}</dd>
            </Field>
          </Grid>
        </Section>

        <Section>
          <SectionLabel>Homeworld</SectionLabel>
          {planet ? (
            <Grid>
              <Field>
                <dt>Name</dt>
                <dd>{planet.name}</dd>
              </Field>
              <Field>
                <dt>Climate</dt>
                <dd>{planet.climate}</dd>
              </Field>
              <Field>
                <dt>Terrain</dt>
                <dd>{planet.terrain}</dd>
              </Field>
              <Field>
                <dt>Residents</dt>
                <dd>{planet.residents.length}</dd>
              </Field>
            </Grid>
          ) : (
            <p>Homeworld data unavailable.</p>
          )}
        </Section>
      </Panel>
    </Overlay>
  );
}
