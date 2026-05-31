import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFilters } from '../context/FiltersContext';
import { getProducts } from '../api/products';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/formatPrice';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, loading } = useCart();
  const { user } = useAuth();
  const { getBrandName } = useFilters();
  const navigate = useNavigate();
  // variantId → product
  const [productsMap, setProductsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);

  useEffect(() => {
    const items = cart.items || [];
    if (items.length === 0) return;

    // Fetch all products with large page to build variant→product map
    setFetchingProducts(true);
    getProducts({ pageSize: 200, pageNumber: 1 })
      .then(res => {
        const map = {};
        const all = res.data.items || [];
        all.forEach(product => {
          product.variants?.forEach(v => {
            map[v.id] = product;
          });
        });
        setProductsMap(map);
      })
      .catch(() => {})
      .finally(() => setFetchingProducts(false));
  }, [cart.items?.length]);

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h2>Увійдіть, щоб переглянути кошик</h2>
            <p>Ваш кошик доступний після авторизації</p>
            <button className={styles.shopBtn} onClick={() => navigate('/catalog')}>
              Перейти до каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Кошик</h1>
          {!isEmpty && (
            <span className={styles.itemCount}>
              {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товари' : 'товарів'}
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h2>Кошик порожній</h2>
            <p>Додайте товари з нашого каталогу</p>
            <button className={styles.shopBtn} onClick={() => navigate('/catalog')}>
              Перейти до каталогу
            </button>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Items list */}
            <div className={styles.itemsCol}>
              <div className={styles.itemsHeader}>
                <span>Товар</span>
                <span>Сума</span>
              </div>
              <div className={styles.itemsList}>
                {items.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    productData={productsMap[item.productVariantId] || null}
                    brandName={productsMap[item.productVariantId]
                      ? getBrandName(productsMap[item.productVariantId].brandId)
                      : null}
                  />
                ))}
              </div>

              <button className={styles.continueBtn} onClick={() => navigate('/catalog')}>
                ← Продовжити покупки
              </button>
            </div>

            {/* Order summary */}
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Підсумок</h2>

                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span>Товари ({items.length})</span>
                    <span>{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Доставка</span>
                    <span className={styles.freeShipping}>Безкоштовно</span>
                  </div>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Разом</span>
                  <span className={styles.totalPrice}>{formatPrice(cart.totalPrice)}</span>
                </div>

                <button
                  className={styles.checkoutBtn}
                  onClick={() => navigate('/checkout')}
                >
                  Оформити замовлення
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
