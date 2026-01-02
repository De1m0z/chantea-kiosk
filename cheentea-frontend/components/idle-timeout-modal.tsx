"use client"

import { useEffect, useState } from 'react'
import { Clock, Coffee } from 'lucide-react'

interface IdleTimeoutModalProps {
    isOpen: boolean
    onCancel: () => void
    countdownSeconds?: number
}

export function IdleTimeoutModal({ isOpen, onCancel, countdownSeconds = 5 }: IdleTimeoutModalProps) {
    const [countdown, setCountdown] = useState(countdownSeconds)

    useEffect(() => {
        if (!isOpen) {
            setCountdown(countdownSeconds)
            return
        }

        if (countdown <= 0) return

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen, countdown, countdownSeconds])

    if (!isOpen) return null

    const progress = (countdown / countdownSeconds) * 100

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-espresso/70 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[3rem] p-12 shadow-2xl max-w-lg w-full mx-8 animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-500 overflow-hidden">

                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(#5D4037 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />

                {/* Top decorative wave */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-matcha via-matcha-dark to-matcha" />

                <div className="relative">
                    {/* Tea cup icon with animation */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-matcha/20 rounded-full blur-2xl scale-150 animate-pulse" />

                            {/* Icon container */}
                            <div className="relative w-28 h-28 bg-gradient-to-br from-matcha-light via-matcha/20 to-cream rounded-full flex items-center justify-center border-4 border-matcha/30 shadow-lg">
                                <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
                                    🧋
                                </div>
                            </div>

                            {/* Floating steam particles */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
                                <div className="w-1.5 h-4 bg-matcha/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                                <div className="w-1.5 h-6 bg-matcha/20 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                                <div className="w-1.5 h-4 bg-matcha/30 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-serif font-bold text-center text-espresso mb-3">
                        Still there?
                    </h2>

                    {/* Message */}
                    <p className="text-center text-espresso-light text-lg mb-8 leading-relaxed">
                        Your session will end soon.<br />
                        <span className="text-sm opacity-75">Tap anywhere or the button below to stay.</span>
                    </p>

                    {/* Countdown Ring */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-32 h-32">
                            {/* Background ring */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="8"
                                />
                                {/* Progress ring */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={264}
                                    strokeDashoffset={264 - (264 * progress) / 100}
                                    className="transition-all duration-1000 ease-linear"
                                />
                                {/* Gradient definition */}
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8EC641" />
                                        <stop offset="100%" stopColor="#6BA52B" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Countdown number */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-espresso font-serif">{countdown}</span>
                                <span className="text-xs text-espresso-light uppercase tracking-wider font-bold mt-1">seconds</span>
                            </div>
                        </div>
                    </div>

                    {/* Status message */}
                    <div className="flex items-center justify-center gap-2 text-espresso-light mb-6 bg-cream/50 py-3 px-6 rounded-2xl mx-auto w-fit">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-medium">Returning to homepage...</span>
                    </div>

                    {/* Tap anywhere prompt */}
                    <div className="text-center py-6 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-3 text-matcha font-bold text-lg mb-2">
                            <span className="animate-bounce">👆</span>
                            <span>Tap anywhere to continue</span>
                        </div>
                        <p className="text-xs text-espresso-light/60">
                            Your cart will be cleared when time runs out
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
