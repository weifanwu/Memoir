'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [registeredUsername, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { authenticated, username, refreshAuth } = useAuth();

  // 关闭 dropdown 的逻辑（点击外部时关闭菜单）
  const dropdownRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 注册逻辑
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: registeredUsername, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage(data.message);
      setTimeout(() => {
        setShowSignup(false);
        setUsername('');
        setPassword('');
        setMessage('');
      }, 1500);
    } else {
      setMessage(data.message || 'Signup failed.');
    }
  }

  // 登出逻辑
  async function handleSignout() {
    const res = await fetch('http://localhost:8080/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      setDropdownOpen(false);
      refreshAuth(); // 刷新全局认证状态
    } else {
      alert('Sign out failed.');
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              Memoir
            </Link>
          </div>
          <ul className={styles.navbarLinks}>
            {/* 只有登录后才显示 Diary 相关菜单 */}
            {authenticated && (
              <>
                <li>
                  <Link href="/your-diaries" className={styles.navbarLink}>
                    Your Diaries
                  </Link>
                </li>
                <li>
                  <Link href="/diary" className={styles.navbarLink}>
                    Diary
                  </Link>
                </li>
              </>
            )}

            {/* Profile / SignUp 按钮 */}
            <li ref={dropdownRef} style={{ position: 'relative' }}>
              {authenticated ? (
                <>
                  <button
                    className={styles.navbarLink}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {username ? `Welcome, ${username}` : 'Profile'}
                  </button>
                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        minWidth: '120px',
                      }}
                    >
                      <button
                        onClick={handleSignout}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button className={styles.navbarLink} onClick={() => setShowSignup(true)}>
                  Sign Up
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* 注册弹窗 */}
      {showSignup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setShowSignup(false)}>
              ✕
            </button>
            <h2 className={styles.modalTitle}>Sign Up</h2>
            <form onSubmit={handleSignup} className={styles.modalForm}>
              <input
                type="username"
                placeholder="User Name"
                value={registeredUsername}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.modalInput}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.modalInput}
                required
              />
              <button type="submit" className={styles.modalButton}>
                Sign Up
              </button>
            </form>
            {message && <p className={styles.modalMessage}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;