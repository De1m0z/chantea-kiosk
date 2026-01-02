"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Plus, Minus, Droplets, Snowflake, Check } from "lucide-react"
import { Product, ProductSize, ModifierGroup, Modifier, CartItem } from "@/lib/types"
import { useCart } from "@/context/cart-context"
import { formatPrice, toNumber } from "@/lib/format"

type IceLevel = "No Ice" | "Less" | "Regular" | "Extra"

const iceIcons = {
  "No Ice": { icon: X, label: "No Ice" },
  Less: { icon: Snowflake, label: "Less" },
  Regular: { icon: Snowflake, label: "Regular" },
  Extra: { icon: Snowflake, label: "Extra" },
}

interface ProductCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  modifierGroups: ModifierGroup[] // fallback if product doesn't have its own
  editingItem?: CartItem | null // For edit mode
  onEditComplete?: (item: Omit<CartItem, 'id' | 'quantity'>) => void // Callback when editing
  onAddSuccess?: () => void // Callback when item is successfully added to cart
}

export function ProductCustomizationModal({
  isOpen,
  onClose,
  product,
  modifierGroups: globalModifierGroups,
  editingItem,
  onEditComplete,
  onAddSuccess,
}: ProductCustomizationModalProps) {
  const { addItem } = useCart()
  const isEditMode = !!editingItem && !!onEditComplete

  // Use product's modifier groups if available, otherwise fall back to global
  // Check both snake_case and camelCase since Laravel may return either
  const productModifierGroups: ModifierGroup[] = useMemo(() => {
    // Check for modifierGroups (camelCase - Laravel default) or modifier_groups (snake_case)
    const groups = (product as any)?.modifierGroups ?? product?.modifier_groups;
    if (groups !== undefined) {
      return groups as ModifierGroup[];
    }
    return globalModifierGroups;
  }, [product, globalModifierGroups])

  // Get sizes from product
  const sizes = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) {
      return [...product.sizes].sort((a, b) => toNumber(a.price) - toNumber(b.price))
    }
    return []
  }, [product?.sizes])

  // Check which modifier types are available for this product
  const hasSugarModifier = useMemo(() => {
    return productModifierGroups.some(g => g.name.toLowerCase().includes('sugar'))
  }, [productModifierGroups])

  const hasIceModifier = useMemo(() => {
    // Check for exact "Ice Level" match - NOT includes (because "spice level" includes "ice level")
    return productModifierGroups.some(g => {
      const name = g.name.toLowerCase().trim();
      // Only match if name IS "ice level", "ice_level", or starts with "ice " or equals "ice"
      return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ');
    });
  }, [productModifierGroups])

  const toppingsGroup = useMemo(() => {
    return productModifierGroups.find(g => g.name.toLowerCase().includes('topping'))
  }, [productModifierGroups])

  // Get any other modifier groups (not sugar, ice level, or toppings)
  const otherModifierGroups = useMemo(() => {
    return productModifierGroups.filter(g => {
      const name = g.name.toLowerCase().trim();
      // Use strict equality - because "spice level" contains "ice level" as substring!
      const isIce = name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ');
      return !name.includes('sugar') && !isIce && !name.includes('topping');
    });
  }, [productModifierGroups])

  const toppings = toppingsGroup?.modifiers || []

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [sugarLevel, setSugarLevel] = useState<number>(50)
  const [iceLevel, setIceLevel] = useState<IceLevel>("Regular")
  const [selectedToppings, setSelectedToppings] = useState<Modifier[]>([])
  const [selectedOtherModifiers, setSelectedOtherModifiers] = useState<{ [groupId: number]: Modifier[] }>({})
  const [quantity, setQuantity] = useState(1)

  // Reset form when product changes or when entering edit mode
  useEffect(() => {
    if (editingItem) {
      // Edit mode - pre-fill with existing values
      setSelectedSize(editingItem.customization.size)
      setSugarLevel(editingItem.customization.sugarLevel)
      setIceLevel(editingItem.customization.iceLevel as IceLevel)
      // Separate toppings from other modifiers based on topping group
      const toppingIds = toppingsGroup?.modifiers.map(t => t.id) || []
      const editToppings = editingItem.customization.toppings.filter(t => toppingIds.includes(t.id))
      const editOtherMods = editingItem.customization.toppings.filter(t => !toppingIds.includes(t.id))
      setSelectedToppings(editToppings)
      // Group other modifiers by their group
      const otherModsByGroup: { [groupId: number]: Modifier[] } = {}
      otherModifierGroups.forEach(group => {
        const modsForGroup = editOtherMods.filter(m =>
          group.modifiers.some(gm => gm.id === m.id)
        )
        if (modsForGroup.length > 0) {
          otherModsByGroup[group.id] = modsForGroup
        } else {
          // Auto-select first option for required modifier groups that have no selection
          const isRequired = (group as any).required || ((group as any).min_select && (group as any).min_select > 0)
          if (isRequired && group.modifiers && group.modifiers.length > 0) {
            const sortedModifiers = [...group.modifiers].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            otherModsByGroup[group.id] = [sortedModifiers[0]]
          }
        }
      })
      setSelectedOtherModifiers(otherModsByGroup)
      setQuantity(editingItem.quantity)
    } else {
      // New item mode - reset to defaults
      if (sizes.length > 0) {
        const mediumSize = sizes.find(s => s.size === 'M') || sizes[0]
        setSelectedSize(mediumSize)
      } else {
        setSelectedSize(null)
      }
      setSugarLevel(50)
      setIceLevel("Regular")
      setSelectedToppings([])

      // Auto-select first option for required modifier groups
      const autoSelected: { [groupId: number]: Modifier[] } = {}
      otherModifierGroups.forEach(group => {
        const isRequired = (group as any).required || ((group as any).min_select && (group as any).min_select > 0)
        if (isRequired && group.modifiers && group.modifiers.length > 0) {
          // Sort by sort_order and pick the first one
          const sortedModifiers = [...group.modifiers].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          autoSelected[group.id] = [sortedModifiers[0]]
        }
      })
      setSelectedOtherModifiers(autoSelected)

      setQuantity(1)
    }
  }, [product, sizes, editingItem, toppingsGroup, otherModifierGroups])

  if (!product) return null

  const basePrice = toNumber(selectedSize?.price) || 0
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + toNumber(t.price_adjustment), 0)
  const otherModifiersPrice = Object.values(selectedOtherModifiers).flat().reduce((sum, m) => sum + toNumber(m.price_adjustment), 0)
  const unitPrice = basePrice + toppingsPrice + otherModifiersPrice
  const totalPrice = unitPrice * quantity

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) return

    // Check if all required modifier groups have selections
    const missingRequired = otherModifierGroups.filter(group => {
      const isRequired = (group as any).required || ((group as any).min_select && (group as any).min_select > 0)
      const hasSelection = (selectedOtherModifiers[group.id]?.length || 0) >= ((group as any).min_select || 1)
      return isRequired && !hasSelection
    })

    if (missingRequired.length > 0) {
      toast.error("Please complete your selection", {
        description: `${missingRequired.map(g => g.name).join(", ")} ${missingRequired.length > 1 ? "are" : "is"} required`,
        duration: 3000,
      })
      return
    }

    // Find Sugar Modifier
    const sugarGroup = productModifierGroups.find(g => g.name.toLowerCase().includes('sugar'));
    const sugarModifierName = `${sugarLevel}% Sugar`;
    const sugarModifier = sugarGroup?.modifiers.find(m => m.name === sugarModifierName);

    // Find Ice Modifier - search by display label or full name
    const iceGroup = productModifierGroups.find(g => {
      const name = g.name.toLowerCase().trim();
      return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ');
    });
    // Try to find modifier by matching the display label or the full name
    const iceModifier = iceGroup?.modifiers.find(m => {
      const displayLabel = m.name.replace(' Ice', '').replace('Ice', '').trim() || m.name;
      return displayLabel === iceLevel || m.name === iceLevel || m.name === `${iceLevel} Ice`;
    });

    const itemData = {
      product: product!,
      customization: {
        size: selectedSize!,
        sugarLevel: hasSugarModifier ? sugarLevel : 0,
        iceLevel: hasIceModifier ? iceLevel : "Regular",
        toppings: [...selectedToppings, ...Object.values(selectedOtherModifiers).flat()],
        sugarModifier,
        iceModifier,
      },
      unitPrice,
      totalPrice,
    }

    if (isEditMode && onEditComplete) {
      // Edit mode - call the edit callback
      onEditComplete(itemData)
      toast.success("Item updated!", {
        description: `${product.name} has been updated in your cart`,
        duration: 2000,
      })
    } else {
      // Add mode - add to cart
      addItem({
        ...itemData,
        quantity,
      })
      toast.success("Added to cart!", {
        description: `${quantity}x ${product.name} added`,
        duration: 2000,
      })
    }

    setQuantity(1)
    setSelectedToppings([])
    setSelectedOtherModifiers({})
    onClose()

    // Call success callback for add mode (not edit mode)
    if (!isEditMode && onAddSuccess) {
      onAddSuccess()
    }
  }

  const toggleTopping = (topping: Modifier) => {
    setSelectedToppings((prev) =>
      prev.find(t => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping]
    )
  }

  const toggleOtherModifier = (groupId: number, modifier: Modifier, maxSelect: number = 99, isRequired: boolean = false) => {
    setSelectedOtherModifiers(prev => {
      const current = prev[groupId] || []
      const exists = current.find(m => m.id === modifier.id)

      if (exists) {
        // For required groups with max_select=1, don't allow deselection - just switch
        if (isRequired && maxSelect === 1) {
          return prev // Keep current selection, don't deselect
        }
        // For required groups, ensure at least min_select remain selected
        if (isRequired && current.length <= 1) {
          return prev // Can't deselect the last required option
        }
        return { ...prev, [groupId]: current.filter(m => m.id !== modifier.id) }
      } else {
        // Check max selection
        if (current.length >= maxSelect) {
          return { ...prev, [groupId]: [...current.slice(1), modifier] }
        }
        return { ...prev, [groupId]: [...current, modifier] }
      }
    })
  }

  // Check if product has any customization options
  const hasAnyOptions = sizes.length > 0 || hasSugarModifier || hasIceModifier || toppings.length > 0 || otherModifierGroups.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col h-full overflow-hidden bg-white p-0 border-l border-gray-200 shadow-2xl [&>button]:hidden">
        <SheetTitle className="sr-only">Customize {product.name}</SheetTitle>
        <div className="flex flex-col lg:flex-row min-h-full">
          {/* Left Side - Product Image */}
          <div className="lg:w-5/12 relative hidden lg:block">
            <div className="h-full">
              <div className="relative h-full overflow-hidden bg-matcha-light">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                <img
                  src={product.image_url || `https://placehold.co/600x800/E8F3E8/5D4037?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-0 left-0 right-0 p-10 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-32">
                  <h2 className="text-4xl font-serif font-bold text-white text-balance drop-shadow-lg leading-tight mb-2">
                    {product.name}
                  </h2>
                  <p className="text-white/90 text-sm font-medium tracking-wide">Premium Selection</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Customization Panel */}
          <div className="lg:w-7/12 flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 z-50 bg-cream/95 backdrop-blur-md border-b border-cream-dark/20 px-5 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 flex items-center justify-between shadow-sm">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-espresso">
                {hasAnyOptions ? 'Customize Your Order' : 'Add to Order'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-espresso/10 h-10 w-10 text-espresso transition-colors"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="p-5 md:p-6 lg:p-8 space-y-6 lg:space-y-8 flex-1 overflow-y-auto">
              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="space-y-3 lg:space-y-4">
                  <label className="text-xs md:text-sm font-bold text-espresso tracking-[0.15em] uppercase flex items-center gap-2 mb-3 lg:mb-5">
                    <span className="w-2 h-2 rounded-full bg-matcha inline-block"></span>
                    Select Size
                  </label>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {sizes.map((size) => (
                      <Button
                        key={size.id}
                        variant={'ghost'}
                        onClick={() => setSelectedSize(size)}
                        className={`h-24 lg:h-28 rounded-2xl transition-all duration-200 relative border-2 flex flex-col gap-1 md:gap-2 select-none ${selectedSize?.id === size.id
                          ? "bg-matcha text-white border-matcha shadow-lg"
                          : "bg-gray-50 text-espresso border-transparent hover:bg-gray-100 active:bg-gray-200"
                          }`}
                      >
                        <span className="text-xl md:text-2xl font-serif font-bold">{size.size}</span>
                        <span className={`text-[10px] md:text-xs font-sans tracking-wide ${selectedSize?.id === size.id ? 'text-white/80' : 'text-espresso-light'}`}>
                          {formatPrice(size.price)}
                        </span>
                        {selectedSize?.id === size.id && (
                          <div className="absolute top-2 right-2 w-4 h-4 md:w-5 md:h-5 rounded-full bg-matcha flex items-center justify-center animate-in fade-in zoom-in">
                            <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Level - Only show if product has sugar modifier */}
              {hasSugarModifier && (
                <div className="space-y-3 lg:space-y-4">
                  <label className="text-xs md:text-sm font-bold text-espresso tracking-[0.15em] uppercase flex items-center gap-2 mb-3 lg:mb-5">
                    <Droplets className="w-4 h-4 text-coral" />
                    Sugar Level
                  </label>
                  <div className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    {[0, 25, 50, 75, 100].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSugarLevel(level)}
                        className={`
                            relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-sm md:text-base font-bold transition-all duration-200 select-none
                            ${sugarLevel === level
                            ? "bg-coral text-white shadow-md"
                            : "text-espresso-light hover:bg-gray-100 active:bg-gray-200"
                          }
                          `}
                      >
                        {level === 100 ? 'MAX' : `${level}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ice Level - Only show if product has ice modifier */}
              {hasIceModifier && (() => {
                const iceGroup = productModifierGroups.find(g => {
                  const name = g.name.toLowerCase().trim();
                  return name === 'ice level' || name === 'ice_level' || name === 'ice' || name.startsWith('ice ');
                });
                const iceModifiers = iceGroup?.modifiers || [];

                return (
                  <div className="space-y-3 lg:space-y-4">
                    <label className="text-xs md:text-sm font-bold text-espresso tracking-[0.15em] uppercase flex items-center gap-2 mb-3 lg:mb-5">
                      <Snowflake className="w-4 h-4 text-matcha" />
                      Ice Level
                    </label>
                    <div className={`grid gap-2 md:gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(iceModifiers.length, 4)}, 1fr)` }}>
                      {iceModifiers.map((modifier) => {
                        // Map modifier name to display label
                        const displayLabel = modifier.name.replace(' Ice', '').replace('Ice', '').trim() || modifier.name;
                        const isSelected = iceLevel === displayLabel ||
                          (iceLevel === 'Less' && modifier.name === 'Less Ice') ||
                          (iceLevel === 'Regular' && modifier.name === 'Regular Ice') ||
                          (iceLevel === 'Extra' && modifier.name === 'Extra Ice') ||
                          (iceLevel === 'No Ice' && (modifier.name === 'No Ice' || modifier.name === 'No'));
                        const Icon = modifier.name.toLowerCase().includes('no') ? X : Snowflake;

                        return (
                          <Button
                            key={modifier.id}
                            variant={'ghost'}
                            onClick={() => setIceLevel(displayLabel as IceLevel)}
                            className={`h-16 md:h-20 rounded-2xl transition-all duration-200 border flex-col gap-1 md:gap-1.5 select-none ${isSelected
                              ? "bg-matcha text-white border-matcha shadow-md"
                              : "bg-gray-50 text-espresso border-transparent hover:bg-gray-100 active:bg-gray-200"
                              }`}
                          >
                            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isSelected ? 'text-white' : 'text-matcha'}`} />
                            <span className="font-bold text-[10px] md:text-xs uppercase tracking-wide">{displayLabel}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Toppings - Only show if product has toppings modifier group */}
              {toppings.length > 0 && (
                <div className="space-y-3 lg:space-y-4">
                  <label className="text-xs md:text-sm font-bold text-espresso tracking-[0.15em] uppercase flex items-center gap-2 mb-3 lg:mb-5">
                    <span className="w-2 h-2 rounded-full bg-gold inline-block"></span>
                    Add Toppings
                    <span className="text-[10px] md:text-xs font-normal text-espresso-light ml-2">(Tap to select)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {toppings.map((topping) => {
                      const isSelected = !!selectedToppings.find(t => t.id === topping.id);
                      return (
                        <div
                          key={topping.id}
                          onClick={() => toggleTopping(topping)}
                          className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 flex items-center gap-4 select-none relative overflow-hidden ${isSelected
                            ? "bg-gradient-to-br from-matcha to-matcha/80 shadow-lg shadow-matcha/30 scale-[1.02] ring-2 ring-matcha/50"
                            : "bg-white border-2 border-gray-100 hover:border-matcha/30 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                            }`}
                        >
                          {/* Checkmark indicator */}
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected
                            ? 'bg-white text-matcha scale-100 opacity-100'
                            : 'bg-gray-100 text-gray-300 scale-75 opacity-50 group-hover:opacity-100 group-hover:scale-90'
                            }`}>
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>

                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 shrink-0 ${isSelected
                            ? 'bg-white/20 shadow-inner'
                            : 'bg-gradient-to-br from-gold/20 to-amber-100'
                            }`}>
                            🧋
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0 pr-6">
                            <p className={`font-serif font-bold text-lg leading-tight mb-1 transition-colors ${isSelected ? 'text-white' : 'text-espresso'
                              }`}>
                              {topping.name}
                            </p>
                            <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-white/80' : 'text-matcha'
                              }`}>
                              +{formatPrice(topping.price_adjustment)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Other Modifier Groups (custom per product - e.g. Add-ons) */}
              {otherModifierGroups.map((group) => {
                const isRequired = (group as any).required || ((group as any).min_select && (group as any).min_select > 0)
                const hasSelection = (selectedOtherModifiers[group.id]?.length || 0) >= ((group as any).min_select || 1)

                return (
                  <div key={group.id} className="space-y-4">
                    <label className="text-sm font-bold text-espresso tracking-[0.15em] uppercase flex items-center gap-2 mb-5">
                      <span className={`w-2 h-2 rounded-full ${isRequired ? 'bg-matcha' : 'bg-coral'} inline-block`}></span>
                      {group.name}
                      {!isRequired && (
                        <span className="text-xs font-normal text-espresso-light ml-2">(Optional)</span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {group.modifiers.map((modifier) => {
                        const isSelected = !!(selectedOtherModifiers[group.id]?.find(m => m.id === modifier.id));
                        return (
                          <div
                            key={modifier.id}
                            onClick={() => toggleOtherModifier(group.id, modifier, (group as any).max_select || 99, isRequired)}
                            className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 flex flex-col gap-2 select-none relative min-h-[90px] ${isSelected
                              ? "bg-coral shadow-lg shadow-coral/30 border-2 border-coral"
                              : "bg-white border-2 border-gray-100 hover:border-coral/30 hover:shadow-md"
                              }`}
                          >
                            {/* Checkmark indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-white text-coral">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}

                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isSelected
                              ? 'bg-white/30'
                              : 'bg-coral/10'
                              }`}>
                              ✨
                            </div>

                            {/* Text - Full display */}
                            <div className="flex-1">
                              <p className={`font-bold text-sm leading-snug mb-1 ${isSelected ? 'text-white' : 'text-espresso'}`}>
                                {modifier.name}
                              </p>
                              <p className={`text-xs font-bold ${isSelected ? 'text-white/90' : 'text-coral'}`}>
                                {Number(modifier.price_adjustment) > 0 ? `+${formatPrice(modifier.price_adjustment)}` : 'Free'}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* No options message */}
              {!hasAnyOptions && (
                <div className="text-center py-8 text-espresso-light">
                  <p className="text-lg font-serif mb-2">Simple and delicious!</p>
                  <p className="text-sm">This item has no customization options.</p>
                </div>
              )}
            </div>

            {/* Sticky Footer - Very Compact */}
            <div className="shrink-0 bg-white border-t border-gray-100 p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
              <div className="flex items-center gap-3 w-full">
                {/* Quantity Stepper - Only show in add mode */}
                {!isEditMode && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100 h-12 shadow-sm shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-9 h-9 rounded-md hover:bg-gray-200 active:bg-gray-300 text-espresso disabled:opacity-30 transition-colors">
                      <Minus className="w-4 h-4 stroke-[3]" />
                    </Button>
                    <span className="w-7 text-center font-serif font-bold text-lg text-espresso">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-md hover:bg-gray-200 active:bg-gray-300 text-espresso transition-colors">
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </Button>
                  </div>
                )}

                {/* Add/Update Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={sizes.length > 0 && !selectedSize}
                  className="flex-1 h-12 rounded-lg bg-matcha text-white font-bold text-base tracking-wide hover:bg-matcha/90 active:bg-matcha/80 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 px-4 select-none"
                >
                  <span className="whitespace-nowrap">{isEditMode ? 'UPDATE ORDER' : 'ADD TO ORDER'}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm font-bold">{formatPrice(isEditMode ? unitPrice : totalPrice)}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
