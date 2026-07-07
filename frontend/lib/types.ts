export const CRM_STATUS = ["GOOD_LEAD_FOLLOW_UP","DID_NOT_CONNECT","BAD_LEAD","SALE_DONE"] as const;
export const DATA_SOURCE = ["leads_on_demand","meridian_tower","eden_park","varah_swamy","sarjapur_plots"] as const;

export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: (typeof CRM_STATUS)[number] | "";
  crm_note: string;
  data_source: (typeof DATA_SOURCE)[number] | "";
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  rowIndex: number;
  reason: string;
  raw: Record<string, unknown>;
}

export interface ImportResponse {
  totals: { received: number; imported: number; skipped: number };
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

export interface SavedImport {
  id: string;
  name: string;
  savedAt: string;
  records: CrmRecord[];
  totals: { received: number; imported: number; skipped: number };
}
