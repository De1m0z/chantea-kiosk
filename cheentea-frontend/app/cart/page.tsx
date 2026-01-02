"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Gift, Pencil, Loader2, CheckCircle, AlertCircle, AtSign, Sparkles, ChevronRight, RotateCcw } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/format"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createOrderWithLoyalty, getModifierGroups, lookupCustomerByUsername, previewStamps, LoyaltyCustomer } from "@/lib/api"
import { ModifierGroup, CartItem } from "@/lib/types"
import { ProductCustomizationModal } from "@/components/product-customization-modal"
import { LoyaltyModal, FreeDrinkSelection } from "@/components/loyalty-modal"
import { useReverbStatus } from "@/hooks/useReverbStatus"


export default function CartPage() {
  const router = useRouter()
  const {
    items,
    updateItemQuantity,
    removeItem,
    updateItem,
    subtotal,
    serviceFee,
    total,
    orderType,
    clearCart
  } = useCart()

  console.log('CartPage Render:', { itemsLength: items.length, subtotal, total }) // Debug log
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Edit item state
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])

  // Loyalty state
  const [username, setUsername] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<LoyaltyCustomer | null>(null)
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null)
  const [stampsToEarn, setStampsToEarn] = useState(0)
  const [redeemFreeDrink, setRedeemFreeDrink] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false)

  // Check Reverb connection status
  const { isConnected: isReverbConnected, isChecking: isCheckingReverb } = useReverbStatus()

  // Fetch modifier groups for editing
  useEffect(() => {
    async function fetchModifiers() {
      try {
        const groups = await getModifierGroups()
        setModifierGroups(groups)
      } catch (err) {
        console.error('Failed to fetch modifier groups:', err)
      }
    }
    fetchModifiers()
  }, [])

  // Preview stamps when items change
  useEffect(() => {
    async function fetchStampsPreview() {
      if (items.length === 0) {
        setStampsToEarn(0)
        return
      }
      try {
        const preview = await previewStamps(
          items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity
          }))
        )
        setStampsToEarn(preview.stamps_to_earn)
      } catch (err) {
        console.error('Failed to preview stamps:', err)
      }
    }
    fetchStampsPreview()
  }, [items])

  const handleLookupUsername = async () => {
    if (!username.trim()) return

    setIsLookingUp(true)
    setLoyaltyError(null)

    try {
      const customer = await lookupCustomerByUsername(username.toLowerCase())
      setLoyaltyCustomer(customer)
    } catch (err) {
      setLoyaltyCustomer(null)
      setLoyaltyError(err instanceof Error ? err.message : "Account not found")
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleClearLoyalty = () => {
    setLoyaltyCustomer(null)
    setUsername("")
    setLoyaltyError(null)
    setRedeemFreeDrink(false)
  }

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  // Open loyalty modal instead of placing order directly
  const handlePlaceOrderClick = () => {
    if (items.length === 0) return

    // Block orders if Reverb is not connected
    if (!isReverbConnected) {
      toast.error("System Temporarily Unavailable", {
        description: "Please wait for the connection to be restored before placing your order.",
        duration: 5000,
      })
      return
    }

    setShowLoyaltyModal(true)
  }

  // Actually place the order (called from modal)
  const handlePlaceOrder = async (loyaltyUsername?: string, shouldRedeemFreeDrink?: boolean, freeDrinkSelection?: FreeDrinkSelection) => {
    if (items.length === 0) return

    setShowLoyaltyModal(false)
    setIsPlacingOrder(true)

    // Minimum loading time for better UX
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500))

    try {
      // Prepare payload
      const orderItems: Array<{
        product_id: number;
        product_size_id: number;
        quantity: number;
        modifier_ids: number[];
        is_free_reward?: boolean;
        free_drink_base_price?: number;
      }> = items.map(item => {
        const modifierIds: number[] = []

        // Add Sugar/Ice modifiers if present
        if (item.customization.sugarModifier) modifierIds.push(item.customization.sugarModifier.id)
        if (item.customization.iceModifier) modifierIds.push(item.customization.iceModifier.id)

        // Add Toppings modifiers
        item.customization.toppings.forEach(t => modifierIds.push(t.id))

        return {
          product_id: item.product.id,
          product_size_id: item.customization.size.id,
          quantity: item.quantity,
          modifier_ids: modifierIds
        }
      })

      // Add free drink to order if selected
      if (shouldRedeemFreeDrink && freeDrinkSelection) {
        const freeDrinkModifierIds: number[] = []
        if (freeDrinkSelection.sugarModifier) freeDrinkModifierIds.push(freeDrinkSelection.sugarModifier.id)
        if (freeDrinkSelection.iceModifier) freeDrinkModifierIds.push(freeDrinkSelection.iceModifier.id)
        freeDrinkSelection.toppings.forEach(t => freeDrinkModifierIds.push(t.id))

        orderItems.push({
          product_id: freeDrinkSelection.product.id,
          product_size_id: freeDrinkSelection.size.id,
          quantity: 1,
          modifier_ids: freeDrinkModifierIds,
          is_free_reward: true,
          free_drink_base_price: freeDrinkSelection.basePrice,
        })
      }

      // Create order with optional loyalty tracking (run in parallel with min loading time)
      const [order] = await Promise.all([
        createOrderWithLoyalty({
          order_type: orderType || 'take-out',
          username: loyaltyUsername,
          redeem_free_drink: shouldRedeemFreeDrink,
          items: orderItems
        }),
        minLoadingTime
      ])

      // Pass the order ID, item count, and loyalty info to confirmation page
      // Note: stamps are PENDING until order is completed
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      const loyaltyParam = order.loyalty ? `&stamps_pending=${order.loyalty.stamps_pending}&current=${order.loyalty.current_stamps}` : ''
      router.push(`/order-confirmation?order=${order.id}&items=${itemCount}${loyaltyParam}`)
    } catch (error) {
      console.error("Failed to place order:", error)
      toast.error("Failed to place order", {
        description: "Please try again or check your connection.",
        duration: 4000,
      })
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Full-screen loading overlay when placing order */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-matcha/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-24 h-24 bg-matcha rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-espresso mb-2">Processing Order</h2>
          <p className="text-espresso-light text-lg">Please wait while we prepare your order...</p>
          <div className="mt-8 flex gap-2">
            <div className="w-3 h-3 bg-matcha rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-matcha rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-matcha rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-cream-dark shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-espresso">Your Order</h1>
                <p className="text-xs text-espresso-light font-sans tracking-wide uppercase">{items.length} items in cart</p>
              </div>
            </div>
            {items.length > 0 && (
              <span className="hidden"></span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {items.length === 0 ? (
          // Empty Cart State
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-40 h-40 bg-gradient-to-br from-matcha-light/30 to-cream rounded-full flex items-center justify-center mb-8 shadow-lg border border-cream-dark/20">
              <span className="text-6xl">🛒</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-espresso mb-3">Your cart is empty</h2>
            <p className="text-espresso-light text-lg mb-8 font-sans max-w-md">Looks like you haven&apos;t added any delicious drinks yet. Our menu is waiting!</p>
            <Link href="/">
              <Button className="h-14 px-8 text-lg font-bold bg-matcha text-white hover:bg-matcha/90 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                🍵 Browse Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleEditItem(item)}
                  className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex gap-4 cursor-pointer active:scale-[0.99]"
                >
                  {/* Product Thumbnail - Smaller & Compact */}
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-matcha-light/30 to-cream">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                        🧋
                      </div>
                    )}
                    {/* Item number badge - Smaller */}
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-espresso shadow-sm">
                      {index + 1}
                    </div>
                  </div>

                  {/* Product Info - Simplified */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-espresso leading-tight pr-2">
                        {item.product.name}
                      </h3>
                      <p className="text-matcha font-bold text-base shrink-0">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      {/* Subtitle / Hint */}
                      <div className="text-xs text-espresso-light/70 font-medium flex items-center gap-1 group-hover:text-matcha transition-colors">
                        <Pencil className="w-3 h-3" />
                        Tap to view details
                      </div>

                      {/* Quantity Controls - Compact & Stop Propagation */}
                      <div
                        className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-md hover:bg-white text-espresso-light hover:text-espresso"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold text-espresso w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-md hover:bg-white text-espresso-light hover:text-espresso"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button - Absolute or separate? Keeping it cleaner without absolute for now, maybe on right side? */}
                  {/* Re-adding delete button but positioned to not interfere with click */}
                  <div className="flex flex-col justify-center border-l border-gray-100 pl-3 ml-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-matcha/10 to-transparent px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif font-bold text-espresso flex items-center gap-2">
                    📋 Order Summary
                  </h2>
                  <span className="text-sm text-espresso-light bg-white px-3 py-1 rounded-full shadow-sm">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3 font-sans">
                  <div className="flex justify-between text-espresso-light mb-2">
                    <span>Subtotal</span>
                    <span className="font-semibold text-black">{formatPrice(subtotal)}</span>
                  </div>
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-espresso-light mb-2">
                      <span>Service Fee</span>
                      <span className="font-semibold text-black">{formatPrice(serviceFee)}</span>
                    </div>
                  )}
                  {orderType && (
                    <div className="flex justify-between text-espresso-light">
                      <span>Order Type</span>
                      <span className="font-semibold text-matcha capitalize flex items-center gap-1">
                        {orderType === 'dine-in' ? '🍽️ Dine In' : '📦 Take Out'}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-espresso">Total</span>
                      <span className="text-3xl font-serif font-bold text-matcha">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}
      </main>

      {/* Sticky Footer - Place Order Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40 p-4">
          <div className="max-w-4xl mx-auto flex gap-3 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(true)}
              disabled={isPlacingOrder}
              className="h-16 px-4 sm:px-6 text-base sm:text-lg font-bold border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 rounded-2xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shrink-0"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Start Over</span>
              <span className="sm:hidden">Restart</span>
            </Button>

            <Link href="/menu" className="flex-1">
              <Button
                variant="outline"
                disabled={isPlacingOrder}
                className="w-full h-16 text-base sm:text-lg font-bold border-2 border-matcha text-matcha hover:bg-matcha/5 hover:border-matcha hover:text-matcha-dark rounded-2xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Order More</span>
              </Button>
            </Link>

            <Button
              onClick={handlePlaceOrderClick}
              disabled={isPlacingOrder || !isReverbConnected || isCheckingReverb}
              className={`flex-[1.5] h-16 text-xl font-bold rounded-2xl shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-4 disabled:cursor-not-allowed shrink-0 ${!isReverbConnected ? 'bg-gray-400 hover:bg-gray-400' : 'bg-matcha text-white hover:bg-matcha/90 active:bg-matcha/80 hover:shadow-2xl'}`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : isCheckingReverb ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : !isReverbConnected ? (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  <span>System Offline</span>
                </div>
              ) : (
                <>
                  <ShoppingBag className="w-6 h-6" />
                  <span className="hidden sm:inline">Place Order</span>
                  <span className="sm:hidden">Order</span>
                  <span className="bg-white/20 px-3 py-1 rounded-xl text-base sm:text-lg font-bold ml-1">
                    {formatPrice(total)}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      <ProductCustomizationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingItem(null)
        }}
        product={editingItem?.product || null}
        modifierGroups={modifierGroups}
        editingItem={editingItem}
        onEditComplete={(updatedItem) => {
          if (editingItem) {
            updateItem(editingItem.id, {
              customization: updatedItem.customization,
              unitPrice: updatedItem.unitPrice,
              totalPrice: updatedItem.unitPrice * editingItem.quantity,
            })
          }
          setIsEditModalOpen(false)
          setEditingItem(null)
        }}
      />

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <RotateCcw className="w-8 h-8 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-serif font-bold text-espresso">
              Restart Order?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-espresso-light text-base">
              This will remove all {items.length} item{items.length !== 1 ? 's' : ''} from your cart and modify your order type. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3 mt-4">
            <AlertDialogCancel className="flex-1 h-12 rounded-xl font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Only clear items, NOT orderType, so we can go back to menu
                items.forEach(item => removeItem(item.id))
                toast.success("Order Restarted", {
                  description: "Your cart has been cleared",
                  duration: 2000,
                })
                router.push('/menu')
              }}
              className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              Yes, Start Over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loyalty Modal - Shows when Place Order is clicked */}
      <LoyaltyModal
        open={showLoyaltyModal}
        onClose={() => setShowLoyaltyModal(false)}
        onProceed={handlePlaceOrder}
        stampsToEarn={stampsToEarn}
      />
    </div>
  )
}
