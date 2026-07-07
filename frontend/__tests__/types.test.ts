import { describe, it, expect } from 'vitest';
import { CRM_STATUS, DATA_SOURCE } from '../lib/types';

describe('CRM_STATUS', () => {
  it('contains all required values', () => {
    expect(CRM_STATUS).toContain('GOOD_LEAD_FOLLOW_UP');
    expect(CRM_STATUS).toContain('DID_NOT_CONNECT');
    expect(CRM_STATUS).toContain('BAD_LEAD');
    expect(CRM_STATUS).toContain('SALE_DONE');
    expect(CRM_STATUS).toHaveLength(4);
  });
});

describe('DATA_SOURCE', () => {
  it('contains all required values', () => {
    expect(DATA_SOURCE).toContain('leads_on_demand');
    expect(DATA_SOURCE).toContain('meridian_tower');
    expect(DATA_SOURCE).toContain('eden_park');
    expect(DATA_SOURCE).toContain('varah_swamy');
    expect(DATA_SOURCE).toContain('sarjapur_plots');
    expect(DATA_SOURCE).toHaveLength(5);
  });
});
