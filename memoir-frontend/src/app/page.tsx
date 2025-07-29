"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/Home.module.css";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [syncing, setSyncing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const router = useRouter();
  const { authenticated, loading, refreshAuth } = useAuth();

  useEffect(() => {
    workerRef.current = new Worker("/workers/diaryWorker.js");
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setMessage(data.message);
        await refreshAuth();
      } else {
        setMessage(data.message || "登录失败，请检查用户名或密码");
      }
    } catch (error) {
      console.error(error);
      setMessage("无法连接到服务器");
    }
  };

  async function uploadOfflineDiaries(diaries: any[]) {
    for (const diary of diaries) {
      console.log("Uploading diary:", diary);
      const res = await fetch("http://localhost:8000/api/uploadDiary", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diary),
      });
      if (!res.ok) {
        throw new Error("Failed to upload some diaries");
      }
    }
  }

  useEffect(() => {
    if (!authenticated || !workerRef.current) return;

    setSyncing(true);
    const worker = workerRef.current;

    worker.postMessage({ type: "READ_ENTRIES" });

    worker.onmessage = async (e) => {
      const { status, entries, error } = e.data;
      console.log("Worker message:", e.data);

      if (status === "READ_SUCCESS") {
        if (entries && entries.length > 0) {
          console.log(`Found ${entries.length} offline diaries, syncing...`);
          try {
            await uploadOfflineDiaries(entries);
            worker.postMessage({ type: "CLEAR_ENTRIES" });
          } catch (err) {
            console.error("Upload failed, keeping offline diaries", err);
            setSyncing(false);
          }
        } else {
          setSyncing(false);
        }
      }

      if (status === "CLEAR_SUCCESS") {
        console.log("Offline diaries cleared.");
        setSyncing(false);
        router.push("/your-diaries");
      }

      if (status === "WORKER_ERROR" || status.endsWith("_ERROR")) {
        console.error("Worker error:", error);
        setSyncing(false);
        router.push("/your-diaries");
      }
    };
  }, [authenticated]);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.title}>📝 Memoir – The Offline Journal</h1>
        <p className={styles.subtitle}>
          Privacy-first, offline-capable journaling app powered by AI search & automation.
        </p>
      </section>

      {/* Vision & Features */}
      <section className={styles.featuresSection}>
        <div className={styles.card}>
          <h2>🌟 Vision</h2>
          <p>
            Most journaling apps force cloud storage, require internet, and offer only keyword
            search. Memoir changes everything: fully offline, private, with AI-powered discovery.
          </p>
        </div>

        <div className={styles.card}>
          <h2>✅ Features</h2>
          <ul>
            <li>Offline Writing & Local-First Storage</li>
            <li>AI-Assisted Natural Language Search</li>
            <li>Optional Cloud Backup & Sync</li>
            <li>Mood Tracking & Automatic Summaries</li>
          </ul>
        </div>

        <div className={styles.card}>
          <h2>🔐 Core Principles</h2>
          <ul>
            <li>Privacy-first – No forced cloud storage</li>
            <li>Offline-first – Journal anywhere</li>
            <li>AI-powered – Smart tagging & summaries</li>
          </ul>
        </div>
      </section>

      {/* Login Card */}
      {!authenticated && !loading && (
        <section className={styles.loginWrapper}>
          <div className={styles.loginCard}>
            <h2 className={styles.loginTitle}>登录你的日记</h2>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
              <button type="submit" className={styles.loginButton}>
                登录
              </button>
              {message && <p className={styles.message}>{message}</p>}
            </form>
          </div>
        </section>
      )}

      {/* Sync Loader */}
      {syncing && (
        <div className={styles.syncOverlay}>
          <div className={styles.syncBox}>
            <div className={styles.spinner}></div>
            <p>正在同步离线日记，请稍候...</p>
          </div>
        </div>
      )}
    </div>
  );
}
