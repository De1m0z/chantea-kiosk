'use client'

import { useState, useEffect } from 'react'
import type { getEcho as getEchoFactory } from '@/lib/echo'
import { IS_DEMO_MODE } from '@/lib/site-path'

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

        if (IS_DEMO_MODE) {
            setConnected(true)
            setStatus('pending')

            const preparingTimer = setTimeout(() => {
                setStatus('preparing')
                onStatusChange?.('preparing', 'pending')
            }, 4000)

            const readyTimer = setTimeout(() => {
                setStatus('ready')
                onStatusChange?.('ready', 'preparing')
                onReady?.()
            }, 9000)

            return () => {
                clearTimeout(preparingTimer)
                clearTimeout(readyTimer)
            }
        }

        let didCancel = false
        let channel: ReturnType<ReturnType<typeof getEchoFactory>['channel']> | null = null
        let leaveOrder: (() => void) | null = null

        const setupTracking = async () => {
            try {
                const { getEcho } = await import('@/lib/echo')
                if (didCancel) return

                const echo = getEcho()

                // Subscribe to the specific order channel
                channel = echo.channel(`order.${orderId}`)
                leaveOrder = () => echo.leave(`order.${orderId}`)

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
                if (didCancel) return
                console.error('[OrderTracking] Failed to connect:', err)
                setConnected(false)
            }
        }

        setupTracking()

        // Cleanup
        return () => {
            didCancel = true
            if (channel) {
                channel.stopListening('.order.status.updated')
                leaveOrder?.()
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
