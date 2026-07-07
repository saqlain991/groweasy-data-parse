import { z } from 'zod';

export const CRM_STATUS = ["GOOD_LEAD_FOLLOW_UP","DID_NOT_CONNECT","BAD_LEAD","SALE_DONE"] as const;
export const DATA_SOURCE = ["leads_on_demand","meridian_tower","eden_park","varah_swamy","sarjapur_plots"] as const;

export const crmRecordSchema = z.object({
  created_at: z.string(),
  name: z.string(),
  email: z.string(),
  country_code: z.string(),
  mobile_without_country_code: z.string(),
  company: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  lead_owner: z.string(),
  crm_status: z.enum(CRM_STATUS).or(z.literal('')),
  crm_note: z.string(),
  data_source: z.enum(DATA_SOURCE).or(z.literal('')),
  possession_time: z.string(),
  description: z.string(),
});

export type CrmRecord = z.infer<typeof crmRecordSchema>;

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
