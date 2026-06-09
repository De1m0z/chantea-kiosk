"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Gift,
  Sparkles,
  ChefHat,
  Bell,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { sitePath } from "@/lib/site-path";

import { useRouter, useSearchParams } from "next/navigation";

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <OrderConfirmation />
    </Suspense>
  );
}

function OrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, serviceFee, total, orderType, clearCart } =
    useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string>("#001");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(60); // Extended to 60 seconds for real-time tracking
  const [savedOrderType, setSavedOrderType] = useState<string | null>(null);
  const [estimatedWait, setEstimatedWait] = useState<number>(5); // Default 5 mins
  const [orderReady, setOrderReady] = useState(false);

  // Real-time order tracking
  const { status, isReady, isPreparing, connected } = useOrderTracking(
    orderId,
    {
      onReady: useCallback(() => {
        setOrderReady(true);
        // Play notification sound
        try {
          const audio = new Audio(sitePath("/notification.mp3"));
          audio.play().catch(() => {});
        } catch {}
      }, []),
    },
  );

  // Loyalty info from URL - now uses pending stamps
  const [stampsPending, setStampsPending] = useState<number | null>(null);
  const [currentStamps, setCurrentStamps] = useState<number | null>(null);

  useEffect(() => {
    // Save the order type before clearing
    if (orderType) {
      setSavedOrderType(orderType);
    }

    // Get order ID from URL query parameter
    const orderIdParam = searchParams.get("order");
    if (orderIdParam) {
      const id = parseInt(orderIdParam);
      setOrderId(id);
      // Format as #XXX (3 digits padded)
      const orderNum = `#${String(id).padStart(3, "0")}`;
      setOrderNumber(orderNum);
    }

    // Get loyalty info from URL - using new pending stamps format
    const pending = searchParams.get("stamps_pending");
    const current = searchParams.get("current");
    if (pending) setStampsPending(parseInt(pending));
    if (current) setCurrentStamps(parseInt(current));

    // Calculate estimated wait time based on item count
    const itemCount = searchParams.get("items");
    if (itemCount) {
      // Base time: 3 mins + 1 min per item, max 15 mins
      const waitTime = Math.min(3 + parseInt(itemCount), 15);
      setEstimatedWait(waitTime);
    }

    // Clear cart after saving order type
    const timer = setTimeout(() => {
      clearCart();
    }, 1000);

    return () => clearTimeout(timer);
  }, [orderType, clearCart, searchParams]);

  // Countdown timer for Kiosk Reset
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation effect
  useEffect(() => {
    if (countdown === 0) {
      router.push("/");
    }
  }, [countdown, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 py-12">
        {/* Success Animation */}
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          {/* Animated Checkmark */}
          <div className="relative">
            <div
              className={`w-28 h-28 md:w-40 md:h-40 bg-matcha rounded-full flex items-center justify-center shadow-premium transform transition-all duration-700 ease-in-out ${
                pulse ? "scale-100 shadow-2xl" : "scale-105 shadow-xl"
              }`}
            >
              <Check className="w-12 h-12 md:w-20 md:h-20 text-white stroke-[3]" />
            </div>
            {/* Confetti effect rings */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 animate-ping opacity-20 duration-1000">
                <div className="w-28 h-28 md:w-40 md:h-40 bg-coral rounded-full"></div>
              </div>
              <div className="absolute inset-0 animate-pulse opacity-10 duration-[3000ms]">
                <div className="w-40 h-40 md:w-56 md:h-56 -m-6 md:-m-8 bg-matcha rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-espresso tracking-tight">
              {isReady ? "🎉 Order Ready!" : "Order Placed!"}
            </h1>
            <p className="text-lg md:text-xl text-espresso-light font-sans max-w-md mx-auto leading-relaxed">
              {isReady
                ? "Your order is ready for pickup!"
                : "Your drinks are being brewed with love."}
              <br />
              <span className="text-sm font-bold opacity-60 mt-2 block">
                Screen will reset in {countdown}s
              </span>
            </p>
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center justify-center gap-2">
            {["pending", "preparing", "ready"].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
                    status === s
                      ? s === "ready"
                        ? "bg-matcha text-white scale-110 shadow-lg"
                        : "bg-coral text-white scale-105 shadow-md"
                      : status === "pending" && s !== "pending"
                        ? "bg-gray-200 text-gray-400"
                        : status === "preparing" && s === "ready"
                          ? "bg-gray-200 text-gray-400"
                          : "bg-matcha/20 text-matcha"
                  }`}
                >
                  {s === "pending" && <Clock className="w-4 h-4" />}
                  {s === "preparing" && <ChefHat className="w-4 h-4" />}
                  {s === "ready" && <Bell className="w-4 h-4" />}
                  <span className="text-sm font-bold capitalize">{s}</span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-8 h-1 mx-1 rounded ${
                      (status === "preparing" && idx === 0) ||
                      (status === "ready" && idx <= 1)
                        ? "bg-matcha"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Order Number Badge */}
          <div className="bg-white px-8 py-6 md:px-12 md:py-8 rounded-[2rem] shadow-float border border-cream-dark/30 transform hover:-translate-y-1 transition-transform duration-300">
            <p className="text-xs md:text-sm font-bold text-espresso uppercase tracking-widest mb-2 md:mb-3 opacity-60">
              Order Number
            </p>
            <div className="text-5xl md:text-7xl font-sans font-black text-espresso tracking-tighter">
              {orderNumber}
            </div>
          </div>

          {/* ... Wait Time Section ... */}
          {/* Estimated Wait Time & Order Type */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-cream-dark/50">
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-coral" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-espresso uppercase tracking-widest opacity-60">
                  Estimated Wait
                </p>
                <p className="text-lg font-bold text-espresso">
                  ~{estimatedWait} mins
                </p>
              </div>
            </div>
            {savedOrderType && (
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-cream-dark/50">
                <div className="w-10 h-10 rounded-full bg-matcha/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-matcha" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-espresso uppercase tracking-widest opacity-60">
                    Order Type
                  </p>
                  <p className="text-lg font-bold text-espresso capitalize">
                    {savedOrderType.replace("-", " ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Loyalty Stamps PENDING - Will be awarded when order is completed */}
          {stampsPending !== null && stampsPending > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-gold/10 px-6 py-5 rounded-2xl border border-amber-200/50">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <span className="text-lg font-bold text-espresso">
                  {stampsPending} stamp{stampsPending > 1 ? "s" : ""} pending
                </span>
              </div>
              <p className="text-center text-sm text-amber-700 font-medium">
                ✨ You'll earn your stamps when your order is ready!
              </p>

              {currentStamps !== null && (
                <div className="space-y-2 mt-4">
                  {/* Stamp Progress Visualization */}
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          i < currentStamps % 10
                            ? "bg-matcha text-white"
                            : "bg-cream-dark/30 text-espresso-light"
                        }`}
                      >
                        ☕
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-espresso-light">
                    {currentStamps % 10}/10 stamps
                    {currentStamps >= 10 && (
                      <span className="ml-2 text-gold-dark font-bold">
                        🎉 {Math.floor(currentStamps / 10)} free drink
                        {Math.floor(currentStamps / 10) > 1 ? "s" : ""}{" "}
                        available!
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <Link
            href="/"
            className="block transform hover:scale-[1.02] transition-transform"
          >
            <Button className="w-full h-20 text-2xl font-bold bg-matcha text-white hover:bg-matcha/90 border-2 border-transparent hover:border-matcha/20 rounded-[2rem] shadow-premium">
              Start New Order
            </Button>
          </Link>
        </div>

        {/* Thank You Message */}
        <p className="text-center text-espresso-light text-sm font-medium tracking-wide uppercase opacity-60">
          Thank you for choosing Chantea
        </p>
      </div>
    </div>
  );
}
