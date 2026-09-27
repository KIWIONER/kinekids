import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/app/api/products/route";

interface WishlistStore {
  items: Product[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string | number) => boolean;
  clearWishlist: () => void;
  toggleWishlist: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotalItems: () => number;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        set((state) => {
          const exists = state.items.some((item) => String(item.id) === String(product.id));
          if (exists) return state;
          return { items: [...state.items, product] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => String(item.id) !== String(productId)),
        }));
      },

      toggleItem: (product) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => String(item.id) === String(productId));
      },

      clearWishlist: () => set({ items: [] }),

      toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),

      setIsOpen: (isOpen) => set({ isOpen }),

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: "kinekids-wishlist-storage",
    }
  )
);
