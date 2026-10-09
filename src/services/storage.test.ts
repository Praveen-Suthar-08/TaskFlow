import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDemoData } from '../data/demo';
import { loadAppData, parseImport, saveAppData, STORAGE_KEY } from './storage';

describe('TaskFlow browser storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves and restores a valid workspace', () => {
    const data = createDemoData();
    saveAppData(data);
    const loaded = loadAppData();
    expect(loaded.data).toEqual(data);
    expect(loaded.recovered).toBe(false);
    expect(loaded.warning).toBeUndefined();
  });

  it('recovers with demo data when persisted JSON is corrupted', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json');
    const loaded = loadAppData();
    expect(loaded.recovered).toBe(true);
    expect(loaded.warning).toMatch(/could not be read/i);
    expect(loaded.data.version).toBe(1);
    expect(loaded.data.projects.length).toBeGreaterThan(0);
  });

  it('validates an import before returning it', () => {
    const data = createDemoData();
    expect(parseImport(JSON.stringify(data))).toEqual(data);
    expect(() => parseImport('{broken')).toThrow(/valid JSON/i);
    expect(() => parseImport(JSON.stringify({ ...data, version: 2 }))).toThrow(/TaskFlow data format/i);
  });

  it('does not mutate saved data when an import is invalid', () => {
    const data = createDemoData();
    saveAppData(data);
    const before = window.localStorage.getItem(STORAGE_KEY);
    expect(() => parseImport(JSON.stringify({ ...data, activeProjectId: 'missing' }))).toThrow();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(before);
  });

  it('surfaces storage write failures to the caller', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    expect(() => saveAppData(createDemoData())).toThrow(/Quota exceeded/);
  });
});
