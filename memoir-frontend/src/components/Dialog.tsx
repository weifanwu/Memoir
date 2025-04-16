'use client';

import { useState } from 'react';

export default function Dialog() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      setImages(prev => [...prev, ...newImages]);
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log('日记内容:', text);
    console.log('上传的图片:', images);
    alert('日记已保存');
  };

  return (
    <div className="container">
      <h2 className="title">写日记</h2>
      <textarea
        className="textarea"
        placeholder="记录你的心情与故事..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

        <div className="imageGrid">
          {images.map((img, index) => (
            <div key={index} className="imageWrapper">
              <img src={img} alt={`预览${index}`} className="preview" />
              <button className="deleteBtn" onClick={() => handleDeleteImage(index)}>
                ×
              </button>
            </div>
          ))}
         <label className="uploadLabel">
         上传图片
         <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="fileInput"
         />
         </label>
        </div>

      <button className="button" onClick={handleSubmit}>
        保存日记
      </button>

    </div>
  );
}
