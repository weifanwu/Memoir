'use client';
import { useState, useEffect } from 'react';
import styles from '../../styles/Dialog.module.css'; // 使用 CSS 模块

export default function Dialog() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<Blob[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const newWorker = new window.Worker('/workers/imageWorker.js');
    newWorker.onmessage = (e) => {
      if (e.data.status === 'success') {
        alert('日记已保存！');
      } else {
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

  const handleSubmit = () => {
    if (worker) {
      worker.postMessage({ type: 'SAVE_ENTRY', entry: { text, images } });
      setText('');
      setImages([]);
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