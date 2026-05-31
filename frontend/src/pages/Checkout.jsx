import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../api/orders';
import { getProducts } from '../api/products';
import { formatPrice } from '../utils/formatPrice';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // variantId → product
  const [productsMap, setProductsMap] = useState({});

  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const items = cart.items || [];

  useEffect(() => {
    if (items.length === 0) return;
    getProducts({ pageSize: 200, pageNumber: 1 })
      .then(res => {
        const map = {};
        (res.data.items || []).forEach(p => {
          p.variants?.forEach(v => { map[v.id] = p; });
        });
        setProductsMap(map);
      })
      .catch(() => {});
  }, [items.length]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { addToast('Кошик порожній', 'error'); return; }
    try {
      setLoading(true);
      const fullAddress = [form.city, form.address, form.postalCode].filter(Boolean).join(', ');
      await createOrder({
        name: form.firstName,
        surname: form.lastName,
        patronimic: form.middleName,
        phoneNumber: form.phone,
        email: form.email,
        address: fullAddress,
      });
      clearCart();
      setSuccess(true);
      addToast('Замовлення успішно оформлено!');
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка оформлення', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.center}>
            <h2>Потрібна авторизація</h2>
            <button className={styles.btn} onClick={() => navigate('/')}>На головну</button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Дякуємо за замовлення!</h2>
            <p className={styles.successText}>
              Ваше замовлення прийнято. Ми зв'яжемося з вами найближчим часом для підтвердження.
            </p>
            <div className={styles.successBtns}>
              <button className={styles.btn} onClick={() => navigate('/profile')}>Мої замовлення</button>
              <button className={styles.btnOutline} onClick={() => navigate('/catalog')}>Продовжити покупки</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Оформлення замовлення</h1>

        <div className={styles.layout}>
          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.step}>1</span>
                Особисті дані
              </h2>
              <div className={styles.grid3}>
                <div className={styles.field}>
                  <label>Прізвище *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Прізвище" required />
                </div>
                <div className={styles.field}>
                  <label>Ім'я *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ім'я" required />
                </div>
                <div className={styles.field}>
                  <label>По батькові</label>
                  <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="По батькові" />
                </div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Телефон *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+380 XX XXX XX XX" required type="tel" />
                </div>
                <div className={styles.field}>
                  <label>Email *</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" required type="email" />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.step}>2</span>
                Адреса доставки
              </h2>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Населений пункт *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Населений пункт" required />
                </div>
                <div className={styles.field}>
                  <label>Поштовий індекс</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Поштовий індекс" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Адреса *</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Адреса" required />
              </div>
            </section>

            <button type="submit" className={styles.submitBtn} disabled={loading || items.length === 0}>
              {loading ? 'Оформлюємо...' : 'Підтвердити замовлення'}
            </button>
          </form>

          {/* Order review */}
          <div className={styles.review}>
            <div className={styles.reviewCard}>
              <h2 className={styles.reviewTitle}>Ваше замовлення</h2>

              <div className={styles.reviewItems}>
                {items.length === 0 ? (
                  <p className={styles.emptyCart}>Кошик порожній</p>
                ) : (
                  items.map(item => {
                    const product = productsMap[item.productVariantId];
                    const variant = product?.variants?.find(v => v.id === item.productVariantId);
                    const label = product
                      ? `${product.name}${variant ? ` · ${variant.volumeMl} мл` : ''}`
                      : `Товар #${item.productVariantId}`;
                    return (
                      <div key={item.id} className={styles.reviewItem}>
                        <div className={styles.reviewItemLeft}>
                          <div className={styles.reviewQty}>{item.quantity}×</div>
                          <div>
                            <p className={styles.reviewItemName}>{label}</p>
                            <p className={styles.reviewItemPrice}>{formatPrice(item.price / item.quantity)} / шт</p>
                          </div>
                        </div>
                        <span className={styles.reviewItemTotal}>{formatPrice(item.price)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={styles.reviewDivider} />

              <div className={styles.reviewTotal}>
                <span>Разом</span>
                <span className={styles.reviewTotalPrice}>{formatPrice(cart.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
