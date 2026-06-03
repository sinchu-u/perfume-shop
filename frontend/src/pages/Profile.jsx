import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/orders';
import { getProducts } from '../api/products';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../utils/formatPrice';
import styles from './Profile.module.css';

const TABS = ['Особисті дані', 'Історія замовлень'];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [productsMap, setProductsMap] = useState({});

  useEffect(() => {
    if (!user) { navigate('/'); return; }
  }, [user]);

  useEffect(() => {
    if (tab === 1 && user) {
      setOrdersLoading(true);
      getUserOrders()
        .then(r => {
          const fetchedOrders = r.data || [];
          setOrders(fetchedOrders);
          return getProducts({ pageSize: 200, pageNumber: 1 });
        })
        .then(res => {
          const map = {};
          (res.data.items || []).forEach(p => {
            p.variants?.forEach(v => { map[v.id] = p; });
          });
          setProductsMap(map);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, user]);

  if (!user) return null;

  const toggleOrder = (id) => setExpanded(prev => prev === id ? null : id);

  // Баг 3: Перша літера імені користувача для аватарки
  const avatarLetter = user.userName?.[0]?.toUpperCase() || 'U';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Profile header */}
        <div className={styles.profileHeader}>
          {/* Баг 3: Аватарка показує першу літеру імені замість SVG */}
          <div className={styles.avatar}>
            <span className={styles.avatarLetter}>{avatarLetter}</span>
          </div>
          <div>
            <h1 className={styles.name}>{user.userName}</h1>
            <p className={styles.email}>{user.email}</p>
          </div>
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Вийти
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
              {i === 1 && orders.length > 0 && (
                <span className={styles.tabBadge}>{orders.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Personal info */}
        {tab === 0 && (
          <div className={styles.personalTab}>
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>Інформація акаунту</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <p className={styles.infoLabel}>Ім'я користувача</p>
                  <p className={styles.infoValue}>{user.userName}</p>
                </div>
                <div className={styles.infoField}>
                  <p className={styles.infoLabel}>Email</p>
                  <p className={styles.infoValue}>{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {tab === 1 && (
          <div className={styles.ordersTab}>
            {ordersLoading ? (
              <div className="spinner" />
            ) : orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <div className={styles.emptyOrdersIcon}>📦</div>
                <h3>Замовлень ще немає</h3>
                <p>Зробіть ваше перше замовлення!</p>
                <button className={styles.catalogBtn} onClick={() => navigate('/catalog')}>
                  Перейти до каталогу
                </button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div
                      className={styles.orderHeader}
                      onClick={() => toggleOrder(order.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.orderHeaderLeft}>
                        <span className={styles.orderId}>Замовлення #{order.id}</span>
                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className={styles.orderHeaderRight}>
                        <span
                          className={styles.orderStatus}
                          style={{
                            background: `${getOrderStatusColor(order.status)}18`,
                            color: getOrderStatusColor(order.status),
                          }}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                        <span className={styles.orderTotal}>{formatPrice(order.totalPrice)}</span>
                        <svg
                          className={`${styles.orderChevron} ${expanded === order.id ? styles.chevronOpen : ''}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {expanded === order.id && (
                      <div className={styles.orderBody}>
                        <div className={styles.orderItems}>
                          {order.items?.map(item => {
                            const product = productsMap[item.productVariantId];
                            const variant = product?.variants?.find(v => v.id === item.productVariantId);
                            const label = product
                              ? `${product.name}${variant ? ` · ${variant.volumeMl} мл` : ''}`
                              : `Товар #${item.productVariantId}`;
                            return (
                              <div key={item.id} className={styles.orderItem}>
                                <div className={styles.orderItemInfo}>
                                  <span className={styles.orderItemQty}>{item.quantity}×</span>
                                  <span className={styles.orderItemName}>{label}</span>
                                </div>
                                <span className={styles.orderItemPrice}>{formatPrice(item.price)}</span>
                              </div>
                            );
                          })}
                        </div>

                        {(order.name || order.surname || order.phoneNumber || order.email || order.address) && (
                          <div className={styles.contactInfo}>
                            <p className={styles.contactLabel}>Контактні дані</p>
                            <div className={styles.contactGrid}>
                              {(order.surname || order.name || order.patronimic) && (
                                <div className={styles.contactRow}>
                                  <svg className={styles.contactIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                  <span>{[order.surname, order.name, order.patronimic].filter(Boolean).join(' ')}</span>
                                </div>
                              )}
                              {order.phoneNumber && (
                                <div className={styles.contactRow}>
                                  <svg className={styles.contactIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.08 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.18-1.18a2 2 0 012.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0122 16.92z"/></svg>
                                  <span>{order.phoneNumber}</span>
                                </div>
                              )}
                              {order.email && (
                                <div className={styles.contactRow}>
                                  <svg className={styles.contactIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                  <span>{order.email}</span>
                                </div>
                              )}
                              {order.address && (
                                <div className={styles.contactRow}>
                                  <svg className={styles.contactIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                                  <span>{order.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className={styles.orderFooter}>
                          <div className={styles.orderTotalRow}>
                            <span>Загальна сума:</span>
                            <span className={styles.orderTotalValue}>{formatPrice(order.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
