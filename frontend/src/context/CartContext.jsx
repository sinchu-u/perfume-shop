import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addCartItem, updateCartItem, deleteCartItem } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalPrice: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch {
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productVariantId, quantity = 1) => {
    const res = await addCartItem({ productVariantId, quantity });
    setCart(res.data);
    return res.data;
  };

  const updateItem = async (itemId, quantity) => {
    const res = await updateCartItem(itemId, { quantity });
    const updated = res.data;

    // Merge server response while preserving local item order
    setCart(prev => {
      const serverMap = Object.fromEntries(
        (updated.items || []).map(i => [i.id, i])
      );
      const mergedItems = prev.items.map(i => serverMap[i.id] ?? i);
      return { ...updated, items: mergedItems };
    });

    return updated;
  };

  const removeItem = async (itemId) => {
    const res = await deleteCartItem(itemId);
    const updated = res.data;

    // Remove the item in-place without reordering the rest
    setCart(prev => {
      const remaining = prev.items.filter(i => i.id !== itemId);
      const serverMap = Object.fromEntries(
        (updated.items || []).map(i => [i.id, i])
      );
      const mergedItems = remaining
        .filter(i => serverMap[i.id])
        .map(i => serverMap[i.id]);
      return { ...updated, items: mergedItems };
    });

    return updated;
  };

  const clearCart = () => {
    setCart({ items: [], totalPrice: 0 });
  };

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{
      cart, loading, fetchCart,
      addItem, updateItem, removeItem, clearCart,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
