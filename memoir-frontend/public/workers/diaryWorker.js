self.onmessage = async (event) => {
  const { type, entry } = event.data;
  
  const DB_NAME = 'DiaryDB';
  const STORE_NAME = 'entries';
  const DB_VERSION = 2;

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 处理保存
  if (type === 'SAVE_ENTRY') {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add({
        content: entry.content,
        date: entry.date,
        diaryid: entry.diaryid,
        username: entry.username,
        createdAt: new Date().toISOString()
      });

      tx.oncomplete = () => {
        self.postMessage({ status: 'success' });
      };
      tx.onerror = () => {
        self.postMessage({ status: 'error', error: tx.error });
      };
    } catch (err) {
      self.postMessage({ status: 'error', error: err.message });
    }
  }

  // 处理读取
  if (type === 'READ_ENTRIES') {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        self.postMessage({ status: 'READ_SUCCESS', entries: request.result });
      };
      request.onerror = () => {
        self.postMessage({ status: 'WORKER_ERROR', error: request.error });
      };
    } catch (err) {
      self.postMessage({ status: 'WORKER_ERROR', error: err.message });
    }
  }

  // 清空所有
  if (type === 'CLEAR_ENTRIES') {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        self.postMessage({ status: 'CLEAR_SUCCESS', cleared: true });
      };
      request.onerror = () => {
        self.postMessage({ status: 'WORKER_ERROR', error: request.error });
      };
    } catch (err) {
      self.postMessage({ status: 'WORKER_ERROR', error: err.message });
    }
  }
};