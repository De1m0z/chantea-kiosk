"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Product, ProductSize, Modifier, CartItem } from '@/lib/types'
import { IdleTimeoutModal } from '@/components/idle-timeout-modal'

const IDLE_TIMEOUT_MS = 60000 // 60 seconds
const COUNTDOWN_SECONDS = 5 // 5 second countdown before redirect

type OrderType = 'dine-in' | 'take-out'

interface CartContextType {
    items: CartItem[]
    orderType: OrderType | null
    setOrderType: (type: OrderType) => void
    addItem: (item: Omit<CartItem, 'id'>) => void
    updateItemQuantity: (id: string, quantity: number) => void
    updateItem: (id: string, updates: Partial<Omit<CartItem, 'id'>>) => void
    removeItem: (id: string) => void
    clearCart: () => void
    totalItems: number
    subtotal: number
    serviceFee: number
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'cheentea-cart'
const ORDER_TYPE_STORAGE_KEY = 'cheentea-order-type'

// Pages where idle timeout should NOT apply (admin, cashier, kitchen)
const EXCLUDED_PATHS = ['/admin', '/cashier', '/kitchen', '/order-confirmation']

export function CartProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    // Initialize state from localStorage (client-side only)
    const [items, setItems] = useState<CartItem[]>([])
    const [orderType, setOrderTypeState] = useState<OrderType | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)

    // Idle timeout modal state
    const [showIdleModal, setShowIdleModal] = useState(false)

    // Idle timeout refs
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Load cart and order type from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY)
            if (savedCart) {
                setItems(JSON.parse(savedCart))
            }
            const savedOrderType = localStorage.getItem(ORDER_TYPE_STORAGE_KEY)
            if (savedOrderType === 'dine-in' || savedOrderType === 'take-out') {
                setOrderTypeState(savedOrderType)
            }
        } catch (e) {
            console.error('Failed to load cart from localStorage', e)
        }
        setIsHydrated(true)
    }, [])

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
            } catch (e) {
                console.error('Failed to save cart to localStorage', e)
            }
        }
    }, [items, isHydrated])

    // Persist order type to localStorage
    useEffect(() => {
        if (isHydrated) {
            try {
                if (orderType) {
                    localStorage.setItem(ORDER_TYPE_STORAGE_KEY, orderType)
                } else {
                    localStorage.removeItem(ORDER_TYPE_STORAGE_KEY)
                }
            } catch (e) {
                console.error('Failed to save order type to localStorage', e)
            }
        }
    }, [orderType, isHydrated])

    // Handle redirect after modal countdown
    useEffect(() => {
        if (showIdleModal) {
            redirectTimeoutRef.current = setTimeout(() => {
                // Clear cart and redirect to home
                setItems([])
                setOrderTypeState(null)
                localStorage.removeItem(CART_STORAGE_KEY)
                localStorage.removeItem(ORDER_TYPE_STORAGE_KEY)
                setShowIdleModal(false)
                router.push('/')
            }, COUNTDOWN_SECONDS * 1000)
        }

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current)
            }
        }
    }, [showIdleModal, router])

    // Handle canceling the idle modal
    const handleCancelIdleModal = useCallback(() => {
        setShowIdleModal(false)
        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current)
            redirectTimeoutRef.current = null
        }
    }, [])

    // Use ref to track showIdleModal for event handlers (avoids stale closure)
    const showIdleModalRef = useRef(showIdleModal)
    useEffect(() => {
        showIdleModalRef.current = showIdleModal
    }, [showIdleModal])

    // Idle timeout - show warning modal after 30s of inactivity (with or without cart items)
    useEffect(() => {
        // Don't run on excluded paths (admin, cashier, kitchen) or homepage
        const isExcludedPath = EXCLUDED_PATHS.some(path => pathname?.startsWith(path))
        const isHomePage = pathname === '/'
        if (isExcludedPath || isHomePage) {
            return
        }

        let localTimeoutId: NodeJS.Timeout | null = null

        const startIdleTimer = () => {
            if (localTimeoutId) {
                clearTimeout(localTimeoutId)
            }

            localTimeoutId = setTimeout(() => {
                // Show the warning modal
                setShowIdleModal(true)
            }, IDLE_TIMEOUT_MS)

            idleTimeoutRef.current = localTimeoutId
        }

        const handleActivity = () => {
            // If modal is showing, cancel it on any activity
            if (showIdleModalRef.current) {
                setShowIdleModal(false)
                if (redirectTimeoutRef.current) {
                    clearTimeout(redirectTimeoutRef.current)
                    redirectTimeoutRef.current = null
                }
            }
            startIdleTimer()
        }

        // Activity events (removed mousemove as it's too sensitive)
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

        // Start the initial timer
        startIdleTimer()

        // Add event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true })
        })

        // Cleanup
        return () => {
            if (localTimeoutId) {
                clearTimeout(localTimeoutId)
            }
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current)
            }
            activityEvents.forEach(event => {
                document.removeEventListener(event, handleActivity)
            })
        }
    }, [pathname]) // Only depend on pathname

    const setOrderType = useCallback((type: OrderType) => {
        setOrderTypeState(type)
    }, [])

    const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
        setItems(prev => {
            // Check if an identical item already exists in the cart
            const existingItemIndex = prev.findIndex(existing => {
                // Compare product ID
                if (existing.product.id !== item.product.id) return false

                // Compare size
                if (existing.customization.size.id !== item.customization.size.id) return false

                // Compare sugar level
                if (existing.customization.sugarLevel !== item.customization.sugarLevel) return false

                // Compare ice level
                if (existing.customization.iceLevel !== item.customization.iceLevel) return false

                // Compare sugar modifier
                if (existing.customization.sugarModifier?.id !== item.customization.sugarModifier?.id) return false

                // Compare ice modifier
                if (existing.customization.iceModifier?.id !== item.customization.iceModifier?.id) return false

                // Compare toppings (order doesn't matter)
                const existingToppingIds = existing.customization.toppings.map(t => t.id).sort()
                const newToppingIds = item.customization.toppings.map(t => t.id).sort()
                if (existingToppingIds.length !== newToppingIds.length) return false
                if (!existingToppingIds.every((id, idx) => id === newToppingIds[idx])) return false

                return true
            })

            if (existingItemIndex !== -1) {
                // Item exists, increase quantity
                return prev.map((existing, idx) => {
                    if (idx === existingItemIndex) {
                        const newQuantity = existing.quantity + item.quantity
                        return {
                            ...existing,
                            quantity: newQuantity,
                            totalPrice: existing.unitPrice * newQuantity
                        }
                    }
                    return existing
                })
            } else {
                // New item, add to cart
                const id = `${item.product.id}-${item.customization.size.id}-${Date.now()}`
                return [...prev, { ...item, id }]
            }
        })
    }, [])

    const updateItemQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(item => item.id !== id))
        } else {
            setItems(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
                        : item
                )
            )
        }
    }, [])

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }, [])

    const updateItem = useCallback((id: string, updates: Partial<Omit<CartItem, 'id'>>) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, ...updates }
                    : item
            )
        )
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
        setOrderTypeState(null) // Reset order type for kiosk mode
    }, [])

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const serviceFee = 0 // No service fee
    const total = subtotal

    return (
        <CartContext.Provider
            value={{
                items,
                orderType,
                setOrderType,
                addItem,
                updateItemQuantity,
                updateItem,
                removeItem,
                clearCart,
                totalItems,
                subtotal,
                serviceFee,
                total,
            }}
        >
            {children}
            <IdleTimeoutModal
                isOpen={showIdleModal}
                onCancel={handleCancelIdleModal}
                countdownSeconds={COUNTDOWN_SECONDS}
            />
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
