'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getEcho } from '@/lib/echo'
import { getAllOrders } from '@/lib/api'
import { Order } from '@/lib/types'

interface OrderCreatedEvent {
    order: Order
}

interface OrderStatusUpdatedEvent {
    order: Order
    old_status: string
    new_status: string
}

interface UseRealtimeOrdersOptions {
    /** Filter orders by status */
    statusFilter?: string[]
    /** Enable audio notification for new orders */
    enableAudio?: boolean
    /** Callback when a new order is created */
    onOrderCreated?: (order: Order) => void
    /** Callback when order status changes */
    onStatusUpdated?: (order: Order, oldStatus: string, newStatus: string) => void
}

/**
 * Hook for real-time order updates
 * Used by Kitchen Display and Cashier pages
 */
export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
    const {
        statusFilter,
        enableAudio = false,
        onOrderCreated,
        onStatusUpdated,
    } = options

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [connected, setConnected] = useState(false)

    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize audio for notifications
    useEffect(() => {
        if (enableAudio && typeof window !== 'undefined') {
            audioRef.current = new Audio('/notification.mp3')
        }
    }, [enableAudio])

    // Play notification sound
    const playNotification = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(() => {
                // Audio play failed (user hasn't interacted with page yet)
            })
        }
    }, [])

    // Fetch initial orders
    const fetchOrders = useCallback(async () => {
        // Don't fetch if tab is in background (prevents timeouts from browser throttling)
        if (typeof document !== 'undefined' && document.hidden) {
            return
        }

        try {
            const allOrders = await getAllOrders()
            let filtered = allOrders

            if (statusFilter && statusFilter.length > 0) {
                filtered = allOrders.filter(o => statusFilter.includes(o.status))
            }

            // Sort by created_at descending
            filtered.sort((a, b) => {
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            })

            // Only update orders if the list has changed (simple length check or deep comparison could be better but heavy)
            // For now, straight update is safer to ensure we have fresh data
            setOrders(filtered)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch orders:', err)
            setError('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    // Setup WebSocket connection
    useEffect(() => {
        // Initial fetch
        fetchOrders()

        // Subscribe to orders channel
        let channel: ReturnType<ReturnType<typeof getEcho>['channel']> | null = null

        try {
            const echo = getEcho()
            channel = echo.channel('orders')

            // --- Handlers ---

            const handleOrderCreated = (event: OrderCreatedEvent) => {
                console.log('[Realtime] Order created:', event.order.id)
                const newOrder = event.order

                // Check if order matches filter
                if (!statusFilter || statusFilter.includes(newOrder.status)) {
                    setOrders(prev => {
                        // Avoid duplicates
                        if (prev.some(o => o.id === newOrder.id)) return prev
                        return [newOrder, ...prev]
                    })
                    if (enableAudio) playNotification()
                }
                onOrderCreated?.(newOrder)
                // Fetch fresh data reasonably soon to ensure relations are full
                fetchOrders()
            }

            const handleStatusUpdated = (event: OrderStatusUpdatedEvent) => {
                console.log('[Realtime] Order status updated:', event.order.id, event.old_status, '->', event.new_status)
                const updatedOrder = event.order

                setOrders(prev => {
                    const exists = prev.some(o => o.id === updatedOrder.id)

                    if (exists) {
                        // If order no longer matches filter, remove it
                        if (statusFilter && !statusFilter.includes(updatedOrder.status)) {
                            return prev.filter(o => o.id !== updatedOrder.id)
                        }
                        // Otherwise update it
                        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                    } else {
                        // If order now matches filter, add it
                        if (!statusFilter || statusFilter.includes(updatedOrder.status)) {
                            return [updatedOrder, ...prev]
                        }
                    }
                    return prev
                })

                if (enableAudio && event.new_status === 'ready') playNotification()
                onStatusUpdated?.(updatedOrder, event.old_status, event.new_status)
            }

            // --- Listeners (Robustness against naming variations) ---
            channel.listen('.order.created', handleOrderCreated)
            channel.listen('order.created', handleOrderCreated)
            channel.listen('OrderCreated', handleOrderCreated)

            channel.listen('.order.status.updated', handleStatusUpdated)
            channel.listen('order.status.updated', handleStatusUpdated)
            channel.listen('OrderStatusUpdated', handleStatusUpdated)

            setConnected(true)
            console.log('[Realtime] Connected to orders channel')

        } catch (err) {
            console.error('[Realtime] Failed to connect:', err)
            setConnected(false)
            // Fallback to polling if WebSocket fails
            const pollInterval = setInterval(fetchOrders, 15000) // Poll every 15s if WS fails
            return () => clearInterval(pollInterval)
        }

        // Listen for visibility change to refetch when user comes back
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('[Realtime] Tab visible, refreshing orders...')
                fetchOrders()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            if (channel) {
                channel.stopListening('.order.created')
                channel.stopListening('order.created')
                channel.stopListening('OrderCreated')
                channel.stopListening('.order.status.updated')
                channel.stopListening('order.status.updated')
                channel.stopListening('OrderStatusUpdated')

                getEcho().leave('orders')
            }
        }
    }, [fetchOrders, statusFilter, enableAudio, playNotification, onOrderCreated, onStatusUpdated])

    return {
        orders,
        loading,
        error,
        connected,
        refetch: fetchOrders,
    }
}
