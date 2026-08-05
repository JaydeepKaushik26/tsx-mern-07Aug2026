import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 1.5rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radius};
  background: rgba(255, 107, 107, 0.06);
  max-width: 560px;
  margin: 2rem auto;
`;

const Glyph = styled.div`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.danger};
`;

const Title = styled.h3`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: #14141c;
  }
`;

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Wrap role="alert">
      <Glyph aria-hidden="true">⚠</Glyph>
      <Title>Transmission interrupted</Title>
      <Message>{message}</Message>
      <RetryButton onClick={onRetry}>Retry transmission</RetryButton>
    </Wrap>
  );
}
