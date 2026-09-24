"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/useCart";

export default function CartDrawer() {
  const router = useRouter();
  const isOpen = useCart((state) => state.isOpen);
  const setIsOpen = useCart((state) => state.setIsOpen);
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const totalPrice = useCart((state) => state.getTotalPrice());

  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Desactivar scroll global
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-brand-charcoal"
          />

          {/* Sliding Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-brand-sand-light border-l border-brand-sand-dark shadow-2xl flex flex-col h-full"
          >
            {/* Header Drawer */}
            <div className="h-20 px-6 border-b border-brand-sand-dark flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-brand-clay stroke-[1.5]" />
                <h2 className="text-lg font-bold tracking-wide text-brand-charcoal">
                  Tu Cesta de Juego
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-brand-sand-dark text-brand-charcoal/70 hover:text-brand-charcoal transition-all"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-brand-sand-dark rounded-full text-brand-charcoal/30">
                    <ShoppingBag className="w-10 h-10 stroke-[1]" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-charcoal">La cesta está vacía</p>
                    <p className="text-xs text-brand-charcoal/50 max-w-[200px] mt-1">
                      Añade herramientas pedagógicas para activar el juego autónomo.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest font-bold text-brand-clay hover:text-brand-brand-clay-dark pt-2"
                  >
                    Seguir Explorando
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-4 pb-6 border-b border-brand-sand-dark/50"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-2xl bg-brand-sand-dark overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-brand-charcoal line-clamp-1">
                        {item.product.title}
                      </h4>
                      <p className="text-xs text-brand-charcoal/50 mb-3">
                        {item.product.price.toFixed(2)}€ / unidad
                      </p>

                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-brand-sand-dark bg-brand-sand-light rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-brand-sand-dark text-brand-charcoal transition-all"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                          <span className="px-3 text-xs font-bold text-brand-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-brand-sand-dark text-brand-charcoal transition-all"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 rounded-xl text-brand-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-all"
                          aria-label="Eliminar producto de la cesta"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total Price */}
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-sm font-bold text-brand-charcoal">
                        {(item.product.price * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Checkout Panel */}
            {items.length > 0 && (
              <div className="p-6 bg-brand-sand-dark border-t border-brand-sand-dark/50 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-charcoal/60">Subtotal de la cesta</span>
                  <span className="text-lg font-bold text-brand-charcoal">
                    {totalPrice.toFixed(2)}€
                  </span>
                </div>
                
                <div className="text-[10px] text-brand-charcoal/50 leading-relaxed text-center pb-2">
                  Envío gratuito en toda la península. Cumplimiento dropshipping directo.
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light rounded-2xl uppercase tracking-widest font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Proceder al Checkout</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
