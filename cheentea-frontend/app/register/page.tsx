"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, CheckCircle, AlertCircle, Loader2, User, Mail, AtSign, Lock, Phone, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { registerCustomer, resendVerificationEmail } from "@/lib/api"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        phone: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<{
        username: string;
        message: string;
    } | null>(null)
    const [isResending, setIsResending] = useState(false)
    const [resendMessage, setResendMessage] = useState<string | null>(null)

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        setError(null)
    }

    const handleResend = async () => {
        setIsResending(true)
        setResendMessage(null)
        try {
            const result = await resendVerificationEmail(formData.email)
            setResendMessage(result.message)
        } catch (err) {
            setResendMessage(err instanceof Error ? err.message : 'Failed to resend')
        } finally {
            setIsResending(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        // Basic validation
        if (!formData.name || !formData.email || !formData.username || !formData.password) {
            setError("Please fill in all required fields")
            setIsLoading(false)
            return
        }

        if (formData.username.length < 3) {
            setError("Username must be at least 3 characters")
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            setIsLoading(false)
            return
        }

        try {
            const result = await registerCustomer({
                name: formData.name,
                email: formData.email,
                username: formData.username.toLowerCase(),
                password: formData.password,
                phone: formData.phone || undefined,
            })

            setSuccess({
                username: result.username,
                message: result.message,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-matcha/5">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-cream-dark shadow-sm">
                <div className="max-w-md mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <Image
                                src="/chantea-logo.jpg"
                                alt="Chantea Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-serif font-bold text-espresso">Join Chantea</h1>
                            <p className="text-xs text-espresso-light font-sans tracking-wide uppercase">Rewards Program</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 sm:px-6 py-8">
                {success ? (
                    // Success State
                    <Card className="bg-white rounded-[2rem] shadow-premium border border-cream-dark/30 overflow-hidden">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-matcha/10 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-10 h-10 text-matcha" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-espresso mb-2">Verify Your Email</h2>
                                <p className="text-espresso-light">
                                    We've sent a verification link to <span className="font-semibold text-espresso">{formData.email}</span>
                                </p>
                            </div>

                            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex items-start gap-4 text-left">
                                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-orange-900 mb-1">Action Required</h4>
                                    <p className="text-sm text-orange-800 leading-relaxed">
                                        You must <strong>verify your email</strong> before you can use your account to earn stamps or redeem rewards at the kiosk.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-matcha/5 rounded-2xl p-6 border border-matcha/20 opacity-75">
                                <p className="text-sm text-espresso-light mb-2">Your username will be:</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge className="text-lg px-4 py-2 bg-matcha text-white font-mono">
                                        @{success.username}
                                    </Badge>
                                </div>
                            </div>

                            {/* Resend verification section */}
                            <div className="text-center space-y-3">
                                <p className="text-sm text-espresso-light">Didn't receive the email?</p>
                                <Button
                                    variant="outline"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="rounded-xl border-matcha/30 text-matcha hover:bg-matcha/5"
                                >
                                    {isResending ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </span>
                                    ) : (
                                        "Resend Verification Email"
                                    )}
                                </Button>
                                {resendMessage && (
                                    <p className="text-sm text-matcha font-medium flex items-center justify-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        {resendMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                ) : (
                    // Registration Form
                    <div className="space-y-6">
                        {/* Hero Card - Chantea Theme (matching logo) */}
                        <div
                            className="rounded-[2rem] shadow-xl overflow-hidden border border-gray-200 bg-white"
                        >
                            <div className="p-8 text-center bg-gradient-to-b from-matcha/5 to-transparent">
                                {/* Centered icon */}
                                <div className="w-20 h-20 rounded-2xl bg-matcha/10 flex items-center justify-center mx-auto mb-5">
                                    <span className="text-4xl">🎁</span>
                                </div>
                                {/* Main heading */}
                                <h2 className="text-3xl font-serif font-bold mb-2 text-espresso">Buy 10, Get 1 Free!</h2>
                                <p className="text-espresso-light text-base mb-4">Join Chantea Rewards and start earning</p>
                                {/* Badge at bottom */}
                                <div className="inline-flex items-center gap-2 bg-matcha/15 px-4 py-2 rounded-full text-sm font-medium text-matcha-dark">
                                    <span className="text-lg">✨</span>
                                    <span>Rewards Program</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Card - Enhanced with subtle gradient border */}
                        <Card className="relative bg-white rounded-[2rem] shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-matcha/5 via-transparent to-gold/5 pointer-events-none"></div>
                            <form onSubmit={handleSubmit} className="relative p-8 space-y-5">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-serif font-bold text-espresso">Create Your Account</h3>
                                    <p className="text-espresso-light text-sm mt-1">It only takes a minute</p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl text-red-700">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-espresso flex items-center gap-1">
                                        Full Name <span className="text-matcha">*</span>
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-light group-focus-within:text-matcha transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange("name")}
                                            className="pl-12 h-14 rounded-2xl border-2 border-cream-dark/50 bg-cream/30 focus:border-matcha focus:ring-2 focus:ring-matcha/20 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-espresso flex items-center gap-1">
                                        Email Address <span className="text-matcha">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-light group-focus-within:text-matcha transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange("email")}
                                            className="pl-12 h-14 rounded-2xl border-2 border-cream-dark/50 bg-cream/30 focus:border-matcha focus:ring-2 focus:ring-matcha/20 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-espresso flex items-center gap-1">
                                        Username <span className="text-matcha">*</span>
                                    </label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-light group-focus-within:text-matcha transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="johndoe"
                                            value={formData.username}
                                            onChange={handleChange("username")}
                                            className="pl-12 h-14 rounded-2xl border-2 border-cream-dark/50 bg-cream/30 focus:border-matcha focus:ring-2 focus:ring-matcha/20 focus:bg-white transition-all lowercase"
                                        />
                                    </div>
                                    <p className="text-xs text-espresso-light flex items-center gap-1.5 ml-1">
                                        <Gift className="w-3.5 h-3.5 text-matcha" />
                                        Use this at the kiosk to earn stamps
                                    </p>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-espresso flex items-center gap-1">
                                        Password <span className="text-matcha">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-light group-focus-within:text-matcha transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange("password")}
                                            className="pl-12 h-14 rounded-2xl border-2 border-cream-dark/50 bg-cream/30 focus:border-matcha focus:ring-2 focus:ring-matcha/20 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-espresso-light ml-1">Minimum 6 characters</p>
                                </div>

                                {/* Phone (Optional) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-espresso">
                                        Phone Number <span className="text-espresso-light font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-light group-focus-within:text-matcha transition-colors" />
                                        <Input
                                            type="tel"
                                            placeholder="09123456789"
                                            value={formData.phone}
                                            onChange={handleChange("phone")}
                                            className="pl-12 h-14 rounded-2xl border-2 border-cream-dark/50 bg-cream/30 focus:border-matcha focus:ring-2 focus:ring-matcha/20 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 text-lg font-bold text-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all mt-8 bg-matcha hover:bg-matcha/90"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Creating Account...
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Create Account
                                            <Sparkles className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </Card>

                        {/* How it works */}
                        <Card className="bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden">
                            <div className="p-6">
                                <h3 className="font-serif font-bold text-espresso mb-4">How it works</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-matcha/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-matcha font-bold">1</span>
                                        </div>
                                        <p className="text-sm text-espresso-light">Create your account with a unique username</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-matcha/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-matcha font-bold">2</span>
                                        </div>
                                        <p className="text-sm text-espresso-light">Enter your username at the kiosk when ordering</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-matcha/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-matcha font-bold">3</span>
                                        </div>
                                        <p className="text-sm text-espresso-light">Earn 1 stamp for every drink you order</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Gift className="w-4 h-4 text-gold-dark" />
                                        </div>
                                        <p className="text-sm text-espresso-light">Get a <strong>FREE drink</strong> at 10 stamps!</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
