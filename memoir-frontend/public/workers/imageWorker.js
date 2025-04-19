self.onmessage = async (event) => {
   const { type, entry } = event.data;
 
   if (type === 'SAVE_ENTRY') {
     const dbRequest = indexedDB.open('DiaryDB', 1);
 
     dbRequest.onupgradeneeded = (e) => {
       const db = e.target.result;
       if (!db.objectStoreNames.contains('entries')) {
         db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
       }
     };
 
     dbRequest.onsuccess = () => {
       const db = dbRequest.result;
       const tx = db.transaction('entries', 'readwrite');
       const store = tx.objectStore('entries');
 
       store.add({
         text: entry.text,
         images: entry.images,
         createdAt: new Date().toISOString()
       });
 
       tx.oncomplete = () => {
         self.postMessage({ status: 'success' });
       };
       tx.onerror = () => {
         self.postMessage({ status: 'error', error: tx.error });
       };
     };
 
     dbRequest.onerror = () => {
       self.postMessage({ status: 'error', error: dbRequest.error });
     };
   }
 };
 