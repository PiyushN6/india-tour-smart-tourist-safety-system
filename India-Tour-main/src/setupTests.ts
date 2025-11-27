import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

// In tests we don't need full Helmet functionality; mock it as a simple wrapper
vi.mock('react-helmet-async', () => {
  const HelmetProvider = ({ children }: { children: ReactNode }) => children;
  const Helmet = ({ children }: { children: ReactNode }) => children;
  return { HelmetProvider, Helmet };
});
