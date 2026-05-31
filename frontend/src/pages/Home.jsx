import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { useFilters } from '../context/FiltersContext';
import ProductCard from '../components/ProductCard';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { categories } = useFilters();
  const [search, setSearch] = useState('');
  const [newProducts, setNewProducts] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newRes, ratedRes] = await Promise.all([
          getProducts({ pageSize: 4, pageNumber: 1 }),
          getProducts({ pageSize: 4, pageNumber: 1, sortBy: 'Rating', isDescending: true }),
        ]);
        setNewProducts(newRes.data.items || []);
        setTopRated(ratedRes.data.items || []);
      } catch {
        // silently fail — backend may not be running
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <main className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        {/* ↓ Замініть рядок нижче на <img src="YOUR_PHOTO_URL" … /> або залиште div для кольорового фону */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Мистецтво<br />
            <em>аромату</em>
          </h1>

          <p className={styles.heroSubtitle}>
            Відкрийте для себе рідкісні парфуми з усього світу.<br />
            Кожен флакон — це історія.
          </p>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Який парфум ви шукаєте?"
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>
                Знайти
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features strip */}
      <section className={styles.features}>
        <div className={styles.container}>
          {[
            { icon: '🚚', title: 'Безкоштовна доставка', sub: 'Від 2000 грн' },
            { icon: '✦', title: 'Оригінальна продукція', sub: '100% автентичність' },
            { icon: '↩', title: 'Легке повернення', sub: '14 днів' }
          ].map((f, i) => (
            <div key={i} className={styles.feature}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <div>
                <p className={styles.featureTitle}>{f.title}</p>
                <p className={styles.featureSub}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEye}>Новинки</p>
              <h2 className={styles.sectionTitle}>Нові надходження</h2>
            </div>
            <button className={styles.seeAll} onClick={() => navigate('/catalog')}>
              Переглянути всі →
            </button>
          </div>
          {loading ? (
            <div className={styles.grid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={styles.skeletonBody}>
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '60%' }} />
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '80%', height: '20px' }} />
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : newProducts.length > 0 ? (
            <div className={styles.grid}>
              {newProducts.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 0.1}s` }} className="fade-up">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Товари з'являться незабаром</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Rated */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEye}>Рейтинг</p>
              <h2 className={styles.sectionTitle}>Найкращі аромати</h2>
            </div>
            <button className={styles.seeAll} onClick={() => navigate('/catalog?sortBy=Rating&isDescending=true')}>
              Переглянути всі →
            </button>
          </div>
          {loading ? (
            <div className={styles.grid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={styles.skeletonBody}>
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '60%' }} />
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '80%', height: '20px' }} />
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : topRated.length > 0 ? (
            <div className={styles.grid}>
              {topRated.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 0.1}s` }} className="fade-up">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Товари з'являться незабаром</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <p className={styles.footerLogo}>✦ Perfume Workshop</p>
              <p className={styles.footerTagline}>Мистецтво аромату для кожного</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <p className={styles.footerColTitle}>Каталог</p>
                <button onClick={() => navigate('/catalog')}>Всі парфуми</button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => navigate(`/catalog?category=${encodeURIComponent(c.name)}`)}>
                    {c.name}
                  </button>
                ))}
              </div>
              <div className={styles.footerCol}>
                <p className={styles.footerColTitle}>Акаунт</p>
                <button onClick={() => navigate('/profile')}>Профіль</button>
                <button onClick={() => navigate('/cart')}>Кошик</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
