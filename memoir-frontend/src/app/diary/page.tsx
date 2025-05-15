'use client';
import { useState, useEffect } from 'react';
import styles from '../../styles/Diary.module.css'; // 使用 CSS 模块

export default function Diary() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<Blob[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const newWorker = new window.Worker('/workers/imageWorker.js');
    newWorker.onmessage = (e) => {
      if (e.data.status === 'success') {
        alert('日记已保存！');
        setText('');
        setImages([]);
      } else {
        alert('保存失败');
        console.error('保存失败:', e.data.error);
      }
    };
    setWorker(newWorker);
    return () => newWorker.terminate();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const blobs = files.map(file => file.slice()); // 保留Blob对象
    setImages(prev => [...prev, ...blobs]);
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('请填写日记内容');
      return;
    }

    const formData = new FormData();
    formData.append('content', text);
    images.forEach((image, _) => {
      formData.append('images[]', image); 
    });

    try {
      const response = await fetch('http://localhost:8000/api/addDiary', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert('日记已保存！');
        setText('');
        setImages([]);
      } else {
        alert('保存失败');
        console.error('保存失败:', result);
      }
    } catch (error) {
      if (worker) {
        console.log('离线保存...');
        worker.postMessage({ type: 'SAVE_ENTRY', entry: { text, images } });
      } else {
        alert('保存失败');
        console.error('Worker 不可用:', error);
      }
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
      />

      <div className={styles.imageGrid}>
        {images.map((blob, index) => {
          const imageUrl = URL.createObjectURL(blob);
          return (
            <div key={index} className={styles.imageWrapper}>
              <img src={imageUrl} alt={`预览 ${index}`} className={styles.preview} />
              <button className={styles.deleteBtn} onClick={() => handleDeleteImage(index)}>×</button>
            </div>
          );
        })}
        <label className={styles.uploadLabel}>
          上传图片
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className={styles.fileInput} />
        </label>
      </div>

      <button className={styles.button} onClick={handleSubmit}>保存日记</button>
    </div>
  );
}



["weifawef","ewognaeong", "", ""]