import { useState, useEffect } from 'react';
import { getBrands, getCategories, getScentTypes, getVolumes } from '../api/products';
import styles from './Filters.module.css';

const Filters = ({ filters, onChange, onReset }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scentTypes, setScentTypes] = useState([]);
  const [volumes, setVolumes] = useState([]);

  useEffect(() => {
    getBrands().then(r => setBrands(r.data)).catch(() => {});
    getCategories().then(r => setCategories(r.data)).catch(() => {});
    getScentTypes().then(r => setScentTypes(r.data)).catch(() => {});
    getVolumes().then(r => setVolumes(r.data)).catch(() => {});
  }, []);

  const handleVolumeToggle = (vol) => {
    const current = filters.volumes || [];
    const updated = current.includes(vol)
      ? current.filter(v => v !== vol)
      : [...current, vol];
    onChange({ volumes: updated });
  };

  const hasActiveFilters = filters.brand || filters.category || filters.scentType
    || (filters.volumes?.length > 0);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Фільтри</h3>
        {hasActiveFilters && (
          <button className={styles.resetAll} onClick={onReset}>
            Скинути всі
          </button>
        )}
      </div>

      {/* Brand */}
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <span className={styles.groupTitle}>Бренд</span>
          {filters.brand && (
            <button className={styles.clearGroup} onClick={() => onChange({ brand: '' })}>✕</button>
          )}
        </div>
        <div className={styles.list}>
          {brands.map(b => (
            <label key={b.id} className={styles.checkLabel}>
              <input
                type="radio"
                name="brand"
                checked={filters.brand === b.name}
                onChange={() => onChange({ brand: filters.brand === b.name ? '' : b.name })}
              />
              <span>{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <span className={styles.groupTitle}>Стать</span>
          {filters.category && (
            <button className={styles.clearGroup} onClick={() => onChange({ category: '' })}>✕</button>
          )}
        </div>
        <div className={styles.list}>
          {categories.map(c => (
            <label key={c.id} className={styles.checkLabel}>
              <input
                type="radio"
                name="category"
                checked={filters.category === c.name}
                onChange={() => onChange({ category: filters.category === c.name ? '' : c.name })}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Scent Type */}
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <span className={styles.groupTitle}>Тип аромату</span>
          {filters.scentType && (
            <button className={styles.clearGroup} onClick={() => onChange({ scentType: '' })}>✕</button>
          )}
        </div>
        <div className={styles.list}>
          {scentTypes.map(s => (
            <label key={s.id} className={styles.checkLabel}>
              <input
                type="radio"
                name="scentType"
                checked={filters.scentType === s.name}
                onChange={() => onChange({ scentType: filters.scentType === s.name ? '' : s.name })}
              />
              <span>{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Volumes */}
      {volumes.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupHeader}>
            <span className={styles.groupTitle}>Об'єм (мл)</span>
            {filters.volumes?.length > 0 && (
              <button className={styles.clearGroup} onClick={() => onChange({ volumes: [] })}>✕</button>
            )}
          </div>
          <div className={styles.volGrid}>
            {volumes.map(v => (
              <button
                key={v}
                className={`${styles.volBtn} ${filters.volumes?.includes(v) ? styles.volActive : ''}`}
                onClick={() => handleVolumeToggle(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Filters;
