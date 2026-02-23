import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, SelectedOption } from '@/types';

// ────────────────────────────────────────────
// State & actions
// ────────────────────────────────────────────
interface CartState {
  items: CartItem[];
}

interface CartActions {
  addItem: (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOption[],
    note: string,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36);

const calcItemPrice = (
  product: Product,
  selectedOptions: SelectedOption[],
): number => {
  const optionsExtra = selectedOptions.reduce(
    (sum, opt) => sum + opt.price_adjustment,
    0,
  );
  return product.price + optionsExtra;
};

// ────────────────────────────────────────────
// Store
// ────────────────────────────────────────────
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // ---------- state ----------
      items: [],

      // ---------- actions ----------
      addItem: (product, quantity, selectedOptions, note) => {
        const item_price = calcItemPrice(product, selectedOptions);
        const total_price = item_price * quantity;

        const newItem: CartItem = {
          id: generateId(),
          product,
          quantity,
          selected_options: selectedOptions,
          note,
          item_price,
          total_price,
        };

        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity,
                  total_price: item.item_price * quantity,
                }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.total_price, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    },
  ),
);
