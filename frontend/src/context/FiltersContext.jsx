import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBrands, getCategories, getScentTypes } from '../api/products';

const FiltersContext = createContext(null);

export const FiltersProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scentTypes, setScentTypes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      getBrands().then(r => r.data).catch(() => []),
      getCategories().then(r => r.data).catch(() => []),
      getScentTypes().then(r => r.data).catch(() => []),
    ]).then(([b, c, s]) => {
      setBrands(b);
      setCategories(c);
      setScentTypes(s);
      setLoaded(true);
    });
  }, []);

  const getBrandName  = useCallback((id) => brands.find(b => b.id === id)?.name  || `#${id}`, [brands]);
  const getCategoryName = useCallback((id) => categories.find(c => c.id === id)?.name || `#${id}`, [categories]);
  const getScentName  = useCallback((id) => scentTypes.find(s => s.id === id)?.name  || `#${id}`, [scentTypes]);

  return (
    <FiltersContext.Provider value={{ brands, categories, scentTypes, loaded, getBrandName, getCategoryName, getScentName }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
};
