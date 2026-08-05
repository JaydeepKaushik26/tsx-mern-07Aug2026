import styled from 'styled-components';

export const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.1rem;
  padding: 1.5rem;
`;

export const EmptyState = styled.div`
  padding: 4rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textDim};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.85rem;
`;
