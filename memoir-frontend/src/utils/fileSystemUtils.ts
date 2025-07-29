const DB_NAME = 'DiaryDB';
const STORE_NAME = 'FileHandles';
const HANDLE_KEY = 'diaryJsonFileHandle';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getHandleFromDB(): Promise<FileSystemFileHandle | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(HANDLE_KEY);
    req.onsuccess = () => {
      resolve(req.result || undefined);
      db.close(); // 用完关闭连接
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

export function saveHandleToDB(handle: FileSystemFileHandle) {
  return openDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, HANDLE_KEY);

      req.onsuccess = () => {
        resolve();
        db.close(); // 关闭数据库连接
      };
      req.onerror = () => {
        reject(req.error);
        db.close(); // 出错也要关闭
      };
    });
  });
}