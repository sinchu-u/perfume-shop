import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFilters } from '../context/FiltersContext';
import { formatPrice, getImageUrl } from '../utils/formatPrice';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { getBrandName } = useFilters();
  const [adding, setAdding] = useState(false);

  const minVariant = product.variants?.length > 0
    ? product.variants.reduce((min, v) => v.price < min.price ? v : min, product.variants[0])
    : null;

  const inStock = product.variants?.some(v => v.stock > 0);
  const avgRating = product.comments?.length > 0
    ? product.comments.reduce((acc, c) => acc + c.rating, 0) / product.comments.length
    : 0;

  const imageUrl = getImageUrl(product.image);
  const brandName = getBrandName(product.brandId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast('Увійдіть, щоб додати товар до кошика', 'error');
      return;
    }
    if (!minVariant || !inStock) return;
    try {
      setAdding(true);
      await addItem(minVariant.id, 1);
      addToast(`${product.name} додано до кошика`);
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка при додаванні', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
        )}
        {!inStock && (
          <div className={styles.outOfStock}>Немає в наявності</div>
        )}
        <div className={styles.overlay}>
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
            disabled={adding || !inStock}
          >
            {adding ? '...' : inStock ? '+ Кошик' : 'Немає'}
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.brand}>{brandName}</span>
          {avgRating > 0 && (
            <span className={styles.rating}>
              <span className={styles.star}>★</span>
              {avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.footer}>
          {minVariant ? (
            <span className={styles.price}>{formatPrice(minVariant.price)}</span>
          ) : (
            <span className={styles.noPrice}>—</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
