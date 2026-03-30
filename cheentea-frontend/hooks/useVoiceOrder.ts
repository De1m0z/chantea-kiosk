"use client"

import { useState, useCallback, useRef } from 'react'
import { processVoiceOrder, VoiceOrderResult } from '@/lib/api'

type VoiceOrderState = 'idle' | 'listening' | 'processing' | 'done' | 'error'

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionErrorEvent {
    error: string
    message?: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition
        webkitSpeechRecognition: new () => SpeechRecognition
    }
}

export function useVoiceOrder() {
    const [state, setState] = useState<VoiceOrderState>('idle')
    const [transcript, setTranscript] = useState('')
    const [interimTranscript, setInterimTranscript] = useState('')
    const [result, setResult] = useState<VoiceOrderResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const manualStopRef = useRef(false)

    const isSupported = typeof window !== 'undefined' && (
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    )

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser.')
            setState('error')
            return
        }

        setTranscript('')
        setInterimTranscript('')
        setResult(null)
        setError(null)
        manualStopRef.current = false

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setState('listening')
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let final = ''
            let interim = ''

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    final += result[0].transcript + ' '
                } else {
                    interim += result[0].transcript
                }
            }

            if (final) {
                setTranscript(prev => (prev + final).trim())
            }
            setInterimTranscript(interim)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return
            }
            setError(`Speech recognition error: ${event.error}`)
            setState('error')
        }

        recognition.onend = () => {
            if (!manualStopRef.current) {
                // Auto-ended (e.g., silence timeout) - that's okay
            }
            recognitionRef.current = null
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [isSupported])

    const stopListening = useCallback(() => {
        manualStopRef.current = true
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setInterimTranscript('')
    }, [])

    const submitTranscript = useCallback(async (text?: string) => {
        const finalTranscript = text || transcript
        if (!finalTranscript.trim()) {
            setError('No speech detected. Please try again.')
            setState('error')
            return
        }

        stopListening()
        setState('processing')

        try {
            const res = await processVoiceOrder(finalTranscript.trim())
            setResult(res)
            setState('done')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process order')
            setState('done')
        }
    }, [transcript, stopListening])

    const reset = useCallback(() => {
        stopListening()
        setState('idle')
        setTranscript('')
        setInterimTranscript('')
        setResult(null)
        setError(null)
    }, [stopListening])

    return {
        state,
        transcript,
        interimTranscript,
        result,
        error,
        isSupported,
        startListening,
        stopListening,
        submitTranscript,
        reset,
    }
}
