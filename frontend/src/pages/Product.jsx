import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getComments, createComment, updateComment, deleteComment } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, getImageUrl, formatDate } from '../utils/formatPrice';
import { useFilters } from '../context/FiltersContext';
import styles from './Product.module.css';

const StarPicker = ({ value, onChange }) => (
  <div className={styles.starPicker}>
    {[1,2,3,4,5].map(n => (
      <button
        key={n}
        type="button"
        className={`${styles.starBtn} ${n <= value ? styles.starActive : ''}`}
        onClick={() => onChange(n)}
      >★</button>
    ))}
  </div>
);

const StarDisplay = ({ rating }) => (
  <div className={styles.stars}>
    {[1,2,3,4,5].map(n => (
      <span key={n} className={n <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
    ))}
    <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
  </div>
);

const COMMENTS_PER_PAGE = 5;

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const { getBrandName, getCategoryName, getScentName } = useFilters();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sticky, setSticky] = useState(false);
  const heroRef = useRef(null);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit comment state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
        if (res.data.variants?.length > 0) {
          const inStock = res.data.variants.find(v => v.stock > 0);
          setSelectedVariant(inStock || res.data.variants[0]);
        }
      } catch {
        addToast('Товар не знайдено', 'error');
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const fetchComments = async () => {
      setCommentLoading(true);
      try {
        // Filter comments for this product from product.comments
        const all = product.comments || [];
        setCommentTotal(all.length);
        const start = (commentPage - 1) * COMMENTS_PER_PAGE;
        setComments(all.slice(start, start + COMMENTS_PER_PAGE));
      } finally {
        setCommentLoading(false);
      }
    };
    fetchComments();
  }, [product, commentPage]);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setSticky(rect.bottom < 80);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAddToCart = async () => {
    if (!user) { addToast('Увійдіть, щоб додати товар', 'error'); return; }
    if (!selectedVariant) return;
    try {
      setAddingToCart(true);
      await addItem(selectedVariant.id, 1);
      addToast(`${product.name} (${selectedVariant.volumeMl} мл) додано до кошика`);
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Увійдіть, щоб залишити відгук', 'error'); return; }
    try {
      setSubmitting(true);
      await createComment(id, { rating: newRating, text: newText });
      addToast('Відгук додано!');
      setNewText('');
      setNewRating(5);
      // Refresh product
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      addToast('Відгук видалено');
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка', 'error');
    }
  };

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setEditRating(c.rating);
    setEditText(c.text || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRating(5);
    setEditText('');
  };

  const handleSaveEdit = async (commentId) => {
    try {
      setEditSubmitting(true);
      await updateComment(commentId, { rating: editRating, text: editText });
      addToast('Відгук оновлено!');
      handleCancelEdit();
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (err) {
      addToast(err.response?.data?.title || 'Помилка', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.skeletonHero}>
          <div className={`skeleton ${styles.skeletonImg}`} />
          <div className={styles.skeletonInfo}>
            {[80, 60, 100, 40, 70].map((w, i) => (
              <div key={i} className={`skeleton ${styles.skeletonLine}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const avgRating = product.comments?.length > 0
    ? product.comments.reduce((a, c) => a + c.rating, 0) / product.comments.length
    : 0;

  const imageUrl = getImageUrl(product.image);
  const inStock = selectedVariant?.stock > 0;
  const commentPages = Math.ceil(commentTotal / COMMENTS_PER_PAGE);

  return (
    <div className={styles.page}>
      {/* HERO SECTION */}
      <div className={styles.container} ref={heroRef}>
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate('/')}>Головна</button>
          <span>›</span>
          <button onClick={() => navigate('/catalog')}>Каталог</button>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div className={styles.hero}>
          {/* Left: Image */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} />
              ) : (
                <div className={styles.imgPlaceholder}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className={styles.info}>
            <div className={styles.metaRow}>
              <span className={styles.metaBrand}>{getBrandName(product.brandId)}</span>
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            {avgRating > 0 && (
              <div className={styles.ratingRow}>
                <StarDisplay rating={avgRating} />
                <span className={styles.reviewCount}>{product.comments?.length}</span>
              </div>
            )}

            <div className={styles.metaTags}>
              <div className={styles.metaTagRow}>
                <span className={styles.metaTagLabel}>стать</span>
                <span className={styles.metaPill}>{getCategoryName(product.categoryId)}</span>
              </div>
              <div className={styles.metaTagRow}>
                <span className={styles.metaTagLabel}>аромат</span>
                <span className={styles.metaPill}>{getScentName(product.scentTypeId)}</span>
              </div>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className={styles.variantsBlock}>
                <p className={styles.variantLabel}>Об'єм</p>
                <div className={styles.variants}>
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      className={`${styles.variantBtn} ${selectedVariant?.id === v.id ? styles.variantActive : ''} ${v.stock === 0 ? styles.variantOut : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.volumeMl} мл
                      {v.stock === 0 && <span className={styles.variantOutBadge}>×</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className={styles.priceBlock}>
              {selectedVariant ? (
                <span className={styles.price}>{formatPrice(selectedVariant.price)}</span>
              ) : (
                <span className={styles.noVariants}>Немає ціни</span>
              )}
            </div>

            <button
              className={styles.addBtn}
              onClick={handleAddToCart}
              disabled={addingToCart || !inStock || !selectedVariant}
            >
              {addingToCart ? 'Додається...' : !inStock ? 'Немає в наявності' : 'Додати до кошика'}
            </button>

            {selectedVariant && (
              <span className={`${styles.stockBadge} ${inStock ? styles.inStock : styles.outOfStock}`}>
                {inStock ? 'В наявності' : 'Немає в наявності'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* STICKY SECTION (description + comments LEFT, mini-card RIGHT) */}
      <div className={`${styles.container} ${styles.body}`}>
        <div className={styles.bodyLeft}>
          {/* Description */}
          <section className={styles.descSection}>
            <h2 className={styles.secTitle}>Опис</h2>
            <p className={styles.description}>{product.description || 'Опис відсутній.'}</p>
          </section>

          <div className={styles.divider} />

          {/* Comments */}
          <section className={styles.commentsSection}>
            <h2 className={styles.secTitle}>
              Відгуки
              {product.comments?.length > 0 && (
                <span className={styles.commentCount}>{product.comments.length}</span>
              )}
            </h2>

            {/* Write review */}
            {user ? (
              <form onSubmit={handleSubmitComment} className={styles.reviewForm}>
                <h3 className={styles.reviewFormTitle}>Написати відгук</h3>
                <StarPicker value={newRating} onChange={setNewRating} />
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="Ваші враження..."
                  className={styles.reviewTextarea}
                  maxLength={300}
                  rows={3}
                />
                <div className={styles.reviewFormFooter}>
                  <span className={styles.charCount}>{newText.length}/300</span>
                  <button type="submit" className={styles.reviewSubmitBtn} disabled={submitting}>
                    {submitting ? 'Публікація...' : 'Опублікувати'}
                  </button>
                </div>
              </form>
            ) : (
              <p className={styles.loginPrompt}>
                <button onClick={() => {}} className={styles.loginLink}>Увійдіть</button>, щоб залишити відгук
              </p>
            )}

            {/* List */}
            {commentLoading ? (
              <div className="spinner" />
            ) : comments.length === 0 ? (
              <div className={styles.noComments}>
                <p>Відгуків ще немає.</p>
              </div>
            ) : (
              <div className={styles.commentList}>
                {comments.map(c => {
                  const isOwner = user != null && String(c.userId) === String(user.id);
                  return (
                  <div key={c.id} className={styles.commentItem}>
                    {editingId === c.id ? (
                      // --- Edit mode ---
                      <div className={styles.editForm}>
                        <StarPicker value={editRating} onChange={setEditRating} />
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className={styles.reviewTextarea}
                          maxLength={300}
                          rows={3}
                        />
                        <div className={styles.reviewFormFooter}>
                          <span className={styles.charCount}>{editText.length}/300</span>
                          <div className={styles.editActions}>
                            <button
                              type="button"
                              className={styles.cancelEditBtn}
                              onClick={handleCancelEdit}
                              disabled={editSubmitting}
                            >Скасувати</button>
                            <button
                              type="button"
                              className={styles.reviewSubmitBtn}
                              onClick={() => handleSaveEdit(c.id)}
                              disabled={editSubmitting}
                            >{editSubmitting ? 'Збереження...' : 'Зберегти'}</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // --- View mode ---
                      <>
                        <div className={styles.commentHeader}>
                          <div className={styles.commentAvatar}>
                            {c.userId?.[0]?.toUpperCase() || 'А'}
                          </div>
                          <div className={styles.commentMeta}>
                            <div className={styles.commentStars}>
                              {[1,2,3,4,5].map(n => (
                                <span key={n} className={n <= c.rating ? styles.starFilled : styles.starEmpty}>★</span>
                              ))}
                            </div>
                            <span className={styles.commentDate}>{formatDate(c.createdAt)}</span>
                          </div>
                          {user && (isOwner || isAdmin()) && (
                            <div className={styles.commentActions}>
                              <button
                                className={styles.editComment}
                                onClick={() => handleStartEdit(c)}
                                title="Редагувати"
                              >✎</button>
                              <button
                                className={styles.deleteComment}
                                onClick={() => handleDeleteComment(c.id)}
                                title="Видалити"
                              >✕</button>
                            </div>
                          )}
                        </div>
                        {c.text && <p className={styles.commentText}>{c.text}</p>}
                      </>
                    )}
                  </div>
                  );
                })}
              </div>
            )}

            {/* Comment pagination */}
            {commentPages > 1 && (
              <div className={styles.commentPagination}>
                {Array.from({ length: commentPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`${styles.commentPageBtn} ${p === commentPage ? styles.commentPageActive : ''}`}
                    onClick={() => setCommentPage(p)}
                  >{p}</button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Sticky mini-card */}
        <div className={styles.bodyRight}>
          <div className={styles.miniCard}>
            <div className={styles.miniImg}>
              {imageUrl
                ? <img src={imageUrl} alt={product.name} />
                : <div className={styles.miniImgPlaceholder} />
              }
            </div>
            <div className={styles.miniInfo}>
              <p className={styles.miniName}>{product.name}</p>
              {avgRating > 0 && (
                <div className={styles.miniRating}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={n <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}>★</span>
                  ))}
                  <span className={styles.miniRatingNum}>{avgRating.toFixed(1)}</span>
                </div>
              )}
              {selectedVariant && (
                <p className={styles.miniVariant}>{selectedVariant.volumeMl} мл</p>
              )}
              {selectedVariant && (
                <p className={styles.miniPrice}>{formatPrice(selectedVariant.price)}</p>
              )}
              <button
                className={styles.miniAddBtn}
                onClick={handleAddToCart}
                disabled={addingToCart || !inStock || !selectedVariant}
              >
                {addingToCart ? '...' : 'Додати до кошика'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
