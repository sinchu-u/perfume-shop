import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, getImageUrl } from '../utils/formatPrice';
import styles from './CartItem.module.css';

const CartItem = ({ item, productData, brandName }) => {
  const { updateItem, removeItem } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1) return;
    try {
      setLoading(true);
      await updateItem(item.id, newQty);
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка оновлення', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await removeItem(item.id);
      addToast('Товар видалено з кошика');
    } catch {
      addToast('Помилка при видаленні', 'error');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = productData ? getImageUrl(productData.image) : null;
  const variant = productData?.variants?.find(v => v.id === item.productVariantId);
  const productName = productData?.name || null;

  return (
    <div className={`${styles.item} ${loading ? styles.loading : ''}`}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={productName || 'Товар'} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.top}>
          <div>
            {brandName && <p className={styles.brand}>{brandName}</p>}
            <h4 className={styles.name}>
              {productName || <span className={styles.loadingName}>Завантаження...</span>}
            </h4>
            {variant && (
              <p className={styles.variant}>{variant.volumeMl} мл</p>
            )}
          </div>
          <button className={styles.removeBtn} onClick={handleRemove} aria-label="Видалити">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>

        <div className={styles.bottom}>
          <div className={styles.qty}>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || loading}
            >−</button>
            <span className={styles.qtyNum}>{item.quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(item.quantity + 1)}
              disabled={loading}
            >+</button>
          </div>
          <span className={styles.price}>{formatPrice(item.price)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
