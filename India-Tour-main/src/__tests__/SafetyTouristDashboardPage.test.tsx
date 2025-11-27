import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';

import SafetyTouristDashboardPage from '../features/safety/SafetyTouristDashboardPage';

// Mock AuthContext to control auth state
vi.mock('../context/AuthContext', () => {
  return {
    useAuth: () => ({
      session: null as Session | null,
      isAuthenticated: false,
    }),
  };
});

// Mock i18n so t(key) just echoes the key
vi.mock('../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock safety API calls so the component can mount without network
vi.mock('../services/safetyApi', () => ({
  fetchMyAlerts: vi.fn().mockResolvedValue([]),
  fetchMySafetyScore: vi.fn().mockResolvedValue(100),
  fetchMyTouristProfile: vi.fn().mockResolvedValue({}),
  sendLocationPing: vi.fn().mockResolvedValue([]),
  triggerPanic: vi.fn().mockResolvedValue({}),
}));

describe('SafetyTouristDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title and shows login warning when not authenticated', async () => {
    render(<SafetyTouristDashboardPage />);

    // Title text is translated key for now
    expect(
      await screen.findByText('safety.dashboard.title', { exact: false }),
    ).toBeInTheDocument();

    // Warning banner when user is not authenticated (uses i18n key)
    expect(screen.getByText('safety.dashboard.requireLogin')).toBeInTheDocument();

    // Panic button should be disabled when not authenticated
    const panicButton = screen.getByRole('button', { name: 'safety.dashboard.panicButton' });
    expect(panicButton).toBeDisabled();
  });
});
