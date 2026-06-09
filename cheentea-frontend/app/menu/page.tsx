"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Plus,
  Utensils,
  ShoppingBasket,
  Loader2,
  X,
  Search,
  ChevronRight,
  Mic,
  AudioLines,
} from "lucide-react";
import { ProductCustomizationModal } from "@/components/product-customization-modal";
import { VoiceOrderModal } from "@/components/voice-order-modal";
import { useCart } from "@/context/cart-context";
import { getProducts, getCategories, getModifierGroups } from "@/lib/api";
import { Product, Category, ModifierGroup } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { sitePath } from "@/lib/site-path";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Fallback descriptions if API returns null
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Best Seller Series": "Our most loved drinks, curated just for you.",
  "Milk Tea Series": "Classic and creamy milk teas brewed to perfection.",
  "Smoothie Series": "Ice-blended fruit smoothies for a refreshing treat.",
  "Fruit Tea Series": "Freshly brewed tea infused with real fruit flavors.",
  "Latte Series": "Smooth and milky latte creations.",
  "Fruit Soda Series": "Sparkling and fizzy fruit sodas to cool you down.",
  "Coffee Series": "Rich and aromatic coffee blends for your daily fix.",
  Food: "Delicious snacks and meals to pair with your drink.",
};

export default function CheenteaMenu() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<number | "All">(
    "All",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // API data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart context
  const { orderType, setOrderType, totalItems, subtotal } = useCart();

  // Refs for scrolling
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Redirect to welcome page if no order type is selected
  useEffect(() => {
    if (!orderType) {
      router.push("/");
    }
  }, [orderType, router]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productsData, categoriesData, modifiersData] = await Promise.all(
          [
            getProducts(true), // Include inactive products to show as "unavailable"
            getCategories(),
            getModifierGroups(),
          ],
        );
        // Show all products - inactive ones will be displayed as unavailable
        setProducts(productsData);
        setCategories(categoriesData);
        setModifierGroups(modifiersData);

        // Initialize "All" category if needed or ensure categories exist
        // if (categoriesData.length > 0 && selectedCategory === "All") {
        //   setSelectedCategory(categoriesData[0].id)
        // }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openCustomizationModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const getDefaultPrice = (product: Product): number => {
    if (product.sizes && product.sizes.length > 0) {
      const sorted = [...product.sizes].sort(
        (a, b) => Number(a.price) - Number(b.price),
      );
      return Number(sorted[0].price) || 0;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm h-20">
        <div className="w-full h-full px-8 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
              <Image
                src={sitePath("/chantea-logo.jpg")}
                alt="Chantea Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-espresso leading-none">
                Chantea
              </h1>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-12">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-matcha transition-colors" />
              <input
                type="text"
                placeholder="Search for drinks or snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-matcha focus:ring-4 focus:ring-matcha/10 transition-all font-medium text-espresso placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Order Type Toggle */}
          {orderType && (
            <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setOrderType("dine-in")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  orderType === "dine-in"
                    ? "bg-espresso text-white shadow-md"
                    : "text-espresso-light hover:text-espresso"
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Dine In</span>
              </button>
              <button
                onClick={() => setOrderType("take-out")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  orderType === "take-out"
                    ? "bg-espresso text-white shadow-md"
                    : "text-espresso-light hover:text-espresso"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Take Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-100 overflow-y-auto hidden md:block shadow-lg z-20">
          <div className="p-5 pt-6">
            <div className="flex items-center gap-2 mb-5 px-2">
              <div className="w-2 h-2 rounded-full bg-matcha animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-espresso-light">
                Categories
              </span>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group text-left ${
                  selectedCategory === "All"
                    ? "bg-matcha text-white shadow-md"
                    : "hover:bg-matcha/5 text-espresso bg-white border border-gray-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${selectedCategory === "All" ? "bg-white/20" : "bg-matcha/10"}`}
                >
                  ✨
                </div>
                <span className="font-serif font-bold">All Items</span>
              </button>

              {categories.map((category) => {
                const itemCount = products.filter(
                  (p) => p.category_id === category.id,
                ).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      // Scroll to top of main content area when switching categories
                      document
                        .querySelector("main")
                        ?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group text-left ${
                      selectedCategory === category.id
                        ? "bg-matcha text-white shadow-md"
                        : "hover:bg-matcha/5 text-espresso bg-white border border-gray-100"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform group-hover:rotate-3 ${selectedCategory === category.id ? "bg-white/20" : "bg-matcha/10"}`}
                    >
                      🍵
                    </div>
                    <div className="flex-1">
                      <span className="block font-serif font-bold text-sm leading-tight">
                        {category.name}
                      </span>
                      <span
                        className={`text-xs ${selectedCategory === category.id ? "text-white/70" : "text-matcha"}`}
                      >
                        {itemCount} items
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-[#FAF9F6]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-espresso/50">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-matcha" />
              <p className="font-serif text-xl">Brewing your menu...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto pb-32 space-y-16">
              {/* Voice Order Banner - prominent CTA above menu */}
              {selectedCategory === "All" && !searchQuery && (
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-espresso via-espresso to-[#4E342E] shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 border border-white/10"
                >
                  {/* Subtle dot pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #fff 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />
                  {/* Matcha accent glow */}
                  <div className="absolute -right-10 -top-10 w-56 h-56 bg-matcha/20 rounded-full blur-3xl" />
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-matcha/10 rounded-full blur-3xl" />

                  <div className="relative flex items-center gap-8 p-8 md:p-10">
                    {/* Mic icon with pulse ring */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-full bg-matcha/30 animate-ping"
                        style={{ animationDuration: "2s" }}
                      />
                      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-matcha rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-matcha/30">
                        <Mic className="w-9 h-9 md:w-11 md:h-11 text-white" />
                      </div>
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left">
                      <h2 className="font-serif font-black text-3xl md:text-4xl text-white mb-1 leading-tight">
                        Order by Voice
                      </h2>
                      <p className="text-white/70 text-base md:text-lg font-medium">
                        Just say what you'd like to order
                      </p>
                    </div>

                    {/* Decorative sound bars */}
                    <div className="hidden md:flex items-end gap-1.5 h-12 mr-2">
                      {[0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9].map((h, i) => (
                        <div
                          key={i}
                          className="w-2 bg-matcha/60 rounded-full group-hover:bg-matcha transition-colors"
                          style={{
                            height: `${h * 100}%`,
                            animation:
                              "voiceBars 1.2s ease-in-out infinite alternate",
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-matcha/30 transition-colors">
                      <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </button>
              )}

              {/* Discover our Menu Section - hide when searching */}
              {selectedCategory === "All" && !searchQuery && (
                <div className="mb-12">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-serif font-black text-4xl text-espresso">
                        Discover our Menu
                      </h2>
                      <p className="text-espresso-light mt-2">
                        Tap a category to explore
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-matcha font-bold">
                      <span className="w-2 h-2 bg-matcha rounded-full animate-pulse"></span>
                      {categories.length} categories
                    </div>
                  </div>

                  {/* Category Grid - 2 rows layout */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {categories.slice(0, 8).map((category, index) => {
                      const categoryProducts = products.filter(
                        (p) => p.category_id === category.id,
                      );
                      const firstProduct = categoryProducts[0];
                      const itemCount = categoryProducts.length;

                      // Category icons based on name
                      const getCategoryEmoji = (name: string) => {
                        const n = name.toLowerCase();
                        if (n.includes("milk tea") || n.includes("tea"))
                          return "🧋";
                        if (n.includes("coffee") || n.includes("latte"))
                          return "☕";
                        if (n.includes("smoothie")) return "🥤";
                        if (n.includes("fruit")) return "🍓";
                        if (n.includes("food") || n.includes("snack"))
                          return "🍿";
                        if (n.includes("best") || n.includes("seller"))
                          return "⭐";
                        return "🍵";
                      };

                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            document
                              .querySelector("main")
                              ?.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="group relative bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100/50 hover:shadow-2xl hover:-translate-y-2 hover:border-matcha/30 transition-all duration-300 text-left"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Category Image */}
                          <div className="aspect-[5/4] bg-gradient-to-br from-matcha/5 via-cream to-matcha/10 relative overflow-hidden">
                            {firstProduct?.image_url ? (
                              <img
                                src={firstProduct.image_url}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-7xl opacity-50 group-hover:scale-125 transition-transform duration-500">
                                  {getCategoryEmoji(category.name)}
                                </span>
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                            {/* Item count badge */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                              <span className="text-xs font-bold text-espresso">
                                {itemCount} items
                              </span>
                            </div>
                          </div>

                          {/* Category Info */}
                          <div className="p-5 bg-white">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {getCategoryEmoji(category.name)}
                              </span>
                              <h3 className="font-serif font-bold text-lg text-espresso group-hover:text-matcha transition-colors line-clamp-1">
                                {category.name}
                              </h3>
                            </div>
                            {category.description && (
                              <p className="text-xs text-espresso-light mt-2 line-clamp-1">
                                {category.description}
                              </p>
                            )}
                          </div>

                          {/* Hover indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-matcha scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {categories.map((category) => {
                // Filter logic if needed, but we show all sections usually
                if (
                  selectedCategory !== "All" &&
                  selectedCategory !== category.id
                )
                  return null;

                // Also filter individual items by search
                const isCategoryMatch = category.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
                const categoryItems = products.filter(
                  (item) =>
                    item.category_id === category.id &&
                    (isCategoryMatch ||
                      item.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      item.description
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())),
                );

                if (categoryItems.length === 0) return null;

                return (
                  <section
                    key={category.id}
                    id={category.id.toString()}
                    className="scroll-mt-32 animate-in fade-in slide-in-from-bottom-8 duration-500"
                  >
                    {/* Category Header Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100/50 mb-8">
                      <div className="flex items-end gap-4 mb-2">
                        <h3 className="text-3xl font-serif font-bold text-espresso">
                          {category.name}
                        </h3>
                        <span className="bg-matcha/10 text-matcha px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {categoryItems.length} Selections
                        </span>
                      </div>
                      <p className="text-espresso-light text-sm max-w-2xl leading-relaxed">
                        {category.description ||
                          CATEGORY_DESCRIPTIONS[category.name] ||
                          "Delicious selections made fresh daily."}
                      </p>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {/* Show first 3 items if in "All" view and no search is active, otherwise show all */}
                      {(selectedCategory === "All" && !searchQuery
                        ? categoryItems.slice(0, 3)
                        : categoryItems
                      ).map((item) => {
                        const isUnavailable = item.is_active === false;

                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              !isUnavailable && openCustomizationModal(item)
                            }
                            className={`group bg-white rounded-[2rem] p-5 shadow-sm transition-all duration-300 border relative flex flex-col h-full overflow-hidden ${
                              isUnavailable
                                ? "opacity-60 cursor-not-allowed border-gray-200"
                                : "hover:shadow-xl border-transparent hover:border-matcha/10 hover:-translate-y-1 cursor-pointer"
                            }`}
                          >
                            {/* Unavailable Overlay */}
                            {isUnavailable && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                                <div className="bg-gray-800/90 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-lg flex items-center gap-2">
                                  <span className="text-xl">😔</span>
                                  <span>Unavailable</span>
                                </div>
                              </div>
                            )}

                            {/* Image with Price */}
                            <div
                              className={`relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] mb-6 overflow-hidden flex items-center justify-center ${!isUnavailable && "group-hover:shadow-inner"} transition-shadow`}
                            >
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className={`w-full h-full object-cover transform transition-transform duration-500 ${!isUnavailable && "group-hover:scale-110"} ${isUnavailable && "grayscale"}`}
                                />
                              ) : (
                                <div
                                  className={`text-7xl transform transition-transform duration-500 ${!isUnavailable && "group-hover:scale-110 group-hover:rotate-3"} drop-shadow-md ${isUnavailable && "grayscale"}`}
                                >
                                  {category.name.includes("Coffee")
                                    ? "☕"
                                    : category.name.includes("Fruit")
                                      ? "🍹"
                                      : "🧋"}
                                </div>
                              )}
                              <div
                                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg transition-colors ${
                                  isUnavailable
                                    ? "bg-gray-400 text-white"
                                    : "bg-espresso text-white group-hover:bg-matcha"
                                }`}
                              >
                                {formatPrice(getDefaultPrice(item))}
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                              <h4
                                className={`font-serif font-bold text-xl mb-2 leading-tight transition-colors ${
                                  isUnavailable
                                    ? "text-gray-400"
                                    : "text-espresso group-hover:text-matcha"
                                }`}
                              >
                                {item.name}
                              </h4>
                              <p
                                className={`text-sm mb-6 line-clamp-2 flex-grow ${isUnavailable ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {item.description}
                              </p>

                              <button
                                disabled={isUnavailable}
                                className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${
                                  isUnavailable
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-matcha hover:bg-matcha-dark text-white shadow-md hover:shadow-lg active:scale-95"
                                }`}
                              >
                                {isUnavailable ? (
                                  <>Currently Unavailable</>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    Add to Order
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* View More Button - Only in All View and if there are more items AND no search query */}
                    {selectedCategory === "All" &&
                      !searchQuery &&
                      categoryItems.length > 3 && (
                        <div className="flex justify-center mt-10">
                          <button
                            onClick={() => {
                              setSelectedCategory(category.id);
                              document
                                .getElementById(category.id.toString())
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-matcha/50 hover:text-matcha transition-all group"
                          >
                            <span className="font-serif font-bold text-espresso group-hover:text-matcha">
                              View all {category.name}
                            </span>
                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-matcha/10 group-hover:text-matcha transition-colors">
                              {categoryItems.length - 3} more
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-matcha transition-colors" />
                          </button>
                        </div>
                      )}
                  </section>
                );
              })}

              {categories.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-400">
                  No menu items found.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Cart Button */}
      {orderType && totalItems > 0 && (
        <Link href="/cart">
          <button className="fixed bottom-10 right-10 pl-7 pr-9 py-5 bg-matcha text-white rounded-[2.5rem] shadow-2xl hover:shadow-[0_25px_60px_-12px_rgba(142,198,65,0.6)] hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 z-50 group border-4 border-white/20 flex items-center gap-5 overflow-hidden">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 border border-white/10">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-matcha text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-matcha">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <span className="text-lg font-bold font-serif leading-none block mb-0.5">
                View Cart
              </span>
              <span className="text-sm font-medium opacity-90 tracking-wide">
                {formatPrice(subtotal)}
              </span>
            </div>
          </button>
        </Link>
      )}

      {/* Floating Voice Order Button */}
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-10 left-10 z-50 flex items-center gap-4 pl-5 pr-7 py-4 bg-espresso text-white rounded-[2.5rem] shadow-2xl hover:shadow-[0_25px_60px_-12px_rgba(59,47,47,0.5)] hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-white/20 group"
        title="Voice Order"
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-matcha/40 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <div className="relative w-14 h-14 bg-matcha rounded-full flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300">
            <Mic className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="text-left">
          <span className="text-base font-bold font-serif leading-none block mb-0.5">
            Voice Order
          </span>
          <span className="text-xs font-medium opacity-70">Tap to speak</span>
        </div>
      </button>

      <ProductCustomizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        modifierGroups={modifierGroups}
        onAddSuccess={() => {
          // Reset menu to default state after adding to cart
          setSelectedCategory("All");
          setSearchQuery("");
        }}
      />

      <VoiceOrderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products}
      />
    </div>
  );
}
