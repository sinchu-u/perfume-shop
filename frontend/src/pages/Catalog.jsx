import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import styles from './Catalog.module.css';

const SORT_OPTIONS = [
  { value: '', label: 'За замовчуванням' },
  { value: 'Price_asc', label: 'Ціна: від меншої' },
  { value: 'Price_desc', label: 'Ціна: від більшої' },
  { value: 'Rating_desc', label: 'За рейтингом' },
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 12;

  const getFiltersFromParams = useCallback(() => ({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    scentType: searchParams.get('scentType') || '',
    volumes: searchParams.getAll('volumes').map(Number).filter(Boolean),
    sortBy: searchParams.get('sortBy') || '',
    isDescending: searchParams.get('isDescending') === 'true',
    pageNumber: parseInt(searchParams.get('pageNumber') || '1', 10),
  }), [searchParams]);

  const filters = getFiltersFromParams();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageSize,
        pageNumber: filters.pageNumber,
      };
      if (filters.search) params.search = filters.search;
      if (filters.brand) params.brand = filters.brand;
      if (filters.category) params.category = filters.category;
      if (filters.scentType) params.scentType = filters.scentType;
      if (filters.volumes?.length) {
        params['volumes'] = filters.volumes;
      }
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.isDescending = filters.isDescending;
      }
      const res = await getProducts(params);
      setProducts(res.data.items || []);
      setTotal(res.data.totalItems || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.brand, filters.category, filters.scentType,
      JSON.stringify(filters.volumes), filters.sortBy, filters.isDescending, filters.pageNumber]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (k === 'volumes') {
        next.delete('volumes');
        v.forEach(vol => next.append('volumes', vol));
      } else if (v === '' || v === null || v === undefined || v === false) {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    next.delete('pageNumber');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams({ search: filters.search });
  };

  const handleSort = (e) => {
    const val = e.target.value;
    if (!val) {
      updateFilters({ sortBy: '', isDescending: '' });
    } else {
      const [sortBy, dir] = val.split('_');
      updateFilters({ sortBy, isDescending: dir === 'desc' ? 'true' : '' });
    }
  };

  const currentSort = filters.isDescending
    ? `${filters.sortBy}_desc`
    : filters.sortBy ? `${filters.sortBy}_asc` : '';

  const setPage = (n) => {
    const next = new URLSearchParams(searchParams);
    next.set('pageNumber', n);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const curr = filters.pageNumber;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= curr - 2 && i <= curr + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return (
      <div className={styles.pagination}>
        <button disabled={curr <= 1} onClick={() => setPage(curr - 1)} className={styles.pageBtn}>←</button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className={styles.pageEllipsis}>…</span>
            : <button
                key={p}
                className={`${styles.pageBtn} ${p === curr ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
        )}
        <button disabled={curr >= totalPages} onClick={() => setPage(curr + 1)} className={styles.pageBtn}>→</button>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div>
            <h1 className={styles.pageTitle}>Каталог</h1>
            {filters.search && (
              <p className={styles.searchResult}>
                Результати для: <strong>"{filters.search}"</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.layout}`}>
        <Filters filters={filters} onChange={updateFilters} onReset={resetFilters} />

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.count}>
              {loading ? 'Завантаження...' : `${total} товарів`}
            </p>
            <select
              className={styles.sortSelect}
              value={currentSort}
              onChange={handleSort}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={styles.skeletonBody}>
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '60%' }} />
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '85%', height: '20px' }} />
                    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>🌿</p>
              <h3>Товарів не знайдено</h3>
              <p>Спробуйте змінити фільтри або пошуковий запит</p>
              <button className={styles.emptyReset} onClick={resetFilters}>Скинути фільтри</button>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-up">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
