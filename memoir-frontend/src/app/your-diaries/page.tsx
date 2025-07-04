'use client';
import React, { useEffect, useState } from 'react';

interface DiaryImage {
  id: number;
  url: string;
}

interface Diary {
  id: number;
  content: string;
  created_at: string;
  images: DiaryImage[];
}

const YourDiaries: React.FC = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/getDiaries');
        const data = await response.json();
        console.log('Fetched diaries:', data); // 调试输出
        setDiaries(data.diaries); // 注意你接口返回的是 { diaries: [...] }
      } catch (error) {
        console.error('Error fetching diaries:', error);
      }
    };

    fetchDiaries();
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Diaries</h1>
      {diaries.length === 0 ? (
        <p>No diaries found.</p>
      ) : (
        <div className="space-y-6">
          {diaries.map((diary) => (
            <div key={diary.id} className="border rounded-xl p-4 shadow">
              <div className="text-gray-600 text-sm mb-2">
                {new Date(diary.created_at).toLocaleString()}
              </div>
              <div className="text-lg mb-2">{diary.content}</div>
              <div className="flex flex-wrap gap-4">
                {diary.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={`diary-${diary.id}-img-${img.id}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourDiaries;