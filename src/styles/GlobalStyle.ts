import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark;
  }

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.bg};
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 201, 77, 0.08), transparent),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px);
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.font.body};
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: ${({ theme }) => theme.font.display};
    margin: 0;
  }

  button, input, select {
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    color: ${({ theme }) => theme.colors.amber};
  }

  ::selection {
    background: ${({ theme }) => theme.colors.amber};
    color: #14141c;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.amber};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;
