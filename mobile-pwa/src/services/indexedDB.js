/**
 * IndexedDB Service - Web version of offline database
 * Replaces SQLite with browser IndexedDB
 */

const DB_NAME = 'skids_screening';
const DB_VERSION = 1;

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Children store
        if (!db.objectStoreNames.contains('children')) {
          const childrenStore = db.createObjectStore('children', { keyPath: 'id' });
          childrenStore.createIndex('name', 'name', { unique: false });
          childrenStore.createIndex('grade', 'grade', { unique: false });
          childrenStore.createIndex('school_code', 'school_code', { unique: false });
        }

        // Screening results store
        if (!db.objectStoreNames.contains('results')) {
          const resultsStore = db.createObjectStore('results', { keyPath: 'id' });
          resultsStore.createIndex('child_id', 'child_id', { unique: false });
          resultsStore.createIndex('screening_date', 'screening_date', { unique: false });
          resultsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async addChild(child) {
    const tx = this.db.transaction(['children'], 'readwrite');
    const store = tx.objectStore('children');
    await store.put(child);
    return tx.complete;
  }

  async getChild(id) {
    const tx = this.db.transaction(['children'], 'readonly');
    const store = tx.objectStore('children');
    return store.get(id);
  }

  async getAllChildren() {
    const tx = this.db.transaction(['children'], 'readonly');
    const store = tx.objectStore('children');
    return store.getAll();
  }

  async searchChildren(query) {
    const all = await this.getAllChildren();
    const lowerQuery = query.toLowerCase();
    return all.filter(child => 
      child.name.toLowerCase().includes(lowerQuery) ||
      child.id.toLowerCase().includes(lowerQuery)
    );
  }

  async addResult(result) {
    const tx = this.db.transaction(['results'], 'readwrite');
    const store = tx.objectStore('results');
    result.synced = false;
    result.created_at = new Date().toISOString();
    await store.put(result);
    
    // Add to sync queue
    await this.addToSyncQueue({
      id: `sync_${Date.now()}`,
      result_id: result.id,
      action: 'create',
      timestamp: Date.now()
    });
    
    return tx.complete;
  }

  async getResult(id) {
    const tx = this.db.transaction(['results'], 'readonly');
    const store = tx.objectStore('results');
    return store.get(id);
  }

  async getAllResults() {
    const tx = this.db.transaction(['results'], 'readonly');
    const store = tx.objectStore('results');
    return store.getAll();
  }

  async getResultsByChild(childId) {
    const tx = this.db.transaction(['results'], 'readonly');
    const store = tx.objectStore('results');
    const index = store.index('child_id');
    return index.getAll(childId);
  }

  async getUnsyncedResults() {
    const tx = this.db.transaction(['results'], 'readonly');
    const store = tx.objectStore('results');
    const allResults = await store.getAll();
    return allResults.filter(r => r.synced === false);
  }

  async markAsSynced(resultId) {
    const tx = this.db.transaction(['results'], 'readwrite');
    const store = tx.objectStore('results');
    const result = await store.get(resultId);
    if (result) {
      result.synced = true;
      result.synced_at = new Date().toISOString();
      await store.put(result);
    }
    return tx.complete;
  }

  async addToSyncQueue(item) {
    const tx = this.db.transaction(['sync_queue'], 'readwrite');
    const store = tx.objectStore('sync_queue');
    await store.put(item);
    return tx.complete;
  }

  async getSyncQueue() {
    const tx = this.db.transaction(['sync_queue'], 'readonly');
    const store = tx.objectStore('sync_queue');
    return store.getAll();
  }

  async clearSyncQueue() {
    const tx = this.db.transaction(['sync_queue'], 'readwrite');
    const store = tx.objectStore('sync_queue');
    await store.clear();
    return tx.complete;
  }

  async importChildren(childrenArray) {
    const tx = this.db.transaction(['children'], 'readwrite');
    const store = tx.objectStore('children');
    
    for (const child of childrenArray) {
      await store.put(child);
    }
    
    return childrenArray.length;
  }

  async deleteResult(id) {
    const tx = this.db.transaction(['results'], 'readwrite');
    const store = tx.objectStore('results');
    await store.delete(id);
    return tx.complete;
  }

  async clearAllData() {
    const tx = this.db.transaction(['children', 'results', 'sync_queue'], 'readwrite');
    await tx.objectStore('children').clear();
    await tx.objectStore('results').clear();
    await tx.objectStore('sync_queue').clear();
    return tx.complete;
  }
}

export const db = new IndexedDBService();
