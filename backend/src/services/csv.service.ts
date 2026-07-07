import Papa from 'papaparse';

export function parseCsvBuffer(buffer: Buffer): Record<string, string>[] {
  const content = buffer.toString('utf-8');
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}
