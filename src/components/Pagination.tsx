import styled from 'styled-components';

const Wrap = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem 0 2.5rem;
  font-family: ${({ theme }) => theme.font.mono};
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 34px;
  height: 34px;
  padding: 0 0.4rem;
  border-radius: 6px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.amber : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.amber : 'transparent')};
  color: ${({ theme, $active }) => ($active ? '#14141c' : theme.colors.text)};
  font-size: 0.8rem;
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.amber};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Status = styled.span`
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.75rem;
  margin: 0 0.5rem;
`;

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <Wrap aria-label="Pagination">
      <PageButton onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        ‹
      </PageButton>

      {pages.map((p, idx) =>
        p === '…' ? (
          <Status key={`ellipsis-${idx}`}>…</Status>
        ) : (
          <PageButton
            key={p}
            $active={p === page}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
        ›
      </PageButton>

      <Status>
        Page {page} / {totalPages}
      </Status>
    </Wrap>
  );
}

function buildPageList(current: number, total: number): (number | '…')[] {
  const delta = 1;
  const range: (number | '…')[] = [];
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  range.push(1);
  if (start > 2) range.push('…');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < total - 1) range.push('…');
  if (total > 1) range.push(total);

  return range;
}
