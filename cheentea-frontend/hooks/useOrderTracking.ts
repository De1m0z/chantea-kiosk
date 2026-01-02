'use client'

import { useState, useEffect, useCallback } from 'react'
import { getEcho } from '@/lib/echo'

interface OrderStatusUpdatedEvent {
    order: {
        id: number
        status: string
        // ... other order fields
    }
    old_status: string
    new_status: string
}

interface UseOrderTrackingOptions {
    /** Callback when order status changes */
    onStatusChange?: (newStatus: string, oldStatus: string) => void
    /** Callback when order is ready */
    onReady?: () => void
}

/**
 * Hook for tracking a specific order's status in real-time
 * Used by the Order Confirmation page on the Kiosk
 */
export function useOrderTracking(orderId: number | null, options: UseOrderTrackingOptions = {}) {
    const { onStatusChange, onReady } = options

    const [status, setStatus] = useState<string>('pending')
    const [connected, setConnected] = useState(false)

    const isReady = status === 'ready'
    const isPreparing = status === 'preparing'
    const isCompleted = status === 'completed'

    useEffect(() => {
        if (!orderId) return

        let channel: ReturnType<ReturnType<typeof getEcho>['channel']> | null = null

        try {
            const echo = getEcho()

            // Subscribe to the specific order channel
            channel = echo.channel(`order.${orderId}`)

            channel.listen('.order.status.updated', (event: OrderStatusUpdatedEvent) => {
                console.log('[OrderTracking] Status updated:', event.order.id, event.new_status)

                if (event.order.id === orderId) {
                    setStatus(event.new_status)
                    onStatusChange?.(event.new_status, event.old_status)

                    if (event.new_status === 'ready') {
                        onReady?.()
                    }
                }
            })

            setConnected(true)
            console.log(`[OrderTracking] Connected to order.${orderId} channel`)
        } catch (err) {
            console.error('[OrderTracking] Failed to connect:', err)
            setConnected(false)
        }

        // Cleanup
        return () => {
            if (channel) {
                channel.stopListening('.order.status.updated')
                getEcho().leave(`order.${orderId}`)
            }
        }
    }, [orderId, onStatusChange, onReady])

    return {
        status,
        isReady,
        isPreparing,
        isCompleted,
        connected,
    }
}
