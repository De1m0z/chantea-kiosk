"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import {
    Search,
    CheckCircle,
    Clock,
    Loader2,
    Receipt,
    User,
    MapPin,
    Package,
    RefreshCw,
    XCircle,
    DollarSign,
    AlertCircle,
    Utensils,
    ShoppingBag,
    ChefHat,
    Sparkles,
    Wifi,
    WifiOff
} from "lucide-react"
import { updateOrderStatus } from "@/lib/api"
import { Order } from "@/lib/types"
import { formatPrice } from "@/lib/format"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"

export default function CashierPage() {
    // Real-time orders with WebSocket connection
    const { orders, loading, connected, refetch } = useRealtimeOrders({
        statusFilter: ['pending', 'preparing', 'ready'],
        enableAudio: true,
    })

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null)

    // Keep selectedOrder in sync with real-time orders data
    // Use a ref to track the selected ID to avoid infinite loops
    const selectedOrderId = selectedOrder?.id
    useEffect(() => {
        if (selectedOrderId) {
            const updatedOrder = orders.find(o => o.id === selectedOrderId)
            if (updatedOrder) {
                // Only update if the order data changed (compare by reference from orders array)
                setSelectedOrder(updatedOrder)
            } else {
                // Order was removed (completed or cancelled), clear selection
                setSelectedOrder(null)
            }
        }
    }, [orders, selectedOrderId])

    // Show message temporarily
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    // Calculate order preparation progress based on item-level status
    const getOrderPreparationInfo = (order: Order) => {
        const items = order.items || []
        const totalItems = items.length
        const readyItems = items.filter(item => (item.status || 'pending') === 'ready').length
        const preparingItems = items.filter(item => (item.status || 'pending') === 'preparing').length

        // Determine effective order status based on items
        let effectiveStatus: 'pending' | 'preparing' | 'ready' = 'pending'
        if (readyItems === totalItems && totalItems > 0) {
            effectiveStatus = 'ready'
        } else if (readyItems > 0 || preparingItems > 0) {
            effectiveStatus = 'preparing'
        }

        return { totalItems, readyItems, preparingItems, effectiveStatus, allReady: readyItems === totalItems && totalItems > 0 }
    }

    const filteredOrders = orders.filter(order => {
        if (activeStatusFilter && order.status !== activeStatusFilter) return false

        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        const orderId = String(order.id).padStart(3, '0')
        return orderId.includes(query) ||
            order.customer?.name?.toLowerCase().includes(query)
    })

    const handleConfirmOrder = async (orderId: number) => {
        setConfirming(true)
        try {
            await updateOrderStatus(orderId, 'completed')
            showMessage('success', `Order #${String(orderId).padStart(3, '0')} completed!`)
            setSelectedOrder(null)
            // Real-time update will come via WebSocket
            refetch()
        } catch (err) {
            console.error('Failed to confirm order:', err)
            showMessage('error', 'Failed to confirm order')
        } finally {
            setConfirming(false)
        }
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return {
                color: 'bg-amber-500',
                textColor: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                icon: Clock,
                label: 'Pending'
            }
            case 'preparing': return {
                color: 'bg-blue-500',
                textColor: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                icon: ChefHat,
                label: 'Preparing'
            }
            case 'ready': return {
                color: 'bg-[#5C8D5C]',
                textColor: 'text-[#5C8D5C]',
                bgColor: 'bg-[#5C8D5C]/10',
                borderColor: 'border-[#5C8D5C]/30',
                icon: CheckCircle,
                label: 'Ready'
            }
            default: return {
                color: 'bg-gray-500',
                textColor: 'text-gray-600',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                icon: Clock,
                label: status
            }
        }
    }

    // Count orders by status
    const readyCount = orders.filter(o => o.status === 'ready').length
    const pendingCount = orders.filter(o => o.status === 'pending').length
    const preparingCount = orders.filter(o => o.status === 'preparing').length

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-[#5C8D5C]/5 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-[#5C8D5C]/10 rounded-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[#5C8D5C]" />
                    </div>
                    <p className="font-serif text-xl text-[#5D4037]">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#5C8D5C]/5 to-transparent -z-10" />
            <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#5C8D5C]/10 rounded-full blur-3xl -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-premium group cursor-pointer transition-transform hover:scale-105">
                                <Image
                                    src="/chantea-logo.jpg"
                                    alt="Chantea"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif font-black text-[#5D4037] tracking-tight">Cashier Station</h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C8D5C] animate-pulse" />
                                    <p className="text-xs font-bold text-[#5C8D5C] uppercase tracking-widest">Live Integration</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Status Summary Pills - Now Clickable Filters */}
                            <div className="hidden md:flex items-center gap-3 bg-gray-100/50 p-1.5 rounded-xl border border-gray-200/50">
                                <button
                                    onClick={() => setActiveStatusFilter(curr => curr === 'ready' ? null : 'ready')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeStatusFilter === 'ready'
                                        ? 'bg-white shadow-sm ring-2 ring-[#5C8D5C]/20 scale-105'
                                        : 'hover:bg-white/50'
                                        }`}
                                >
                                    <span className="w-2 h-2 bg-[#5C8D5C] rounded-full" />
                                    <span className="text-sm font-bold text-[#5D4037]">{readyCount} <span className="text-gray-500 font-normal">Ready</span></span>
                                </button>
                                <button
                                    onClick={() => setActiveStatusFilter(curr => curr === 'pending' ? null : 'pending')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeStatusFilter === 'pending'
                                        ? 'bg-white shadow-sm ring-2 ring-amber-500/20 scale-105'
                                        : 'hover:bg-white/50'
                                        }`}
                                >
                                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                    <span className="text-sm font-bold text-[#5D4037]">{pendingCount} <span className="text-gray-500 font-normal">Pending</span></span>
                                </button>
                                <button
                                    onClick={() => setActiveStatusFilter(curr => curr === 'preparing' ? null : 'preparing')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeStatusFilter === 'preparing'
                                        ? 'bg-white shadow-sm ring-2 ring-blue-500/20 scale-105'
                                        : 'hover:bg-white/50'
                                        }`}
                                >
                                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-sm font-bold text-[#5D4037]">{preparingCount} <span className="text-gray-500 font-normal">Prep</span></span>
                                </button>
                            </div>

                            <div className="h-8 w-px bg-gray-200" />

                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5C8D5C] transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Search order #"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 w-64 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#5C8D5C]/50 focus:ring-4 focus:ring-[#5C8D5C]/5 transition-all"
                                />
                            </div>

                            {/* Connection Status */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${connected
                                ? 'bg-[#5C8D5C]/5 border-[#5C8D5C]/20 text-[#5C8D5C]'
                                : 'bg-amber-50 border-amber-200 text-amber-600'
                                }`}>
                                {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                <span className="text-sm font-bold">{connected ? 'Online' : 'Reconnecting'}</span>
                            </div>

                            {/* Refresh */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={refetch}
                                className="w-11 h-11 rounded-xl border-gray-200 text-gray-400 hover:text-[#5C8D5C] hover:border-[#5C8D5C]/30 hover:bg-[#5C8D5C]/5 transition-all"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header >

            {/* Notification Banner */}
            {
                message && (
                    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-premium flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 border ${message.type === 'success'
                        ? 'bg-white border-matcha/20 text-espresso'
                        : 'bg-white border-red-200 text-red-600'
                        }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-matcha text-white shadow-lg shadow-matcha/30' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            }`}>
                            {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{message.text}</span>
                            <span className="text-sm opacity-60">Notification auto-dismisses in 3s</span>
                        </div>
                    </div>
                )
            }

            <main className="max-w-[1600px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Orders List */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif font-bold text-3xl text-[#5D4037] flex items-center gap-3">
                                Active Orders
                                <Badge className="bg-[#5D4037] text-white hover:bg-[#5D4037]/90 border-0 px-3 py-1 text-sm rounded-lg">
                                    {filteredOrders.length}
                                </Badge>
                            </h2>
                        </div>

                        <ScrollArea className="h-[calc(100vh-220px)] pr-6 -mr-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 pr-2 pb-20">
                                {filteredOrders.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <Receipt className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="font-serif font-bold text-2xl text-[#5D4037] mb-2">No active orders</h3>
                                        <p className="text-gray-500 max-w-sm text-center">
                                            New orders will appear here instantly. Time to brew some tea! 🍵
                                        </p>
                                    </div>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const prepInfo = getOrderPreparationInfo(order)
                                        const statusInfo = getStatusInfo(prepInfo.effectiveStatus)
                                        const StatusIcon = statusInfo.icon
                                        const isSelected = selectedOrder?.id === order.id
                                        const isReady = prepInfo.allReady

                                        return (
                                            <div
                                                key={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className={`group relative bg-white rounded-[20px] p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isSelected
                                                    ? 'ring-2 ring-[#5C8D5C] shadow-premium scale-[1.02] z-10'
                                                    : 'border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#5C8D5C]/20'
                                                    } ${isReady ? 'bg-gradient-to-br from-white to-[#5C8D5C]/5' : ''}`}
                                            >
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</span>
                                                        <span className="text-3xl font-black text-[#5D4037] tracking-tight group-hover:text-[#5C8D5C] transition-colors">
                                                            #{String(order.id).padStart(3, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className={`flex items-center gap-1.5 pl-3 pr-4 py-1.5 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                                                            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.textColor}`} />
                                                            <span className={`text-xs font-bold ${statusInfo.textColor}`}>{statusInfo.label}</span>
                                                        </div>
                                                        {prepInfo.totalItems > 0 && (
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                {prepInfo.readyItems}/{prepInfo.totalItems} items ready
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Separator */}
                                                <div className="h-px bg-gray-100 mb-4" />

                                                {/* Details */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-[#5D4037] line-clamp-1">
                                                                    {order.customer?.name || 'Walk-in'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="font-black text-lg text-[#5C8D5C]">
                                                            {formatPrice(order.total)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <ShoppingBag className="w-3.5 h-3.5" />
                                                            <span>{order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>{new Date(order.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Order Details Panel */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-premium border border-white/50 sticky top-28 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                            {selectedOrder ? (
                                <>
                                    {/* Panel Header */}
                                    <div className="relative p-8 pb-10 bg-gradient-to-br from-[#5D4037] to-[#5D4037]/95 text-white overflow-hidden shrink-0">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />

                                        <div className="relative z-10 text-center">
                                            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-3">Selected Order</p>
                                            <h2 className="text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80">
                                                #{String(selectedOrder.id).padStart(3, '0')}
                                            </h2>
                                            <div className="flex items-center justify-center gap-3">
                                                {(() => {
                                                    const prepInfo = getOrderPreparationInfo(selectedOrder)
                                                    return (
                                                        <Badge className={`${getStatusInfo(prepInfo.effectiveStatus).color} text-white border-0 px-4 py-1.5 text-sm font-bold shadow-lg`}>
                                                            {prepInfo.effectiveStatus.toUpperCase()}
                                                        </Badge>
                                                    )
                                                })()}
                                                <Badge className="bg-white/10 text-white hover:bg-white/20 border-0 px-4 py-1.5 text-sm font-bold backdrop-blur-md">
                                                    {selectedOrder.order_type === 'dine-in' ? 'Dine In' : 'Take Out'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Scroll Area */}
                                    <ScrollArea className="flex-1 bg-gray-50/50">
                                        <div className="p-6 space-y-6">
                                            {/* Customer Card */}
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#5C8D5C]/10 flex items-center justify-center shrink-0">
                                                    <User className="w-6 h-6 text-[#5C8D5C]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Customer</p>
                                                    <p className="font-bold text-[#5D4037] text-lg">{selectedOrder.customer?.name || 'Walk-in Customer'}</p>
                                                </div>
                                            </div>

                                            {/* Items List */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 px-2">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</span>
                                                </div>

                                                <div className="space-y-3">
                                                    {selectedOrder.items.map((item, idx) => (
                                                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-[#5D4037] shrink-0 text-sm">
                                                                {item.quantity}x
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <p className="font-bold text-[#5D4037] truncate">
                                                                        {item.product?.name || `Product #${item.product_id}`}
                                                                    </p>
                                                                    <p className="font-bold text-[#5D4037] shrink-0">{formatPrice(item.line_total)}</p>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                                    {item.product_size && (
                                                                        <span className="text-[10px] uppercase font-bold bg-[#5C8D5C]/10 text-[#5C8D5C] px-2 py-1 rounded-md">
                                                                            {item.product_size.size}
                                                                        </span>
                                                                    )}
                                                                    {item.modifiers?.map((mod) => (
                                                                        <span key={mod.id} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                                            {mod.modifier?.name}
                                                                        </span>
                                                                    ))}
                                                                    {item.is_free_reward && (
                                                                        <span className="text-[10px] font-bold bg-gold/20 text-gold-dark px-2 py-1 rounded-md flex items-center gap-1">
                                                                            <Sparkles className="w-2.5 h-2.5" /> Reward
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Totals */}
                                            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                                                <div className="flex justify-between text-gray-500 text-sm">
                                                    <span>Subtotal</span>
                                                    <span className="font-medium text-[#5D4037]">{formatPrice(selectedOrder.subtotal)}</span>
                                                </div>
                                                {Number(selectedOrder.discount) > 0 && (
                                                    <div className="flex justify-between text-[#5C8D5C] text-sm">
                                                        <span>Discount</span>
                                                        <span className="font-bold">-{formatPrice(selectedOrder.discount)}</span>
                                                    </div>
                                                )}
                                                <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-2" />
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-lg text-[#5D4037]">Total Amount</span>
                                                    <span className="font-black text-3xl text-[#5C8D5C]">{formatPrice(selectedOrder.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>

                                    {/* Action Bar */}
                                    <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                                        <div className="flex gap-4">
                                            {(() => {
                                                const prepInfo = getOrderPreparationInfo(selectedOrder)
                                                return prepInfo.allReady ? (
                                                    <Button
                                                        onClick={() => handleConfirmOrder(selectedOrder.id)}
                                                        disabled={confirming}
                                                        className="flex-1 h-14 bg-gradient-to-r from-[#5C8D5C] to-[#4A724A] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-bold text-lg group"
                                                    >
                                                        {confirming ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                                                        Complete Order
                                                    </Button>
                                                ) : (
                                                    <div className="flex-1 h-14 bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-gray-400 font-medium cursor-not-allowed">
                                                        <Clock className="w-5 h-5" />
                                                        {prepInfo.readyItems}/{prepInfo.totalItems} Items Ready
                                                    </div>
                                                )
                                            })()}
                                            {/* Cancel Order Button - Only Cashier can cancel */}
                                            <Button
                                                variant="outline"
                                                onClick={async () => {
                                                    if (confirm(`Are you sure you want to cancel Order #${String(selectedOrder.id).padStart(3, '0')}? This cannot be undone.`)) {
                                                        try {
                                                            await updateOrderStatus(selectedOrder.id, 'cancelled')
                                                            showMessage('success', `Order #${String(selectedOrder.id).padStart(3, '0')} cancelled`)
                                                            setSelectedOrder(null)
                                                            refetch()
                                                        } catch (err) {
                                                            console.error('Failed to cancel order:', err)
                                                            showMessage('error', 'Failed to cancel order')
                                                        }
                                                    }
                                                }}
                                                className="h-14 px-6 rounded-xl border-2 border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 transition-all font-bold"
                                            >
                                                Cancel Order
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedOrder(null)}
                                                className="h-14 w-14 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all shrink-0"
                                            >
                                                <XCircle className="w-6 h-6" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="relative w-40 h-40 mb-8">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#5C8D5C]/20 to-amber-200/20 rounded-full blur-3xl animate-pulse" />
                                        <div className="relative bg-white p-6 rounded-[2rem] shadow-premium border border-gray-100 rotate-3 transition-transform hover:rotate-6">
                                            <Receipt className="w-full h-full text-gray-300 stroke-[1.5]" />
                                        </div>
                                    </div>
                                    <h3 className="font-serif font-bold text-3xl text-[#5D4037] mb-3">
                                        Order Details
                                    </h3>
                                    <p className="text-gray-400 text-lg max-w-xs mx-auto leading-relaxed">
                                        Select an order to view the receipt and complete the transaction.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div >
    )
}
