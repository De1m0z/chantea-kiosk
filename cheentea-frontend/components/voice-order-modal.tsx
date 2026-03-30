"use client";

import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useVoiceOrder } from "@/hooks/useVoiceOrder";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { Product, ProductSize, Modifier } from "@/lib/types";
import { VoiceOrderItem } from "@/lib/api";
import {
  Mic,
  MicOff,
  Loader2,
  Check,
  X,
  ShoppingCart,
  RotateCcw,
  AlertCircle,
  AudioLines,
} from "lucide-react";

interface VoiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function VoiceOrderModal({
  isOpen,
  onClose,
  products,
}: VoiceOrderModalProps) {
  const {
    state,
    transcript,
    interimTranscript,
    result,
    error,
    isSupported,
    startListening,
    stopListening,
    submitTranscript,
    reset,
  } = useVoiceOrder();

  const { addItem } = useCart();

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Find full product data for a voice order item
  const findProduct = useCallback(
    (
      item: VoiceOrderItem,
    ): {
      product: Product;
      size: ProductSize;
      modifiers: Modifier[];
    } | null => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) return null;

      const size = product.sizes.find((s) => s.id === item.product_size_id);
      if (!size) return null;

      const modifiers: Modifier[] = [];
      for (const modId of item.modifier_ids) {
        for (const group of product.modifier_groups || []) {
          const mod = group.modifiers.find((m) => m.id === modId);
          if (mod) {
            modifiers.push(mod);
            break;
          }
        }
      }

      return { product, size, modifiers };
    },
    [products],
  );

  const addAllToCart = useCallback(() => {
    if (!result) return;

    for (const item of result.items) {
      const found = findProduct(item);
      if (!found) continue;

      const { product, size, modifiers } = found;

      let sugarModifier: Modifier | undefined;
      let iceModifier: Modifier | undefined;
      const toppings: Modifier[] = [];

      for (const mod of modifiers) {
        const group = product.modifier_groups?.find((g) =>
          g.modifiers.some((m) => m.id === mod.id),
        );
        if (!group) continue;

        const groupNameLower = group.name.toLowerCase();
        if (groupNameLower.includes("sugar")) {
          sugarModifier = mod;
        } else if (
          groupNameLower === "ice level" ||
          groupNameLower === "ice_level" ||
          groupNameLower === "ice"
        ) {
          iceModifier = mod;
        } else if (groupNameLower.includes("topping")) {
          toppings.push(mod);
        }
      }

      let sugarLevel = 100;
      if (sugarModifier) {
        const name = sugarModifier.name.toLowerCase();
        if (name.includes("0") || name.includes("no ") || name.includes("zero"))
          sugarLevel = 0;
        else if (name.includes("25")) sugarLevel = 25;
        else if (name.includes("50") || name.includes("half")) sugarLevel = 50;
        else if (name.includes("75")) sugarLevel = 75;
        else sugarLevel = 100;
      }

      let iceLevel = "Regular";
      if (iceModifier) {
        const name = iceModifier.name.toLowerCase();
        if (name.includes("no ")) iceLevel = "No Ice";
        else if (name.includes("less")) iceLevel = "Less";
        else if (name.includes("extra")) iceLevel = "Extra";
        else iceLevel = "Regular";
      }

      const modifierTotal = modifiers.reduce(
        (sum, m) => sum + Number(m.price_adjustment || 0),
        0,
      );
      const unitPrice = Number(size.price) + modifierTotal;

      addItem({
        product,
        customization: {
          size,
          sugarLevel,
          iceLevel,
          toppings,
          sugarModifier,
          iceModifier,
        },
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      });
    }

    onClose();
  }, [result, findProduct, addItem, onClose]);

  const handleStopAndSubmit = useCallback(() => {
    stopListening();
    setTimeout(() => {
      submitTranscript();
    }, 300);
  }, [stopListening, submitTranscript]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border-0 rounded-[2.5rem] shadow-2xl p-0">
        <DialogTitle className="sr-only">Voice Order</DialogTitle>
        <DialogDescription className="sr-only">
          Order by speaking into your microphone
        </DialogDescription>
        {/* Header */}
        <div className="bg-espresso rounded-t-[2.5rem] px-8 pt-8 pb-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-matcha/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-1">
              <AudioLines className="w-6 h-6 text-matcha" />
              <h2 className="text-2xl font-serif font-black text-white">
                Voice Order
              </h2>
            </div>
            <p className="text-white/60 text-sm font-medium">
              Tell us what you'd like
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 p-8">
          {!isSupported && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 w-full">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                Speech recognition is not supported in this browser. Please use
                Chrome or Edge.
              </p>
            </div>
          )}

          {/* Idle state */}
          {state === "idle" && isSupported && (
            <>
              <p className="text-center text-espresso-light text-sm px-4 leading-relaxed">
                Tap the microphone and tell us what you'd like to order. For
                example:{" "}
                <span className="font-semibold text-espresso">
                  "Two taro milk teas, medium, with less sugar and boba"
                </span>
              </p>
              <button
                onClick={startListening}
                className="relative w-28 h-28 rounded-full bg-matcha text-white flex items-center justify-center hover:bg-matcha/90 transition-all hover:scale-105 active:scale-95 shadow-xl group"
              >
                <div
                  className="absolute inset-0 rounded-full bg-matcha/20 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <Mic className="w-12 h-12 relative z-10" />
              </button>
              <p className="text-sm text-espresso-light font-medium">
                Tap to start speaking
              </p>
            </>
          )}

          {/* Listening state */}
          {state === "listening" && (
            <>
              {/* Animated waveform bars */}
              <div className="flex items-center justify-center gap-1.5 h-20 w-full">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-matcha rounded-full"
                    style={{
                      animation:
                        "voiceWave 0.8s ease-in-out infinite alternate",
                      animationDelay: `${i * 0.05}s`,
                      height: "12px",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleStopAndSubmit}
                className="relative w-28 h-28 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all active:scale-95 shadow-xl"
              >
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <MicOff className="w-12 h-12 relative z-10" />
              </button>
              <p className="text-sm font-bold text-red-500 animate-pulse">
                Listening... Tap to finish
              </p>

              {/* Live transcript */}
              <div className="w-full bg-white rounded-2xl p-5 min-h-[60px] shadow-sm border border-gray-100">
                <p className="text-sm text-espresso leading-relaxed">
                  {transcript && (
                    <span className="font-medium">{transcript} </span>
                  )}
                  {interimTranscript && (
                    <span className="text-espresso-light italic">
                      {interimTranscript}
                    </span>
                  )}
                  {!transcript && !interimTranscript && (
                    <span className="text-espresso-light italic">
                      Say your order...
                    </span>
                  )}
                </p>
              </div>
            </>
          )}

          {/* Processing state */}
          {state === "processing" && (
            <>
              {/* Pulsing loader */}
              <div className="w-28 h-28 rounded-full bg-matcha/10 flex items-center justify-center border-2 border-matcha/20">
                <Loader2 className="w-12 h-12 animate-spin text-matcha" />
              </div>
              <p className="text-sm text-espresso-light font-medium">
                Understanding your order...
              </p>
              {transcript && (
                <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="text-sm text-espresso-light italic">
                    "{transcript}"
                  </p>
                </div>
              )}
            </>
          )}

          {/* Error state */}
          {state === "error" && (
            <>
              <div className="w-28 h-28 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-200">
                <X className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center px-4 font-medium">
                {error}
              </p>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-espresso font-bold text-sm hover:border-matcha/50 hover:text-matcha transition-all shadow-sm min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </>
          )}

          {/* Done state - show results */}
          {state === "done" && result && (
            <>
              {/* AI message */}
              <div className="w-full bg-matcha/5 border border-matcha/20 rounded-2xl p-5">
                <p className="text-sm font-semibold text-espresso">
                  {result.message}
                </p>
              </div>

              {/* Items found */}
              {result.items.length > 0 && (
                <div className="w-full space-y-3">
                  <h3 className="text-xs font-bold text-espresso-light uppercase tracking-widest px-1">
                    Items Found
                  </h3>
                  {result.items.map((item, idx) => {
                    const found = findProduct(item);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                      >
                        {/* Product image */}
                        <div className="w-16 h-16 rounded-xl bg-matcha/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {found?.product.image_url ? (
                            <img
                              src={found.product.image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AudioLines className="w-7 h-7 text-matcha/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif font-bold text-espresso text-sm leading-tight">
                            {item.quantity}x {item.product_name}
                          </p>
                          <p className="text-xs text-espresso-light mt-0.5 truncate">
                            {item.size_name}
                            {item.modifier_names.length > 0 && (
                              <> &middot; {item.modifier_names.join(", ")}</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="w-5 h-5 bg-matcha/10 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-matcha" />
                          </div>
                          <span className="text-sm font-bold text-espresso">
                            {formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Not found items */}
              {result.not_found.length > 0 && (
                <div className="w-full space-y-2">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest px-1">
                    Not Found
                  </h3>
                  {result.not_found.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-3 border border-red-100"
                    >
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-700">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* Action buttons */}
              <div className="w-full flex gap-3 pt-2">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white border border-gray-200 text-espresso font-bold text-sm hover:border-matcha/50 hover:text-matcha transition-all shadow-sm min-h-[48px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                {result.items.length > 0 && (
                  <button
                    onClick={addAllToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-matcha text-white font-bold text-sm hover:bg-matcha/90 transition-all shadow-lg min-h-[48px]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                )}
              </div>
            </>
          )}

          {/* Done state but only error, no result */}
          {state === "done" && !result && error && (
            <>
              <div className="w-28 h-28 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-200">
                <X className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center px-4 font-medium">
                {error}
              </p>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-espresso font-bold text-sm hover:border-matcha/50 hover:text-matcha transition-all shadow-sm min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
