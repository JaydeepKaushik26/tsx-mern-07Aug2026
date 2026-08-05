import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Brand = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  letter-spacing: 0.02em;
`;

const Eyebrow = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.amber};

  &::before {
    content: '● ';
  }
`;

const AuthArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textDim};
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-family: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.colors.amber};
  }
`;

interface AppHeaderProps {
  onLoginClick: () => void;
}

export function AppHeader({ onLoginClick }: AppHeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Bar>
      <Brand>
        <div>
          <Title>Star Wars Character Archive</Title>
        </div>
      </Brand>
      <AuthArea>
        {isAuthenticated ? (
          <>
            <span>Signed in as {user}</span>
            <LogoutButton onClick={logout}>Log out</LogoutButton>
          </>
        ) : (
          <LogoutButton onClick={onLoginClick}>Log in</LogoutButton>
        )}
      </AuthArea>
    </Bar>
  );
}
