"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Gift, Loader2, CheckCircle, AlertCircle, AtSign, ArrowRight, Sparkles, X, ChevronLeft, Minus, Plus, Droplets, Snowflake, Check } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { lookupCustomerByUsername, getProducts, getModifierGroups } from "@/lib/api"
import { Product, ProductSize, ModifierGroup, Modifier } from "@/lib/types"
import { formatPrice, toNumber } from "@/lib/format"
import { sitePath } from "@/lib/site-path"

interface LoyaltyCustomer {
    username: string
    name: string
    stamps: number
    can_redeem: boolean
}

// Free drink item structure
export interface FreeDrinkSelection {
    product: Product
    size: ProductSize
    sugarLevel: number
    iceLevel: string
    sugarModifier?: Modifier
    iceModifier?: Modifier
    toppings: Modifier[]
    basePrice: number  // Price of drink (size only, will be FREE)
    toppingsPrice: number  // Price of toppings (customer pays this)
}

interface LoyaltyModalProps {
    open: boolean
    onClose: () => void
    onProceed: (username?: string, redeemFreeDrink?: boolean, freeDrinkSelection?: FreeDrinkSelection) => void
    stampsToEarn: number
}

// Categories eligible for free drink (excludes Latte and Fruit Soda)
const ELIGIBLE_CATEGORIES = [
    'Milk Tea',
    'Milk Tea Series',
    'Fruit Tea',
    'Fruit Tea Series',
    'Best Seller Series',
    'Smoothie Series',
    'Coffee Series',
    'Specials',
]

type IceLevel = "No Ice" | "Less" | "Regular" | "Extra"

export function LoyaltyModal({ open, onClose, onProceed, stampsToEarn }: LoyaltyModalProps) {
    const [username, setUsername] = useState("")
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [loyaltyCustomer, setLoyaltyCustomer] = useState<LoyaltyCustomer | null>(null)
    const [loyaltyError, setLoyaltyError] = useState<string | null>(null)
    const [redeemFreeDrink, setRedeemFreeDrink] = useState(false)

    // Drink selection state
    const [showDrinkSelector, setShowDrinkSelector] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
    const [sugarLevel, setSugarLevel] = useState(50)
    const [iceLevel, setIceLevel] = useState<IceLevel>("Regular")
    const [selectedToppings, setSelectedToppings] = useState<Modifier[]>([])
    const [freeDrinkConfirmed, setFreeDrinkConfirmed] = useState(false)
    const [drinkSearchQuery, setDrinkSearchQuery] = useState("")

    // Fetch products when drink selector opens
    useEffect(() => {
        if (showDrinkSelector && products.length === 0) {
            fetchProducts()
        }
    }, [showDrinkSelector])

    const fetchProducts = async () => {
        setLoadingProducts(true)
        try {
            const [allProducts, groups] = await Promise.all([
                getProducts(),
                getModifierGroups()
            ])
            // Filter to eligible categories only
            const eligible = allProducts.filter((p: Product) =>
                p.category && ELIGIBLE_CATEGORIES.includes(p.category.name)
            )
            setProducts(eligible)
            setModifierGroups(groups)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    // Get product modifier groups
    const productModifierGroups = useMemo(() => {
        if (!selectedProduct) return []
        const groups = (selectedProduct as any)?.modifierGroups ?? selectedProduct?.modifier_groups
        return (groups as ModifierGroup[]) || []
    }, [selectedProduct])

    const hasSugarModifier = useMemo(() => {
        return productModifierGroups.some(g => g.name.toLowerCase().includes('sugar'))
    }, [productModifierGroups])

    const hasIceModifier = useMemo(() => {
        return productModifierGroups.some(g => {
            const name = g.name.toLowerCase().trim()
            return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ')
        })
    }, [productModifierGroups])

    const toppingsGroup = useMemo(() => {
        return productModifierGroups.find(g =>
            g.name.toLowerCase().includes('topping') || g.name.toLowerCase().includes('add-on') || g.name.toLowerCase().includes('addon')
        )
    }, [productModifierGroups])

    const toppings = toppingsGroup?.modifiers || []

    // Calculate prices
    const basePrice = toNumber(selectedSize?.price) || 0
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + toNumber(t.price_adjustment), 0)

    // Reset selections when product changes
    useEffect(() => {
        if (selectedProduct?.sizes && selectedProduct.sizes.length > 0) {
            const sizes = [...selectedProduct.sizes].sort((a, b) => toNumber(a.price) - toNumber(b.price))
            setSelectedSize(sizes[0])
        } else {
            setSelectedSize(null)
        }
        setSugarLevel(50)
        setIceLevel("Regular")
        setSelectedToppings([])
    }, [selectedProduct])

    const handleLookupUsername = async () => {
        if (!username.trim()) return

        setIsLookingUp(true)
        setLoyaltyError(null)

        try {
            const data = await lookupCustomerByUsername(username.trim())
            setLoyaltyCustomer({
                username: data.username,
                name: data.name,
                stamps: data.stamps,
                can_redeem: data.can_redeem
            })
        } catch (error) {
            setLoyaltyError("Account not found. Please check your username.")
            setLoyaltyCustomer(null)
        } finally {
            setIsLookingUp(false)
        }
    }

    const handleConfirmFreeDrink = () => {
        if (!selectedProduct || !selectedSize) return

        // Find modifiers
        const sugarGroup = productModifierGroups.find(g => g.name.toLowerCase().includes('sugar'))
        const sugarModifier = sugarGroup?.modifiers.find(m => m.name === `${sugarLevel}% Sugar`)

        const iceGroup = productModifierGroups.find(g => {
            const name = g.name.toLowerCase().trim()
            return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ')
        })
        const iceModifier = iceGroup?.modifiers.find(m => {
            const displayLabel = m.name.replace(' Ice', '').replace('Ice', '').trim() || m.name
            return displayLabel === iceLevel || m.name === iceLevel || m.name === `${iceLevel} Ice`
        })

        setFreeDrinkConfirmed(true)
        setShowDrinkSelector(false)
    }

    const handleProceed = () => {
        if (loyaltyCustomer) {
            if (redeemFreeDrink && freeDrinkConfirmed && selectedProduct && selectedSize) {
                // Find modifiers for the selection
                const sugarGroup = productModifierGroups.find(g => g.name.toLowerCase().includes('sugar'))
                const sugarModifier = sugarGroup?.modifiers.find(m => m.name === `${sugarLevel}% Sugar`)

                const iceGroup = productModifierGroups.find(g => {
                    const name = g.name.toLowerCase().trim()
                    return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ')
                })
                const iceModifier = iceGroup?.modifiers.find(m => {
                    const displayLabel = m.name.replace(' Ice', '').replace('Ice', '').trim() || m.name
                    return displayLabel === iceLevel || m.name === iceLevel || m.name === `${iceLevel} Ice`
                })

                const freeDrinkSelection: FreeDrinkSelection = {
                    product: selectedProduct,
                    size: selectedSize,
                    sugarLevel: hasSugarModifier ? sugarLevel : 0,
                    iceLevel: hasIceModifier ? iceLevel : "Regular",
                    sugarModifier,
                    iceModifier,
                    toppings: selectedToppings,
                    basePrice,
                    toppingsPrice,
                }
                onProceed(loyaltyCustomer.username, true, freeDrinkSelection)
            } else {
                onProceed(loyaltyCustomer.username, false)
            }
        } else {
            onProceed()
        }
    }

    const handleSkip = () => {
        onProceed()
    }

    const handleClearLoyalty = () => {
        setLoyaltyCustomer(null)
        setUsername("")
        setLoyaltyError(null)
        setRedeemFreeDrink(false)
        setFreeDrinkConfirmed(false)
        setSelectedProduct(null)
        setSelectedSize(null)
        setSelectedToppings([])
    }

    const handleRedeemToggle = (checked: boolean) => {
        setRedeemFreeDrink(checked)
        if (checked) {
            setShowDrinkSelector(true)
        } else {
            setFreeDrinkConfirmed(false)
            setSelectedProduct(null)
            setSelectedSize(null)
            setSelectedToppings([])
        }
    }

    const toggleTopping = (topping: Modifier) => {
        setSelectedToppings(prev =>
            prev.find(t => t.id === topping.id)
                ? prev.filter(t => t.id !== topping.id)
                : [...prev, topping]
        )
    }

    // Group products by category (filtered by search)
    const productsByCategory = useMemo(() => {
        const grouped: { [key: string]: Product[] } = {}
        const searchLower = drinkSearchQuery.toLowerCase().trim()

        products.forEach(product => {
            // Filter by search query
            if (searchLower && !product.name.toLowerCase().includes(searchLower)) {
                return
            }

            const categoryName = product.category?.name || 'Other'
            if (!grouped[categoryName]) {
                grouped[categoryName] = []
            }
            grouped[categoryName].push(product)
        })
        return grouped
    }, [products, drinkSearchQuery])

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="max-w-[95vw] lg:max-w-7xl w-full p-0 bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden shadow-2xl border-0 outline-none gap-0 block max-h-[95vh]">
                {/* Close Button Override */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#8B9D83] via-[#5C715E] to-[#3F4F3B] p-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full blur-3xl"></div>

                    <div className="relative flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden shrink-0">
                            <img src={sitePath("/chantea-logo.jpg")} alt="Chantea" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-serif font-bold text-white tracking-wide mb-1">
                                {showDrinkSelector ? 'Choose Your Free Drink' : 'Chantea Rewards'}
                            </DialogTitle>
                            <p className="text-white/90 text-lg font-medium tracking-wide leading-tight">
                                {showDrinkSelector ? 'Select a drink as your reward!' : 'Buy 10, get 1 FREE!'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-0 overflow-auto" style={{ maxHeight: 'calc(95vh - 180px)' }}>
                    {showDrinkSelector ? (
                        /* DRINK SELECTOR STATE */
                        <div className="p-6 bg-white">
                            {!selectedProduct ? (
                                /* PRODUCT LIST */
                                <div>
                                    <button
                                        onClick={() => setShowDrinkSelector(false)}
                                        className="flex items-center gap-2 text-espresso-light hover:text-espresso mb-6 font-medium"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Back to Rewards
                                    </button>

                                    {/* Search Bar */}
                                    <div className="relative mb-6">
                                        <input
                                            type="text"
                                            placeholder="Search drinks..."
                                            value={drinkSearchQuery}
                                            onChange={(e) => setDrinkSearchQuery(e.target.value)}
                                            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-matcha focus:ring-0 transition-all text-espresso placeholder:text-gray-400"
                                        />
                                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {drinkSearchQuery && (
                                            <button
                                                onClick={() => setDrinkSearchQuery("")}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {loadingProducts ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-matcha" />
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[500px]">
                                            <div className="space-y-8 pr-4">
                                                {Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
                                                    <div key={categoryName}>
                                                        <h3 className="text-lg font-bold text-espresso mb-4 font-serif">{categoryName}</h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {categoryProducts.map(product => (
                                                                <button
                                                                    key={product.id}
                                                                    onClick={() => setSelectedProduct(product)}
                                                                    className="bg-cream rounded-2xl p-4 text-left hover:bg-matcha/10 hover:ring-2 hover:ring-matcha transition-all group"
                                                                >
                                                                    <div className="w-full aspect-square bg-white rounded-xl mb-3 flex items-center justify-center text-4xl overflow-hidden">
                                                                        {product.image_url ? (
                                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            '🧋'
                                                                        )}
                                                                    </div>
                                                                    <p className="font-bold text-espresso text-sm leading-tight mb-1 group-hover:text-matcha">{product.name}</p>
                                                                    <p className="text-xs text-espresso-light">
                                                                        From {formatPrice(product.sizes?.[0]?.price || 0)}
                                                                    </p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            ) : (
                                /* PRODUCT CUSTOMIZATION */
                                <div>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="flex items-center gap-2 text-espresso-light hover:text-espresso mb-6 font-medium"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Back to Drinks
                                    </button>

                                    <div className="flex gap-8">
                                        {/* Product Info */}
                                        <div className="w-48 shrink-0">
                                            <div className="w-full aspect-square bg-cream rounded-2xl flex items-center justify-center text-6xl mb-4 overflow-hidden">
                                                {selectedProduct.image_url ? (
                                                    <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🧋'
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-espresso font-serif mb-1">{selectedProduct.name}</h3>
                                            <p className="text-sm text-espresso-light">{selectedProduct.description}</p>

                                            {/* Price Summary */}
                                            <div className="mt-4 p-4 bg-matcha/10 rounded-xl">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-espresso-light">Drink Price</span>
                                                    <span className="line-through text-gray-400">{formatPrice(basePrice)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-matcha font-bold">FREE!</span>
                                                    <span className="text-matcha font-bold">-{formatPrice(basePrice)}</span>
                                                </div>
                                                {toppingsPrice > 0 && (
                                                    <div className="flex justify-between text-sm border-t border-matcha/20 pt-2 mt-2">
                                                        <span className="text-espresso-light">Toppings</span>
                                                        <span className="text-espresso font-bold">+{formatPrice(toppingsPrice)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Customization Options */}
                                        <div className="flex-1 space-y-6">
                                            {/* Size Selector */}
                                            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                                                <div>
                                                    <label className="text-sm font-bold text-espresso uppercase tracking-wider mb-3 block">Size</label>
                                                    <div className="flex gap-3">
                                                        {[...selectedProduct.sizes].sort((a, b) => toNumber(a.price) - toNumber(b.price)).map(size => (
                                                            <button
                                                                key={size.id}
                                                                onClick={() => setSelectedSize(size)}
                                                                className={`px-6 py-4 rounded-xl font-bold transition-all ${selectedSize?.id === size.id
                                                                    ? 'bg-matcha text-white shadow-lg'
                                                                    : 'bg-gray-100 text-espresso hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {size.size}
                                                                <span className="block text-xs mt-1 opacity-80">{formatPrice(size.price)}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sugar Level - from actual modifiers */}
                                            {hasSugarModifier && (() => {
                                                const sugarGroup = productModifierGroups.find(g => g.name.toLowerCase().includes('sugar'))
                                                const sugarModifiers = sugarGroup?.modifiers || []
                                                return (
                                                    <div>
                                                        <label className="text-sm font-bold text-espresso uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Droplets className="w-4 h-4 text-coral" />
                                                            {sugarGroup?.name || 'Sugar Level'}
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {sugarModifiers.map(modifier => {
                                                                // Extract percentage from name like "50% Sugar"
                                                                const match = modifier.name.match(/(\d+)%/)
                                                                const level = match ? parseInt(match[1]) : null
                                                                const isSelected = level !== null ? sugarLevel === level : modifier.name.includes(String(sugarLevel))
                                                                return (
                                                                    <button
                                                                        key={modifier.id}
                                                                        onClick={() => level !== null && setSugarLevel(level)}
                                                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${isSelected
                                                                            ? 'bg-coral text-white shadow-md'
                                                                            : 'bg-gray-100 text-espresso-light hover:bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        {modifier.name.replace(' Sugar', '')}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })()}

                                            {/* Ice Level - from actual modifiers */}
                                            {hasIceModifier && (() => {
                                                const iceGroup = productModifierGroups.find(g => {
                                                    const name = g.name.toLowerCase().trim()
                                                    return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ')
                                                })
                                                const iceModifiers = iceGroup?.modifiers || []
                                                return (
                                                    <div>
                                                        <label className="text-sm font-bold text-espresso uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Snowflake className="w-4 h-4 text-matcha" />
                                                            {iceGroup?.name || 'Ice Level'}
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {iceModifiers.map(modifier => {
                                                                const displayLabel = modifier.name.replace(' Ice', '').replace('Ice', '').trim() || modifier.name
                                                                const isSelected = iceLevel === displayLabel ||
                                                                    modifier.name === iceLevel ||
                                                                    modifier.name === `${iceLevel} Ice`
                                                                return (
                                                                    <button
                                                                        key={modifier.id}
                                                                        onClick={() => setIceLevel(displayLabel as IceLevel)}
                                                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${isSelected
                                                                            ? 'bg-matcha text-white shadow-md'
                                                                            : 'bg-gray-100 text-espresso-light hover:bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        {displayLabel}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })()}

                                            {/* Toppings (Extra charge) */}
                                            {toppings.length > 0 && (
                                                <div>
                                                    <label className="text-sm font-bold text-espresso uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                                                        Add Toppings
                                                        <Badge variant="outline" className="ml-2 text-xs">Extra Charge</Badge>
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {toppings.map(topping => {
                                                            const isSelected = selectedToppings.find(t => t.id === topping.id)
                                                            return (
                                                                <button
                                                                    key={topping.id}
                                                                    onClick={() => toggleTopping(topping)}
                                                                    className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 ${isSelected
                                                                        ? 'bg-gold/20 ring-2 ring-gold'
                                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-gold text-white' : 'bg-white border-2 border-gray-300'
                                                                        }`}>
                                                                        {isSelected && <Check className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-espresso text-sm">{topping.name}</p>
                                                                        <p className="text-xs text-gold font-bold">+{formatPrice(topping.price_adjustment)}</p>
                                                                    </div>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Confirm Button */}
                                            <Button
                                                onClick={handleConfirmFreeDrink}
                                                disabled={!selectedSize}
                                                className="w-full h-16 bg-matcha hover:bg-matcha/90 text-white text-xl font-bold rounded-2xl shadow-lg"
                                            >
                                                <Gift className="w-6 h-6 mr-3" />
                                                Confirm Free Drink
                                                {toppingsPrice > 0 && (
                                                    <span className="ml-2 text-sm font-normal opacity-90">(+{formatPrice(toppingsPrice)} toppings)</span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : loyaltyCustomer ? (
                        /* LOGGED IN STATE */
                        <div className="p-10 bg-white">
                            <div className="flex flex-col gap-8">
                                {/* Welcome Header */}
                                <div className="flex items-center justify-between bg-[#F5F5F0] p-6 rounded-3xl border border-[#E8E6E1]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-[#5C8D5C] rounded-full flex items-center justify-center shadow-lg shadow-[#5C8D5C]/20">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg text-[#8C8C8C] font-medium mb-1">Welcome back,</p>
                                            <h3 className="text-3xl font-bold text-[#3F3028]">{loyaltyCustomer.name}</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClearLoyalty}
                                        className="text-[#8C8C8C] hover:text-red-600 font-semibold px-4 py-2 rounded-xl bg-white border border-transparent hover:border-red-100 hover:bg-red-50 transition-all text-sm"
                                    >
                                        Change Account
                                    </button>
                                </div>

                                {/* Stamps Visualization */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-[#E8E6E1] shadow-sm">
                                    <div className="flex justify-between items-end mb-6">
                                        <h4 className="text-xl font-bold text-[#3F3028] font-serif">Your Stamps</h4>
                                        <span className="text-2xl font-bold text-[#5C8D5C] bg-[#5C8D5C]/10 px-4 py-1 rounded-full">
                                            {loyaltyCustomer.stamps % 10} / 10
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-center w-full px-4">
                                        {Array.from({ length: 10 }).map((_, i) => {
                                            const isActive = i < (loyaltyCustomer.stamps % 10);
                                            const isLast = i === 9;
                                            const isLineActive = i < (loyaltyCustomer.stamps % 10) - 1;

                                            return (
                                                <div key={i} className="flex items-center flex-1 last:flex-none">
                                                    <div
                                                        className={`
                                                            relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-all duration-500 z-10 shrink-0
                                                            ${isActive
                                                                ? 'bg-[#5C8D5C] text-white shadow-lg shadow-[#5C8D5C]/30 scale-100'
                                                                : 'bg-[#F2F2F2] text-[#D9D9D9] scale-90'
                                                            }
                                                        `}
                                                    >
                                                        {isActive ? '🍵' : '○'}
                                                    </div>

                                                    {!isLast && (
                                                        <div className="h-1 flex-1 mx-[-4px] relative z-0">
                                                            <div className={`
                                                                absolute inset-0 transition-colors duration-500
                                                                ${isLineActive ? 'bg-[#5C8D5C]' : 'bg-[#F2F2F2]'}
                                                            `}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Rewards & Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Earning Info */}
                                    {stampsToEarn > 0 && (
                                        <div className="flex items-center gap-4 bg-[#5C8D5C]/5 p-6 rounded-3xl border border-[#5C8D5C]/20">
                                            <div className="w-12 h-12 bg-[#5C8D5C]/20 rounded-full flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-[#5C8D5C]" />
                                            </div>
                                            <div>
                                                <p className="text-[#3F3028] text-lg font-medium leading-tight">You will earn</p>
                                                <p className="text-[#5C8D5C] text-2xl font-bold">+{stampsToEarn} Stamps</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Redeem Toggle */}
                                    {loyaltyCustomer.can_redeem && (
                                        <button
                                            onClick={() => handleRedeemToggle(!redeemFreeDrink)}
                                            className={`
                                                flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left
                                                ${redeemFreeDrink
                                                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                                                    : 'bg-white border-[#E8E6E1] hover:border-[#D4AF37]/50'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors
                                                ${redeemFreeDrink ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#D9D9D9]'}
                                            `}>
                                                {redeemFreeDrink && <CheckCircle className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-[#3F3028] text-lg">Redeem Free Drink</p>
                                                {freeDrinkConfirmed && selectedProduct ? (
                                                    <p className="text-[#5C8D5C] text-sm font-medium">
                                                        {selectedProduct.name} ({selectedSize?.size})
                                                        {toppingsPrice > 0 && ` +${formatPrice(toppingsPrice)} toppings`}
                                                    </p>
                                                ) : (
                                                    <p className="text-[#8C8C8C] text-sm">Tap to choose your free drink!</p>
                                                )}
                                            </div>
                                            {freeDrinkConfirmed && (
                                                <Badge className="bg-matcha text-white">Selected</Badge>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <Button
                                    onClick={handleProceed}
                                    disabled={redeemFreeDrink && !freeDrinkConfirmed}
                                    className="w-full h-20 bg-[#5C8D5C] hover:bg-[#4A6D4A] text-white text-2xl font-bold rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50"
                                >
                                    {redeemFreeDrink && !freeDrinkConfirmed ? 'Select Your Free Drink First' : 'Continue Order'}
                                    <ArrowRight className="w-8 h-8 ml-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* GUEST / LOGIN STATE */
                        <div className="flex flex-col lg:flex-row h-full min-h-[700px]">
                            {/* LEFT: LOGIN */}
                            <div className="flex-1 p-12 flex flex-col justify-center bg-white">
                                <h3 className="text-3xl font-serif font-bold text-[#3F3028] mb-2">Member Login</h3>
                                <p className="text-[#8C8C8C] text-lg mb-8">Enter your username to collect stamps</p>

                                <div className="space-y-6">
                                    <div className="relative">
                                        <AtSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#8C8C8C]" />
                                        <Input
                                            type="text"
                                            placeholder="username"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value)
                                                setLoyaltyError(null)
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLookupUsername()}
                                            className="pl-16 h-20 rounded-2xl text-2xl border-2 border-[#E8E6E1] bg-[#FAF9F6] focus:bg-white focus:border-[#5C8D5C] focus:ring-0 transition-all font-medium text-[#3F3028]"
                                        />
                                    </div>

                                    {loyaltyError && (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <span className="font-medium">{loyaltyError}</span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleLookupUsername}
                                        disabled={isLookingUp || !username.trim()}
                                        className="w-full h-16 bg-[#3F3028] hover:bg-[#2C2119] text-white text-xl font-bold rounded-2xl shadow-lg transition-all"
                                    >
                                        {isLookingUp ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Check Points'}
                                    </Button>

                                    <div className="relative py-4 flex items-center justify-center">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8E6E1]"></div></div>
                                        <span className="relative bg-white px-4 text-[#8C8C8C] text-sm font-medium">OR</span>
                                    </div>

                                    <Button
                                        onClick={handleSkip}
                                        className="w-full h-24 bg-[#5C8D5C] hover:bg-[#4A6D4A] text-white border-2 border-[#5C8D5C] rounded-3xl transition-all shadow-md hover:shadow-lg flex flex-col gap-1"
                                    >
                                        <span className="text-xl font-bold">Skip & Place Order</span>
                                        <span className="text-sm font-medium text-white/90 opacity-90">(I don't want to earn stamps)</span>
                                    </Button>
                                </div>
                            </div>

                            {/* RIGHT: REGISTER */}
                            <div className="relative w-full lg:w-[420px] bg-[#FAF9F6] p-10 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-[#E8E6E1]">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-[#3F3028] mb-3">Join & Earn</h3>
                                    <p className="text-[#8C8C8C]">Scan code to create account</p>
                                </div>

                                <div className="p-4 bg-white rounded-[2rem] shadow-xl border border-white mb-6 transform hover:scale-105 transition-transform duration-300">
                                    <QRCodeSVG
                                        value={process.env.NEXT_PUBLIC_REGISTER_URL || "http://localhost:3002/register"}
                                        size={200}
                                        level="H"
                                        bgColor="#ffffff"
                                        fgColor="#3F3028"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-[#5C8D5C] bg-[#5C8D5C]/10 px-5 py-2.5 rounded-full font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-[#5C8D5C] animate-pulse"></span>
                                    Instant Registration
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
