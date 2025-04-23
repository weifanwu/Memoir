import Link from 'next/link';
import styles from '../styles/Navbar.module.css'; // 使用 CSS 模块

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.logo}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logoLink}>Memoir</div>
          </Link>
        </div>
        <ul className={styles.navbarLinks}>
          <li>
            <Link href="/your-diaries" style={{ textDecoration: 'none' }}>
              <div className={styles.navbarLink}>Your Diaries</div>
            </Link>
          </li>
          <li>
            <Link href="/diary" style={{ textDecoration: 'none' }}>
              <div className={styles.navbarLink}>Diary</div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
