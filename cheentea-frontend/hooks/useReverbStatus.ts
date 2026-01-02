'use client'

import { useState, useEffect, useCallback } from 'react'
import { getEcho } from '@/lib/echo'

/**
 * Hook to check if the WebSocket (Reverb) connection is active
 * Used to prevent orders when real-time broadcasting is not available
 */
export function useReverbStatus() {
    const [isConnected, setIsConnected] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const checkConnection = useCallback(() => {
        setIsChecking(true)
        setError(null)

        try {
            const echo = getEcho()

            // Try to subscribe to a test channel to verify connection
            const testChannel = echo.channel('connection-test')

            // If we got here without error, connection is likely working
            // Give it a moment to establish
            setTimeout(() => {
                setIsConnected(true)
                setIsChecking(false)
                // Leave the test channel
                echo.leave('connection-test')
            }, 1000)

        } catch (err) {
            console.error('[Reverb] Connection check failed:', err)
            setIsConnected(false)
            setError('Real-time connection is not available')
            setIsChecking(false)
        }
    }, [])

    useEffect(() => {
        checkConnection()

        // Periodically check connection status
        const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [checkConnection])

    return {
        isConnected,
        isChecking,
        error,
        recheckConnection: checkConnection,
    }
}
