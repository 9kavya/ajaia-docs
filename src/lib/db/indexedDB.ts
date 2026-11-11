import { Document, Attachment } from './types';

const DB_NAME = 'AjaiaDocs_LocalDB';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const ATTACH_STORE = 'attachments';

class LocalIndexedDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  public async getDB(): Promise<IDBDatabase> {
    if (!this.isSupported()) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Documents store
        if (!db.objectStoreNames.contains(DOCS_STORE)) {
          const docStore = db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
          docStore.createIndex('ownerId', 'ownerId', { unique: false });
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Attachments store
        if (!db.objectStoreNames.contains(ATTACH_STORE)) {
          const attachStore = db.createObjectStore(ATTACH_STORE, { keyPath: 'id' });
          attachStore.createIndex('documentId', 'documentId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save or update document in IndexedDB
   */
  public async saveDocument(doc: Document): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get document by ID from IndexedDB
   */
  public async getDocument(id: string): Promise<Document | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readonly');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as Document | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all documents from IndexedDB, optionally filtered by user and role
   */
  public async getAllDocuments(userId?: string, filter: 'all' | 'owned' | 'shared' = 'all'): Promise<Document[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readonly');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = (request.result as Document[]) || [];

        // Sort descending by updatedAt
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        if (userId) {
          results = results.filter((doc) => {
            const isOwner = doc.ownerId === userId;
            const isCollab = doc.collaborators?.some((c) => c.userId === userId);

            if (filter === 'owned') return isOwner;
            if (filter === 'shared') return isCollab && !isOwner;
            return isOwner || isCollab;
          });
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete document from IndexedDB
   */
  public async deleteDocument(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Synchronize batch documents into IndexedDB
   */
  public async syncDocuments(docs: Document[]): Promise<void> {
    if (!docs || docs.length === 0) return;
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);

      for (const doc of docs) {
        store.put(doc);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const localIndexedDB = new LocalIndexedDB();
