'use client'

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Make Pusher available globally for Echo
if (typeof window !== 'undefined') {
    (window as unknown as Record<string, typeof Pusher>).Pusher = Pusher
}

// Singleton Echo instance
let echoInstance: Echo<'reverb'> | null = null

/**
 * Get the Laravel Echo instance for WebSocket connections
 * Uses Reverb as the broadcaster (compatible with Pusher protocol)
 */
export function getEcho(): Echo<'reverb'> {
    if (typeof window === 'undefined') {
        throw new Error('Echo can only be used in the browser')
    }

    if (!echoInstance) {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'cheentea-local-key',
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
            wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
            wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
            forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
        })

        // Debug connection status
        if (process.env.NODE_ENV === 'development') {
            console.log('[Echo] Initialized with config:', {
                host: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
                port: process.env.NEXT_PUBLIC_REVERB_PORT || '8080',
            })
        }
    }

    return echoInstance
}

/**
 * Disconnect and cleanup Echo instance
 */
export function disconnectEcho(): void {
    if (echoInstance) {
        echoInstance.disconnect()
        echoInstance = null
    }
}
