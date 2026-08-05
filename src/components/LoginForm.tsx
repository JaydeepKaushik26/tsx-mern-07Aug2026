import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDENTIALS = { username: 'lukeskywalker', password: 'force123' };

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 10, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 100;
`;

const Panel = styled.form`
  width: 100%;
  max-width: 360px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.amberDim};
  border-radius: ${({ theme }) => theme.radius};
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 0.15rem;
`;

const Hint = styled.p`
  margin: 0 0 0.5rem;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textDim};
  line-height: 1.5;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textDim};
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 0.55rem 0.7rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.amber};
  }
`;

const SubmitButton = styled.button`
  margin-top: 0.4rem;
  padding: 0.65rem 1rem;
  border-radius: 6px;
  border: none;
  background: ${({ theme }) => theme.colors.amber};
  color: #14141c;
  font-weight: 600;
  font-size: 0.9rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.78rem;
  text-decoration: underline;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.82rem;
`;

interface LoginFormProps {
  onSkip: () => void;
}

export function LoginForm({ onSkip }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch {
      // error state is surfaced via context
    }
  };

  return (
    <Overlay>
      <Panel onSubmit={handleSubmit}>
        <Title>Rebel Alliance Access</Title>
        <Hint>
          Demo credentials — username <strong>{DEMO_CREDENTIALS.username}</strong>, password{' '}
          <strong>{DEMO_CREDENTIALS.password}</strong>. Seeded via <code>npm run seed</code> in the{' '}
          <code>server/</code> project. Logging in issues a real JWT pair from the Express API,
          backed by MongoDB, with automatic silent refresh.
        </Hint>

        <Label>
          Username
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </Label>

        <Label>
          Password
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Label>

        {error && <ErrorText role="alert">{error}</ErrorText>}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Authenticating…' : 'Log in'}
        </SubmitButton>
        <SkipButton type="button" onClick={onSkip}>
          Continue browsing without logging in
        </SkipButton>
      </Panel>
    </Overlay>
  );
}
