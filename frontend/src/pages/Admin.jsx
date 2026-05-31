import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFilters } from '../context/FiltersContext';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  createVariant, updateVariant, deleteVariant,
  getBrands, createBrand, updateBrand, deleteBrand,
  getCategories, createCategory, updateCategory, deleteCategory,
  getScentTypes, createScentType, updateScentType, deleteScentType,
} from '../api/products';
import { getAllOrders, updateOrderStatus } from '../api/orders';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../utils/formatPrice';
import styles from './Admin.module.css';

const TABS = ['Товари', 'Категорії', 'Замовлення'];
const ORDER_STATUSES = [
  { value: 0, label: 'Очікує оплати' },
  { value: 1, label: 'Оплачено' },
  { value: 2, label: 'Пакується' },
  { value: 3, label: 'Відправлено' },
  { value: 4, label: 'Доставлено' },
];

// ─── Simple modal ───────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
);

// ─── Entity CRUD (Brands / Categories / ScentTypes) ─────
const EntityManager = ({ title, items, onCreate, onUpdate, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    await onCreate(newName.trim());
    setNewName('');
    setLoading(false);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setLoading(true);
    await onUpdate(id, editName.trim());
    setEditId(null);
    setLoading(false);
  };

  return (
    <div className={styles.entityManager}>
      <h3 className={styles.entityTitle}>{title}</h3>
      <div className={styles.createRow}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={`Нова ${title.toLowerCase()}...`}
          className={styles.entityInput}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button className={styles.createBtn} onClick={handleCreate} disabled={loading || !newName.trim()}>
          + Додати
        </button>
      </div>
      <div className={styles.entityList}>
        {items.length === 0 && <p className={styles.entityEmpty}>Порожньо</p>}
        {items.map(item => (
          <div key={item.id} className={styles.entityItem}>
            {editId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={styles.entityInput}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleUpdate(item.id)}
                />
                <button className={styles.saveBtn} onClick={() => handleUpdate(item.id)}>✓</button>
                <button className={styles.cancelBtn} onClick={() => setEditId(null)}>✕</button>
              </>
            ) : (
              <>
                <span className={styles.entityName}>{item.name}</span>
                <div className={styles.entityActions}>
                  <button className={styles.editIconBtn} onClick={() => { setEditId(item.id); setEditName(item.name); }}>✎</button>
                  <button className={styles.deleteIconBtn} onClick={() => onDelete(item.id)}>🗑</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { getBrandName } = useFilters();
  // variantId → product (for orders tab)
  const [ordersProductsMap, setOrdersProductsMap] = useState({});
  const [tab, setTab] = useState(0);

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [productModal, setProductModal] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', brandId: '', categoryId: '', scentTypeId: '', image: null });
  const [variants, setVariants] = useState([{ volumeMl: '', stock: '', price: '' }]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const imgRef = useRef();

  // Filters
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scentTypes, setScentTypes] = useState([]);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return; }
    loadFilters();
  }, []);

  useEffect(() => {
    if (tab === 0) loadProducts();
    if (tab === 2) loadOrders();
  }, [tab, productPage, orderPage]);

  const loadFilters = async () => {
    const [b, c, s] = await Promise.all([
      getBrands().then(r => r.data).catch(() => []),
      getCategories().then(r => r.data).catch(() => []),
      getScentTypes().then(r => r.data).catch(() => []),
    ]);
    setBrands(b); setCategories(c); setScentTypes(s);
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await getProducts({ pageNumber: productPage, pageSize: 10, search: productSearch || undefined });
      setProducts(res.data.items || []);
      setProductTotal(res.data.totalItems || 0);
    } finally { setProductsLoading(false); }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getAllOrders({ pageNumber: orderPage, pageSize: 10 });
      setOrders(res.data.items || []);
      setOrderTotalPages(res.data.totalPages || 1);
    } finally { setOrdersLoading(false); }
    getProducts({ pageSize: 200, pageNumber: 1 })
      .then(res => {
        const map = {};
        (res.data.items || []).forEach(p => {
          p.variants?.forEach(v => { map[v.id] = p; });
        });
        setOrdersProductsMap(map);
      })
      .catch(() => {});
  };

  // Products CRUD
  const openCreate = () => {
    setProductForm({ name: '', description: '', brandId: brands[0]?.id || '', categoryId: categories[0]?.id || '', scentTypeId: scentTypes[0]?.id || '', image: null });
    setVariants([{ volumeMl: '', stock: '', price: '' }]);
    setProductModal('create');
  };

  const openEdit = (p) => {
    setProductForm({ name: p.name, description: p.description, brandId: p.brandId, categoryId: p.categoryId, scentTypeId: p.scentTypeId, image: null });
    setVariants(p.variants?.length ? p.variants.map(v => ({ id: v.id, volumeMl: v.volumeMl, stock: v.stock, price: v.price })) : [{ volumeMl: '', stock: '', price: '' }]);
    setProductModal(p);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const fd = new FormData();
      fd.append('name', productForm.name);
      fd.append('description', productForm.description);
      fd.append('brandId', productForm.brandId);
      fd.append('categoryId', productForm.categoryId);
      fd.append('scentTypeId', productForm.scentTypeId);
      if (productForm.image) fd.append('image', productForm.image);

      let savedProduct;
      if (productModal === 'create') {
        if (!productForm.image) { addToast('Додайте зображення', 'error'); setSavingProduct(false); return; }
        const res = await createProduct(fd);
        savedProduct = res.data;
        addToast('Товар створено!');
      } else {
        if (!productForm.image) {
          fd.delete('image');
          const dummyBlob = new Blob([''], { type: 'image/jpeg' });
          const dummyFile = new File([dummyBlob], 'keep.jpg', { type: 'image/jpeg' });
          fd.append('image', dummyFile);
        }
        const res = await updateProduct(productModal.id, fd);
        savedProduct = res.data;
        addToast('Товар оновлено!');
      }

      // Manage variants
      const productId = savedProduct.id;
      const existingIds = productModal !== 'create' ? (productModal.variants?.map(v => v.id) || []) : [];
      for (const v of variants) {
        if (!v.volumeMl || !v.price) continue;
        const vData = { volumeMl: parseInt(v.volumeMl), stock: parseInt(v.stock) || 0, price: parseFloat(v.price) };
        if (v.id) {
          await updateVariant(productId, v.id, vData).catch(() => {});
        } else {
          await createVariant(productId, vData).catch(() => {});
        }
      }
      // Delete removed variants
      if (productModal !== 'create') {
        const keepIds = variants.filter(v => v.id).map(v => v.id);
        for (const id of existingIds) {
          if (!keepIds.includes(id)) await deleteVariant(id).catch(() => {});
        }
      }

      setProductModal(null);
      loadProducts();
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка збереження', 'error');
    } finally { setSavingProduct(false); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      addToast('Товар видалено');
      setDeleteConfirm(null);
      loadProducts();
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка видалення', 'error');
    }
  };

  // Variant helpers
  const updateVariantField = (i, field, val) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  };
  const addVariantRow = () => setVariants(prev => [...prev, { volumeMl: '', stock: '', price: '' }]);
  const removeVariantRow = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  // Filter CRUD helpers
  const brandHandlers = {
    onCreate: async (name) => { await createBrand({ name }); loadFilters(); addToast('Бренд додано'); },
    onUpdate: async (id, name) => { await updateBrand(id, { name }); loadFilters(); addToast('Оновлено'); },
    onDelete: async (id) => { try { await deleteBrand(id); loadFilters(); addToast('Видалено'); } catch { addToast('Не можна видалити: прив\'язано до товарів', 'error'); } },
  };
  const catHandlers = {
    onCreate: async (name) => { await createCategory({ name }); loadFilters(); addToast('Стать додано'); },
    onUpdate: async (id, name) => { await updateCategory(id, { name }); loadFilters(); addToast('Оновлено'); },
    onDelete: async (id) => { try { await deleteCategory(id); loadFilters(); addToast('Видалено'); } catch { addToast('Не можна видалити: прив\'язано до товарів', 'error'); } },
  };
  const scentHandlers = {
    onCreate: async (name) => { await createScentType({ name }); loadFilters(); addToast('Тип додано'); },
    onUpdate: async (id, name) => { await updateScentType(id, { name }); loadFilters(); addToast('Оновлено'); },
    onDelete: async (id) => { try { await deleteScentType(id); loadFilters(); addToast('Видалено'); } catch { addToast('Не можна видалити: прив\'язано до товарів', 'error'); } },
  };

  // Orders
  const handleStatusChange = async (orderId, status) => {
    setStatusUpdating(orderId);
    try {
      await updateOrderStatus(orderId, { status: parseInt(status) });
      addToast('Статус оновлено');
      loadOrders();
    } catch { addToast('Помилка', 'error'); }
    finally { setStatusUpdating(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Адмін-панель</h1>
            <p className={styles.subtitle}>Управління магазином</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button key={t} className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </div>

        {/* ── TAB: PRODUCTS ── */}
        {tab === 0 && (
          <div className={styles.tabContent}>
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (setProductPage(1), loadProducts())}
                  placeholder="Пошук товарів..."
                  className={styles.searchInput}
                />
              </div>
              <button className={styles.addBtn} onClick={openCreate}>+ Новий товар</button>
            </div>

            <p className={styles.countLabel}>{productTotal} товарів</p>

            {productsLoading ? <div className="spinner" /> : (
              <div className={styles.productTable}>
                <div className={styles.tableHead}>
                  <span>Фото</span><span>Назва</span><span>Бренд</span>
                  <span>Об'єми</span><span>Дії</span>
                </div>
                {products.length === 0 && <p className={styles.emptyTable}>Товарів немає</p>}
                {products.map(p => (
                  <div key={p.id} className={styles.tableRow}>
                    <div className={styles.tableImg}>
                      {p.image ? (
                        <img src={`http://localhost:5246${p.image}`} alt={p.name} />
                      ) : <div className={styles.tableImgPlaceholder} />}
                    </div>
                    <div className={styles.tableInfo}>
                      <p className={styles.tableName}>{p.name}</p>
                      <p className={styles.tableDesc}>{p.description?.substring(0, 60)}{p.description?.length > 60 ? '...' : ''}</p>
                    </div>
                    <span className={styles.tableMeta}>{getBrandName(p.brandId)}</span>
                    <span className={styles.tableMeta}>{p.variants?.length || 0} шт</span>
                    <div className={styles.tableActions}>
                      <button className={styles.editBtn} onClick={() => openEdit(p)}>Редагувати</button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(p)}>Видалити</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {productTotal > 10 && (
              <div className={styles.pagination}>
                <button disabled={productPage <= 1} onClick={() => setProductPage(p => p - 1)} className={styles.pageBtn}>←</button>
                <span className={styles.pageInfo}>стор. {productPage}</span>
                <button disabled={productPage * 10 >= productTotal} onClick={() => setProductPage(p => p + 1)} className={styles.pageBtn}>→</button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FILTERS ── */}
        {tab === 1 && (
          <div className={styles.filtersTab}>
            <EntityManager title="Бренди" items={brands} {...brandHandlers} />
            <EntityManager title="Стать" items={categories} {...catHandlers} />
            <EntityManager title="Типи ароматів" items={scentTypes} {...scentHandlers} />
          </div>
        )}

        {/* ── TAB: ORDERS ── */}
        {tab === 2 && (
          <div className={styles.tabContent}>
            {ordersLoading ? <div className="spinner" /> : (
              <div className={styles.ordersList}>
                {orders.length === 0 && <p className={styles.emptyTable}>Замовлень немає</p>}
                {orders.map(order => (
                  <div key={order.id} className={styles.adminOrderCard}>
                    <div className={styles.adminOrderHeader} onClick={() => setExpandedOrder(prev => prev === order.id ? null : order.id)}>
                      <div className={styles.adminOrderMeta}>
                        <span className={styles.adminOrderId}>#{order.id}</span>
                        <span className={styles.adminOrderDate}>{formatDate(order.createdAt)}</span>
                        <span className={styles.adminOrderTotal}>{formatPrice(order.totalPrice)}</span>
                      </div>
                      <div className={styles.adminOrderRight}>
                        <select
                          className={styles.statusSelect}
                          value={order.status}
                          onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                          onClick={e => e.stopPropagation()}
                          disabled={statusUpdating === order.id}
                          style={{ color: getOrderStatusColor(order.status) }}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <svg className={`${styles.orderChevron} ${expandedOrder === order.id ? styles.chevronOpen : ''}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className={styles.adminOrderBody}>
                        {(order.name || order.surname || order.phoneNumber || order.email || order.address) && (
                          <div className={styles.contactBlock}>
                            <p className={styles.contactLabel}>Контакти покупця</p>
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
                        <div className={styles.orderItemsList}>
                          {order.items?.map(item => (
                            <div key={item.id} className={styles.adminOrderItem}>
                              <span>{item.quantity}× {(() => { const p = ordersProductsMap[item.productVariantId]; const v = p?.variants?.find(v => v.id === item.productVariantId); return p ? `${p.name}${v ? ' · ' + v.volumeMl + ' мл' : ''}` : `Товар #${item.productVariantId}`; })()}</span>
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {orderTotalPages > 1 && (
              <div className={styles.pagination}>
                <button disabled={orderPage <= 1} onClick={() => setOrderPage(p => p - 1)} className={styles.pageBtn}>←</button>
                <span className={styles.pageInfo}>стор. {orderPage} / {orderTotalPages}</span>
                <button disabled={orderPage >= orderTotalPages} onClick={() => setOrderPage(p => p + 1)} className={styles.pageBtn}>→</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Product Modal ─── */}
      {productModal && (
        <Modal
          title={productModal === 'create' ? 'Новий товар' : `Редагувати: ${productModal.name}`}
          onClose={() => setProductModal(null)}
        >
          <form onSubmit={handleSaveProduct} className={styles.productForm}>
            <div className={styles.formGrid2}>
              <div className={styles.formField}>
                <label>Назва *</label>
                <input value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required placeholder="Назва парфуму" />
              </div>
              <div className={styles.formField}>
                <label>Зображення {productModal === 'create' ? '*' : '(залишити порожнім — без змін)'}</label>
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setProductForm(p => ({ ...p, image: e.target.files[0] || null }))}
                  required={productModal === 'create'}
                  className={styles.fileInput}
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label>Опис *</label>
              <textarea
                value={productForm.description}
                onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                required rows={3}
                placeholder="Опис аромату"
                className={styles.formTextarea}
              />
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.formField}>
                <label>Бренд *</label>
                <select value={productForm.brandId} onChange={e => setProductForm(p => ({ ...p, brandId: e.target.value }))} required className={styles.formSelect}>
                  <option value="">Оберіть бренд</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label>Категорія *</label>
                <select value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))} required className={styles.formSelect}>
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label>Тип запаху *</label>
                <select value={productForm.scentTypeId} onChange={e => setProductForm(p => ({ ...p, scentTypeId: e.target.value }))} required className={styles.formSelect}>
                  <option value="">Оберіть тип</option>
                  {scentTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Variants */}
            <div className={styles.variantsSection}>
              <div className={styles.variantsSectionHead}>
                <h3>Наявні формати (об'єм / ціна / наявність)</h3>
                <button type="button" className={styles.addVariantBtn} onClick={addVariantRow}>+ Додати</button>
              </div>
              <div className={styles.variantRows}>
                {variants.map((v, i) => (
                  <div key={i} className={styles.variantRow}>
                    <div className={styles.formField}>
                      <label>Об'єм (мл)</label>
                      <input type="number" min="1" value={v.volumeMl} onChange={e => updateVariantField(i, 'volumeMl', e.target.value)} placeholder="50" />
                    </div>
                    <div className={styles.formField}>
                      <label>Ціна (грн)</label>
                      <input type="number" min="1" step="0.01" value={v.price} onChange={e => updateVariantField(i, 'price', e.target.value)} placeholder="1200" />
                    </div>
                    <div className={styles.formField}>
                      <label>Кількість</label>
                      <input type="number" min="0" value={v.stock} onChange={e => updateVariantField(i, 'stock', e.target.value)} placeholder="10" />
                    </div>
                    {variants.length > 1 && (
                      <button type="button" className={styles.removeVariantBtn} onClick={() => removeVariantRow(i)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelFormBtn} onClick={() => setProductModal(null)}>Скасувати</button>
              <button type="submit" className={styles.saveFormBtn} disabled={savingProduct}>
                {savingProduct ? 'Збереження...' : productModal === 'create' ? 'Створити товар' : 'Зберегти зміни'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Delete Confirm ─── */}
      {deleteConfirm && (
        <Modal title="Підтвердження видалення" onClose={() => setDeleteConfirm(null)}>
          <div className={styles.deleteConfirm}>
            <p>Ви впевнені, що хочете видалити <strong>{deleteConfirm.name}</strong>?</p>
            <p className={styles.deleteWarning}>Ця дія незворотна. Всі об'єми та відгуки також будуть видалені.</p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelFormBtn} onClick={() => setDeleteConfirm(null)}>Скасувати</button>
              <button className={styles.deleteFinalBtn} onClick={() => handleDeleteProduct(deleteConfirm.id)}>
                Так, видалити
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Admin;
