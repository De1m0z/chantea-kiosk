"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Mic } from "lucide-react";
import { Utensils, ShoppingBasket, QrCode } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { VoiceOrderModal } from "@/components/voice-order-modal";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { sitePath } from "@/lib/site-path";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const { setOrderType, orderType, totalItems } = useCart();
  const [view, setView] = useState<"HOME" | "ORDER_TYPE">("HOME");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // If order type is already set and has items, redirect to menu
  useEffect(() => {
    if (orderType && totalItems > 0) {
      router.push("/menu");
    }
  }, [orderType, totalItems, router]);

  // Fetch products for voice ordering (lazy - only when modal opens)
  useEffect(() => {
    if (isVoiceModalOpen && products.length === 0) {
      getProducts(false)
        .then(setProducts)
        .catch(() => {});
    }
  }, [isVoiceModalOpen, products.length]);

  const handleSelect = (type: "dine-in" | "take-out") => {
    setOrderType(type);
    router.push("/menu");
  };

  const handleVoiceOrder = () => {
    if (!orderType) setOrderType("dine-in");
    setIsVoiceModalOpen(true);
  };

  const handleStartOrder = () => setView("ORDER_TYPE");
  const handleBack = () => setView("HOME");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFCF5] via-[#FDFBF7] to-[#F1F8E6] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decorations - Playful & Vibrant */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] bg-[#8EC641]/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-[#5D4037]/5 rounded-full blur-[80px]"></div>
        {/* Floating Dots Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#5D4037 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full h-full flex flex-col justify-center">
        {/* HOME VIEW: SPLIT LAYOUT */}
        {view === "HOME" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
            {/* LEFT COLUMN: Welcome & Start Order */}
            <div className="flex flex-col items-center text-center space-y-2 justify-center">
              {/* Branding */}
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Title */}
                <div className="flex flex-col items-center">
                  {/* Chantea Logo */}
                  <img
                    src={sitePath("/chantea-logo.png")}
                    alt="Chantea"
                    className="h-72 md:h-96 lg:h-[500px] w-auto animate-in zoom-in-95 duration-1000"
                  />
                  <p className="text-xl md:text-2xl text-espresso-light font-medium max-w-md -mt-18 md:-mt-22 lg:-mt-34 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    Brewing happiness in every cup.
                  </p>
                </div>
              </div>

              {/* Start Order Button (Vibrant & Playful) */}
              <button
                onClick={handleStartOrder}
                className="group relative w-full max-w-sm h-32 md:h-36 rounded-[2.5rem] overflow-hidden shadow-xl shadow-matcha/20 transition-all duration-300 hover:shadow-2xl hover:shadow-matcha/30 hover:-translate-y-1 active:scale-95"
              >
                <div className="absolute inset-0 bg-matcha transition-all duration-300 group-hover:bg-matcha/90"></div>
                {/* Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                ></div>

                <div className="relative h-full flex flex-row items-center justify-between p-8 text-white">
                  <div className="flex flex-col items-start justify-center flex-1">
                    <h2 className="text-4xl font-black mb-1 text-white tracking-wide">
                      Order Now
                    </h2>
                    <p className="text-white/90 text-sm font-bold tracking-wider opacity-90 uppercase">
                      Click to Start
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform duration-300">
                    <Utensils className="w-8 h-8 text-matcha fill-current" />
                  </div>
                </div>
              </button>

              {/* Voice Order Button */}
              <button
                onClick={handleVoiceOrder}
                className="group relative w-full max-w-sm h-24 md:h-28 rounded-[2rem] overflow-hidden shadow-lg shadow-espresso/10 transition-all duration-300 hover:shadow-xl hover:shadow-espresso/20 hover:-translate-y-1 active:scale-95"
              >
                <div className="absolute inset-0 bg-espresso transition-all duration-300 group-hover:bg-espresso/90"></div>
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                ></div>
                {/* Matcha accent glow */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-matcha/20 rounded-full blur-2xl" />

                <div className="relative h-full flex flex-row items-center justify-between px-8 text-white">
                  <div className="flex flex-col items-start justify-center flex-1">
                    <h2 className="text-2xl md:text-3xl font-black mb-0.5 text-white tracking-wide">
                      Order by Voice
                    </h2>
                    <p className="text-white/80 text-xs font-bold tracking-wider opacity-90 uppercase">
                      Just say what you want
                    </p>
                  </div>
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full bg-matcha/30 animate-ping"
                      style={{ animationDuration: "2s" }}
                    />
                    <div className="relative w-14 h-14 bg-matcha rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                      <Mic className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* RIGHT COLUMN: Loyalty Program (Updated Card Style) */}
            <div className="flex flex-col items-center justify-center w-full h-full scale-100 lg:scale-105 transition-transform duration-500">
              <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-gray-200 border-4 border-white p-10 md:p-14 flex flex-col items-center text-center transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:border-matcha/20 cursor-pointer">
                {/* Stamp Collection Visual */}
                <div className="w-full mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-3xl">🎁</span>
                    <h4 className="text-2xl font-serif font-bold text-matcha">
                      Buy 10, Get 1 FREE!
                    </h4>
                  </div>
                  {/* Visual Stamp Progress */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-sm font-bold transition-all ${i < 2 ? "bg-matcha border-matcha text-white" : "border-gray-300 text-gray-300"}`}
                      >
                        {i < 2 ? "✓" : i + 1}
                      </div>
                    ))}
                    <span className="mx-2 text-matcha font-bold">=</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-matcha to-matcha-dark flex items-center justify-center text-white text-lg shadow-lg">
                      🧋
                    </div>
                  </div>
                  <p className="text-xs text-espresso-light">
                    Collect stamps with every drink purchase!
                  </p>
                </div>

                <div className="w-64 h-64 bg-[#FFFCF5] rounded-[2rem] p-4 shadow-inner mb-6 border-2 border-dashed border-matcha/30 flex items-center justify-center relative group">
                  {/* Actual QR Code Image */}
                  <img
                    src={sitePath("/register-qr.png")}
                    alt="Register for Loyalty"
                    className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Corner Accents */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-matcha rounded-tl-lg"></div>
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-matcha rounded-tr-lg"></div>
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-matcha rounded-bl-lg"></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-matcha rounded-br-lg"></div>
                </div>

                <h3 className="text-3xl lg:text-4xl font-serif font-black text-espresso mb-3 leading-none">
                  Join Our <span className="text-matcha">Rewards!</span>
                </h3>
                <p className="text-espresso-light mb-6 text-lg font-medium leading-relaxed max-w-sm">
                  Scan to start collecting stamps and earn{" "}
                  <span className="font-bold text-matcha">FREE drinks</span>!
                </p>

                <div className="flex items-center gap-3 text-sm text-matcha font-bold uppercase tracking-[0.1em] bg-matcha-light px-6 py-3 rounded-full">
                  <QrCode className="w-5 h-5" />
                  <span>Scan to Register</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ORDER_TYPE (Dine In vs Take Out) - Stays Centered/Fullscreen */}
        {view === "ORDER_TYPE" && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <p className="text-4xl md:text-5xl text-espresso font-serif font-black">
                Where are you eating?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-in slide-in-from-right-8 fade-in duration-500">
              {/* Dine In - LIME THEME */}
              <button
                onClick={() => handleSelect("dine-in")}
                className="group relative h-80 md:h-96 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-matcha/30 w-full"
              >
                <div className="absolute inset-0 bg-matcha transition-transform duration-500 group-hover:scale-105"></div>
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                ></div>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                  <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-lg transform group-hover:scale-110 transition-transform duration-300 border-4 border-white/20">
                    <Utensils className="w-12 h-12 md:w-16 md:h-16 text-matcha fill-current" />
                  </div>
                  <h2 className="text-5xl md:text-6xl font-serif font-black mb-2 md:mb-3 tracking-wide drop-shadow-sm text-white">
                    Dine In
                  </h2>
                  <p className="text-white/90 text-xl font-bold tracking-wider opacity-90">
                    Enjoy here
                  </p>
                </div>
              </button>

              {/* Take Out - BROWN THEME */}
              <button
                onClick={() => handleSelect("take-out")}
                className="group relative h-80 md:h-96 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-espresso/30 w-full"
              >
                <div className="absolute inset-0 bg-espresso transition-transform duration-500 group-hover:scale-105"></div>
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                ></div>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                  <div className="w-28 h-28 md:w-36 md:h-36 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-lg transform group-hover:scale-110 transition-transform duration-300 border-4 border-white/10">
                    <ShoppingBasket className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  <h2 className="text-5xl md:text-6xl font-serif font-black mb-2 md:mb-3 tracking-wide drop-shadow-sm text-white">
                    Take Out
                  </h2>
                  <p className="text-white/90 text-xl font-bold tracking-wider opacity-90">
                    To go
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-16 text-center animate-in fade-in duration-700">
              <button
                onClick={handleBack}
                className="px-10 py-4 rounded-full bg-white hover:bg-white text-espresso font-bold transition-all hover:shadow-lg border-2 border-espresso/10 text-sm tracking-[0.1em] uppercase group"
              >
                <span className="group-hover:-translate-x-1 inline-block transition-transform duration-300">
                  ←
                </span>{" "}
                Back
              </button>
            </div>
          </div>
        )}

        {/* Footer Removed */}
      </div>

      <VoiceOrderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products}
      />
    </div>
  );
}
