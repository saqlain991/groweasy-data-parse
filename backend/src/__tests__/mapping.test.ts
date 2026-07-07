import { describe, it, expect } from 'vitest';
import { finalize } from '../services/mapping.service';

describe('finalize()', () => {
  it('maps a complete valid record', () => {
    const raw = {
      name: 'John Doe',
      email: 'JOHN@EXAMPLE.COM',
      country_code: '+91',
      mobile_without_country_code: '9876543210',
      company: 'Acme',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      lead_owner: 'Alice',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
      crm_note: 'Test note',
      data_source: 'meridian_tower',
      possession_time: '3 months',
      description: 'Good prospect',
      created_at: '2026-07-07',
    };
    const { record, skip } = finalize(raw, 0);
    expect(skip).toBeUndefined();
    expect(record).toBeDefined();
    expect(record!.email).toBe('john@example.com');
    expect(record!.crm_status).toBe('GOOD_LEAD_FOLLOW_UP');
    expect(record!.data_source).toBe('meridian_tower');
  });

  it('lowercases email', () => {
    const raw = { email: 'UPPER@CASE.COM', mobile_without_country_code: '9876543210' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.email).toBe('upper@case.com');
  });

  it('strips non-digit chars from mobile', () => {
    const raw = { email: 'a@b.com', mobile_without_country_code: '+91-98765 43210' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.mobile_without_country_code).toBe('919876543210');
  });

  it('skips records with no email and no mobile', () => {
    const raw = { name: 'Ghost', email: '', mobile_without_country_code: '' };
    const { record, skip } = finalize(raw as Record<string, string>, 5);
    expect(record).toBeUndefined();
    expect(skip).toBeDefined();
    expect(skip!.rowIndex).toBe(5);
    expect(skip!.reason).toMatch(/no email or mobile/i);
  });

  it('accepts record with only email', () => {
    const raw = { email: 'only@email.com', mobile_without_country_code: '' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record).toBeDefined();
    expect(record!.email).toBe('only@email.com');
  });

  it('accepts record with only mobile', () => {
    const raw = { email: '', mobile_without_country_code: '9876543210' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record).toBeDefined();
    expect(record!.mobile_without_country_code).toBe('9876543210');
  });

  it('rejects invalid crm_status', () => {
    const raw = { email: 'a@b.com', crm_status: 'INVALID_STATUS' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.crm_status).toBe('');
  });

  it('rejects invalid data_source', () => {
    const raw = { email: 'a@b.com', data_source: 'unknown_source' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.data_source).toBe('');
  });

  it('replaces literal newlines in crm_note', () => {
    const raw = { email: 'a@b.com', crm_note: 'line1\nline2\r\nline3' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.crm_note).toBe('line1\\nline2\\nline3');
  });

  it('clears invalid created_at', () => {
    const raw = { email: 'a@b.com', created_at: 'not-a-date' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.created_at).toBe('');
  });

  it('preserves valid ISO date in created_at', () => {
    const raw = { email: 'a@b.com', created_at: '2026-01-15' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.created_at).toBe('2026-01-15');
  });

  it('trims whitespace from string fields', () => {
    const raw = { email: '  trim@me.com  ', name: '  Alice  ', company: '  Corp  ' };
    const { record } = finalize(raw as Record<string, string>, 0);
    expect(record!.email).toBe('trim@me.com');
    expect(record!.name).toBe('Alice');
    expect(record!.company).toBe('Corp');
  });

  it('all valid crm_status values are accepted', () => {
    const statuses = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
    for (const crm_status of statuses) {
      const { record } = finalize({ email: 'a@b.com', crm_status } as Record<string, string>, 0);
      expect(record!.crm_status).toBe(crm_status);
    }
  });

  it('all valid data_source values are accepted', () => {
    const sources = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];
    for (const data_source of sources) {
      const { record } = finalize({ email: 'a@b.com', data_source } as Record<string, string>, 0);
      expect(record!.data_source).toBe(data_source);
    }
  });
});
