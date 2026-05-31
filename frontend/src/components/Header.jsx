import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { login as loginApi, register as registerApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, login, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ userName: '', email: '', password: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await loginApi(loginForm);
      login({ userName: res.data.userName, email: res.data.email }, res.data.token);
      setAuthModal(null);
      addToast('Вітаємо! Ви увійшли в систему.');
    } catch (err) {
      addToast(err.response?.data?.title || 'Невірні дані для входу', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await registerApi(registerForm);
      login({ userName: res.data.userName, email: res.data.email }, res.data.token);
      setAuthModal(null);
      addToast('Реєстрацію успішно завершено!');
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка реєстрації', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate('/');
    addToast('Ви вийшли з системи.');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>Perfume</span>
            <span className={styles.logoSub}>workshop</span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
              Головна
            </Link>
            <Link to="/catalog" className={`${styles.navLink} ${isActive('/catalog') ? styles.active : ''}`}>
              Каталог
            </Link>
          </nav>

          <div className={styles.actions}>
            <Link to="/cart" className={styles.cartBtn} aria-label="Кошик">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
              )}
            </Link>

            {user ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenu(!userMenu)}
                >
                  <div className={styles.userAvatar}>
                    {user.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={styles.userName}>{user.userName}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {userMenu && (
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setUserMenu(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Профіль
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" className={styles.dropdownItem} onClick={() => setUserMenu(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Адмін-панель
                      </Link>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Вийти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.authBtn} onClick={() => setAuthModal('login')}>
                Увійти
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {authModal && (
        <div className={styles.modalOverlay} onClick={() => setAuthModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setAuthModal(null)}>✕</button>

            <div className={styles.modalTabs}>
              <button
                className={`${styles.modalTab} ${authModal === 'login' ? styles.activeTab : ''}`}
                onClick={() => setAuthModal('login')}
              >
                Вхід
              </button>
              <button
                className={`${styles.modalTab} ${authModal === 'register' ? styles.activeTab : ''}`}
                onClick={() => setAuthModal('register')}
              >
                Реєстрація
              </button>
            </div>

            {authModal === 'login' ? (
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formHeader}>
                  <h2>З поверненням</h2>
                  <p>Увійдіть до вашого акаунту</p>
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Пароль</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={authLoading}>
                  {authLoading ? 'Завантаження...' : 'Увійти'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className={styles.form}>
                <div className={styles.formHeader}>
                  <h2>Створити акаунт</h2>
                  <p>Приєднуйтесь до нашої спільноти</p>
                </div>
                <div className={styles.field}>
                  <label>Ім'я користувача</label>
                  <input
                    type="text"
                    placeholder="username"
                    value={registerForm.userName}
                    onChange={(e) => setRegisterForm({ ...registerForm, userName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Пароль</label>
                  <input
                    type="password"
                    placeholder="Мінімум 8 символів"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={authLoading}>
                  {authLoading ? 'Завантаження...' : 'Зареєструватись'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
