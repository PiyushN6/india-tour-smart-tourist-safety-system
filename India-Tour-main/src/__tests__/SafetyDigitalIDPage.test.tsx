import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import SafetyDigitalIDPage from '../features/safety/SafetyDigitalIDPage';

// Mock i18n to return readable labels
vi.mock('../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock AuthContext so the form can mount
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    session: null,
    user: null,
  }),
}));

// Mock safety API used by SafetyDigitalIDForm
vi.mock('../services/safetyApi', () => ({
  fetchMyTouristProfile: vi.fn().mockResolvedValue({}),
  upsertTouristProfile: vi.fn().mockResolvedValue({ tourist_id_code: 'TR-000001' }),
}));

describe('SafetyDigitalIDPage', () => {
  it('renders Safety Digital ID heading and consent checkbox', async () => {
    render(<SafetyDigitalIDPage />);

    // Heading text comes from i18n key; appears in title and h1, so allow multiple
    const titleMatches = await screen.findAllByText('safety.digitalId.title', { exact: false });
    expect(titleMatches.length).toBeGreaterThan(0);

    // Consent checkbox is present
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });
});
