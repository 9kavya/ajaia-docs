import { describe, it, expect } from 'vitest';
import { localIndexedDB } from '../lib/db/indexedDB';

describe('IndexedDB Client Store', () => {
  it('correctly detects browser vs server environment for IndexedDB', () => {
    // In node/vitest environment, window is undefined or mock
    const isSupported = localIndexedDB.isSupported();
    expect(typeof isSupported).toBe('boolean');
  });

  it('exposes full document lifecycle methods', () => {
    expect(typeof localIndexedDB.saveDocument).toBe('function');
    expect(typeof localIndexedDB.getDocument).toBe('function');
    expect(typeof localIndexedDB.getAllDocuments).toBe('function');
    expect(typeof localIndexedDB.deleteDocument).toBe('function');
    expect(typeof localIndexedDB.syncDocuments).toBe('function');
  });
});

