import type { AppData } from '../types';
import { createDemoData } from '../data/demo';
import { validateAppData } from '../utils/taskUtils';

export const STORAGE_KEY = 'taskflow.app-data.v1';

export type LoadResult = { data: AppData; warning?: string; recovered: boolean };

export function loadAppData(): LoadResult {
  const fallback = createDemoData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { data: fallback, recovered: false };
    const parsed: unknown = JSON.parse(raw);
    if (validateAppData(parsed)) return { data: parsed, recovered: false };
    return { data: fallback, warning: 'Saved data was invalid. Demo data has been loaded; export or reset from Settings if needed.', recovered: true };
  } catch {
    return { data: fallback, warning: 'Saved data could not be read. TaskFlow opened with demo data.', recovered: true };
  }
}

export function saveAppData(data: AppData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function parseImport(jsonText: string): AppData {
  let value: unknown;
  try {
    value = JSON.parse(jsonText);
  } catch {
    throw new Error('This file is not valid JSON. Your current data has not changed.');
  }
  if (!validateAppData(value)) throw new Error('The file does not match the TaskFlow data format. Your current data has not changed.');
  return value;
}

export function downloadJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
