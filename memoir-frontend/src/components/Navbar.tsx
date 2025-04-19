import Link from 'next/link';
import styles from '../styles/Navbar.module.css'; // 使用 CSS 模块

const Navbar = () => {
  return (
    <nav className={styles.navbar}> {/* 使用 styles 访问类名 */}
      <div className={styles.navbarContainer}> {/* 使用 styles 访问类名 */}
        <div className={styles.logo}> {/* 使用 styles 访问类名 */}
          <Link href="/">
            <div className={styles.logoLink}>Memoir</div> {/* 使用 styles 访问类名 */}
          </Link>
        </div>
        <ul className={styles.navbarLinks}> {/* 使用 styles 访问类名 */}
          <li>
            <Link href="/your-dialogs">
              <div className={styles.navbarLink}>Your Dialogs</div> {/* 使用 styles 访问类名 */}
            </Link>
          </li>
          <li>
            <Link href="/dialog">
              <div className={styles.navbarLink}>Dialog</div> {/* 使用 styles 访问类名 */}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;