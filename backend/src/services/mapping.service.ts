import { CRM_STATUS, DATA_SOURCE, type CrmRecord, type SkippedRecord } from '../schema/crm.schema';

const asEnum = <T extends readonly string[]>(v: string, allowed: T): T[number] | '' =>
  (allowed as readonly string[]).includes(v) ? (v as T[number]) : '';

const isValidDate = (s: string): boolean => s !== '' && !Number.isNaN(new Date(s).getTime());

export function finalize(raw: Record<string, string>, rowIndex: number): { record?: CrmRecord; skip?: SkippedRecord } {
  const r: CrmRecord = {
    created_at: isValidDate(raw.created_at ?? '') ? raw.created_at : '',
    name: (raw.name ?? '').trim(),
    email: (raw.email ?? '').trim().toLowerCase(),
    country_code: (raw.country_code ?? '').trim(),
    mobile_without_country_code: (raw.mobile_without_country_code ?? '').replace(/\D/g, ''),
    company: (raw.company ?? '').trim(),
    city: (raw.city ?? '').trim(),
    state: (raw.state ?? '').trim(),
    country: (raw.country ?? '').trim(),
    lead_owner: (raw.lead_owner ?? '').trim(),
    crm_status: asEnum(raw.crm_status ?? '', CRM_STATUS),
    crm_note: (raw.crm_note ?? '').replace(/\r?\n/g, '\\n'),
    data_source: asEnum(raw.data_source ?? '', DATA_SOURCE),
    possession_time: (raw.possession_time ?? '').trim(),
    description: (raw.description ?? '').replace(/\r?\n/g, '\\n'),
  };

  if (!r.email && !r.mobile_without_country_code) {
    return { skip: { rowIndex, reason: 'no email or mobile', raw } };
  }

  return { record: r };
}
