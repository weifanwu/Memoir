'use client';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/YourDiaries.module.css';
import { getHandleFromDB } from '@/utils/fileSystemUtils';

interface Diary {
  content: string;
  date: string;
  diaryid: string;
  username: string;
}

const YourDiaries: React.FC = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const { authenticated, username, loading } = useAuth();
  const router = useRouter();
  const [deletingIds, setDeletingIds] = useState<string[]>([]);


  async function deleteDiaryFromLocal(diaryid: string) {
    try {
      const handle = await getHandleFromDB();
      if (!handle) {
        throw new Error('本地文件句柄不存在');
      }

      const file = await handle.getFile();
      const text = await file.text();
      let entries: any[] = [];
      try {
        entries = JSON.parse(text);
        if (!Array.isArray(entries)) {
          entries = [];
        }
      } catch {
        entries = [];
      }

      const newEntries = entries.filter((entry) => entry.diaryid !== diaryid);

      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(newEntries, null, 2)); // 美化缩进方便查看
      await writable.close();

      console.log(`已删除本地日记: ${diaryid}`);
      return true;
    } catch (error) {
      console.error('删除本地日记失败:', error);
      return false;
    }
  }

  useEffect(() => {
    if (!authenticated) {
      router.push('/');
      return;
    }
    const fetchDiaries = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/getDiaries?username=${encodeURIComponent(username || '')}`, {
          credentials: 'include',
        });
        const data = await response.json();
        console.log('Fetched diaries:', data);
        setDiaries(data.diaries || []);
      } catch (error) {
        console.error('Error fetching diaries:', error);
      }
    };

    fetchDiaries();
  }, [authenticated, loading, router, username]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorText}>You need to log in to view your diaries.</p>
      </div>
    );
  }

  const handleDelete = async (diaryid: string) => {
    if (!confirm('确定删除这篇日记吗？此操作不可撤销。')) return;

    setDeletingIds((ids) => [...ids, diaryid]);

    try {
      const res = await fetch(`http://localhost:8000/api/deleteDiary/${encodeURIComponent(diaryid)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('删除失败');
      setDiaries((prev) => prev.filter((d) => d.diaryid !== diaryid));
      await deleteDiaryFromLocal(diaryid);
      alert('日记已删除！');
    } catch (error) {
      alert('删除失败，请稍后重试');
      console.error(error);
    } finally {
      setDeletingIds((ids) => ids.filter((id) => id !== diaryid));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📝 Your Diaries</h1>
      {diaries.length === 0 ? (
        <p className={styles.noDiaries}>No diaries found.</p>
      ) : (
        <div className={styles.diaryList}>
          {diaries
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((diary) => (
              <div key={diary.diaryid} className={styles.diaryCard}>
                <div className={styles.diaryHeader}>
                  <time className={styles.diaryDate}>
                    {diary.date}
                  </time>
                  <button
                    disabled={deletingIds.includes(diary.diaryid)}
                    onClick={() => handleDelete(diary.diaryid)}
                    className={styles.deleteButton}
                    title="删除日记"
                    aria-label="删除日记"
                  >
                    {deletingIds.includes(diary.diaryid) ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      '×'
                    )}
                  </button>
                </div>
                <div className={styles.diaryContent}>{diary.content}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default YourDiaries;
