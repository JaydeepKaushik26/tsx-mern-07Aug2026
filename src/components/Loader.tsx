import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 5rem 1rem;
  color: ${({ theme }) => theme.colors.textDim};
`;

const Ring = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.amber};
  animation: ${spin} 0.9s linear infinite;
`;

const Label = styled.p`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  animation: ${pulse} 1.6s ease-in-out infinite;
`;

interface LoaderProps {
  label?: string;
}

export function Loader({ label = 'Accessing Holonet archives…' }: LoaderProps) {
  return (
    <Wrap role="status" aria-live="polite">
      <Ring />
      <Label>{label}</Label>
    </Wrap>
  );
}
