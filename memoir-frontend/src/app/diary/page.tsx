'use client';
import { useState, useEffect } from 'react';
import styles from '../../styles/Diary.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getHandleFromDB, saveHandleToDB } from '@/utils/fileSystemUtils';


function saveToLocalWorker(diaryid: string, content: string, date: string, username: string) {
  const worker = new Worker('/workers/diaryWorker.js');
  worker.postMessage({
    type: 'SAVE_ENTRY',
    entry: { content, date, username, diaryid },
  });
  worker.onmessage = (e) => {
    if (e.data.status === 'success') {
      console.log('本地备份成功');
    } else {
      console.error('本地备份失败', e.data.error);
    }
    worker.terminate();
  };
}

export default function Diary() {
  const [text, setText] = useState('');
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [saving, setSaving] = useState(false);
  const { authenticated, username, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push('/');
      return;
    }

    getHandleFromDB().then((handle) => {
      if (handle) {
        setFileHandle(handle);
      }
    }).catch(console.error);
  }, [authenticated, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  async function readExistingJsonArray(handle: FileSystemFileHandle): Promise<any[]> {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      if (!text) return [];
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr;
      else return [];
    } catch (e) {
      console.warn('读取 JSON 文件失败，初始化为空数组', e);
      return [];
    }
  }

  async function appendDiaryEntry(handle: FileSystemFileHandle, entry: any) {
    const existing = await readExistingJsonArray(handle);
    existing.push(entry);

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(existing, null, 2));
    await writable.close();
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('请填写日记内容');
      return;
    }

    setSaving(true);
    const diaryid = crypto.randomUUID();
    try {
      let handle = fileHandle;
      if (!handle) {
        handle = await (window as any).showSaveFilePicker({
          suggestedName: 'diary-entries.json',
          types: [
            {
              description: 'JSON 文件',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        setFileHandle(handle);
        if (handle) {
          await saveHandleToDB(handle);
        }
      }

      const date = new Date().toISOString();
      const diaryEntry = {
          diaryid: diaryid,
          username: username || 'anonymous',
          content: text,
          date: date,
      };

      if (handle) {
        await appendDiaryEntry(handle, diaryEntry);
      }

      const response = await fetch('http://localhost:8000/api/uploadDiary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username || 'anonymous',
          content: text,
          date: date,
          diaryid: diaryid,
        }),
      });

      if (!response.ok) {
        console.warn('上传失败，转存本地 IndexedDB');
        saveToLocalWorker(diaryid, text, date, username || 'anonymous');
        alert('服务器不可用，已将日记保存到本地，稍后会自动同步。');
        setSaving(false);
        return;
      }

      const result = await response.json();
      console.log('服务器响应:', result);

      alert('日记已保存（服务器 + 本地 JSON 文件）！');
      setText('');
    } catch (error) {
      console.error('保存失败，转存本地', error);
      const date = new Date().toISOString();
      saveToLocalWorker(diaryid, text, date, username || 'anonymous');
      alert('网络错误，日记已保存到本地，稍后会同步。');
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>写日记</h2>
      <textarea
        className={styles.textarea}
        placeholder="记录你的心情与故事..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={saving}
      />

      <button className={styles.button} onClick={handleSubmit} disabled={saving}>
        {saving ? '保存中...' : '保存日记'}
      </button>
    </div>
  );
}
