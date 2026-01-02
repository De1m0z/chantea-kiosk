"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, Loader2, CheckCircle, AlertCircle, AtSign, Sparkles } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { lookupCustomerByUsername } from "@/lib/api"
import Link from "next/link"

interface LoyaltyCustomer {
    username: string
    name: string
    stamps: number
    can_redeem: boolean
}

export default function LoyaltyPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [loyaltyCustomer, setLoyaltyCustomer] = useState<LoyaltyCustomer | null>(null)
    const [loyaltyError, setLoyaltyError] = useState<string | null>(null)

    const handleLookupUsername = async () => {
        if (!username.trim()) return

        setIsLookingUp(true)
        setLoyaltyError(null)

        try {
            const data = await lookupCustomerByUsername(username.trim())
            setLoyaltyCustomer({
                username: data.username,
                name: data.name,
                stamps: data.stamps,
                can_redeem: data.can_redeem
            })
        } catch (error) {
            setLoyaltyError("Account not found. Please check your username or register.")
            setLoyaltyCustomer(null)
        } finally {
            setIsLookingUp(false)
        }
    }

    const handleClearLoyalty = () => {
        setLoyaltyCustomer(null)
        setUsername("")
        setLoyaltyError(null)
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
            {/* Main Card */}
            <div className="max-w-md w-full relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white/60 relative overflow-hidden">

                    {/* Decorative Header Bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-matcha to-matcha-light"></div>

                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="absolute top-6 left-6 p-2 rounded-full hover:bg-black/5 text-espresso transition-colors z-20"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Switch Account Button (Only when logged in) */}
                    {loyaltyCustomer && (
                        <button
                            onClick={handleClearLoyalty}
                            className="absolute top-6 right-6 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors z-20"
                        >
                            Log Out
                        </button>
                    )}

                    {/* Content */}
                    <div className="flex flex-col items-center text-center mt-8 mb-8">
                        <div className="w-24 h-24 bg-matcha rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-matcha/20 mb-6 transform -rotate-3 border-4 border-white">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-serif font-black text-espresso mb-2">Chantea Rewards</h1>
                        <p className="text-espresso-light font-medium">
                            {loyaltyCustomer ? `Welcome back, ${loyaltyCustomer.name}!` : "Log in to check your points"}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {loyaltyCustomer ? (
                            // LOGGED IN STATE
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Stamps Grid */}
                                <div className="bg-white/50 rounded-3xl p-6 border border-white/50 shadow-inner">
                                    <div className="grid grid-cols-5 gap-3 mb-4">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`
                                                    aspect-square rounded-full flex items-center justify-center text-lg transition-all duration-500
                                                    ${i < (loyaltyCustomer.stamps % 10)
                                                        ? 'bg-matcha text-white shadow-lg scale-110'
                                                        : 'bg-gray-100 text-gray-300 scale-90'
                                                    }
                                                `}
                                            >
                                                {i < (loyaltyCustomer.stamps % 10) ? '🍵' : '•'}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-sm px-2">
                                        <span className="font-bold text-matcha text-lg">
                                            {loyaltyCustomer.stamps % 10}/10
                                        </span>
                                        <span className="text-espresso-light font-medium text-xs uppercase tracking-wider">
                                            {10 - (loyaltyCustomer.stamps % 10)} to free drink
                                        </span>
                                    </div>
                                </div>

                                {/* Reward Banner */}
                                {loyaltyCustomer.can_redeem && (
                                    <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-2xl p-5 border border-amber-200 shadow-sm animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">🎁</div>
                                            <div className="flex-1 text-left">
                                                <h3 className="font-bold text-espresso text-lg leading-none mb-1">Free Drink!</h3>
                                                <p className="text-espresso-light/80 text-xs">Redeem on your next order.</p>
                                            </div>
                                            <Badge className="bg-amber-500 text-white border-0">Claim</Badge>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => router.push("/menu")}
                                    className="w-full bg-matcha hover:bg-matcha-dark text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-matcha/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                                >
                                    Start Ordering
                                </button>
                            </div>
                        ) : (
                            // LOGGED OUT STATE
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Username Input */}
                                <div className="space-y-2 text-left">
                                    <label className="text-xs font-bold text-espresso-light uppercase tracking-wider ml-4">Username</label>
                                    <div className="relative">
                                        <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value)
                                                setLoyaltyError(null)
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLookupUsername()}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-matcha focus:bg-white transition-all outline-none text-lg font-medium text-espresso placeholder:text-gray-400"
                                        />
                                    </div>
                                    {loyaltyError && (
                                        <p className="text-red-500 text-sm ml-4 font-medium flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {loyaltyError}
                                        </p>
                                    )}
                                </div>

                                {/* Login Button */}
                                <button
                                    onClick={handleLookupUsername}
                                    disabled={isLookingUp || !username.trim()}
                                    className="w-full bg-matcha hover:bg-matcha-dark disabled:opacity-50 disabled:hover:bg-matcha text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-matcha/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    {isLookingUp ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Check Points"}
                                </button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-[#FAF9F6] px-2 text-gray-400 font-medium">or continue as</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/register" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 transition-colors gap-2 group shadow-sm">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                                        <span className="text-sm font-bold text-espresso">Register</span>
                                    </Link>
                                    <button
                                        onClick={() => router.push('/menu')}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 transition-colors gap-2 group shadow-sm"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">🏃</span>
                                        <span className="text-sm font-bold text-espresso">Guest</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Help */}
                <div className="mt-8 bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 text-center">
                    <h3 className="font-bold text-espresso text-sm mb-1">How it works</h3>
                    <p className="text-xs text-espresso-light">Buy 10 drinks • Get 1 Free • No expiration</p>
                </div>
            </div>
        </div>
    )
}
