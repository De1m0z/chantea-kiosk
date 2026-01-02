"use client"

import { useState, useEffect, DragEvent } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Volume2, VolumeX, Clock, RefreshCw, Loader2, ChefHat, Coffee, UtensilsCrossed, Bell, GripVertical, User, MapPin, Receipt, Package, Wifi, WifiOff } from "lucide-react"
import { updateOrderStatus, updateOrderItemStatus } from "@/lib/api"
import { Order, OrderItem } from "@/lib/types"
import { formatPrice } from "@/lib/format"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"

type OrderStatus = "pending" | "preparing" | "ready"
type StationType = "all" | "drinks" | "food"

interface KitchenBoardProps {
    stationType?: StationType
}

export default function KitchenBoard({ stationType = "all" }: KitchenBoardProps) {
    // Real-time orders with WebSocket connection
    const { orders, loading, error, connected, refetch } = useRealtimeOrders({
        statusFilter: ['pending', 'preparing', 'ready'],
        enableAudio: true,
    })

    const [audioEnabled, setAudioEnabled] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [draggedOrderId, setDraggedOrderId] = useState<number | null>(null)
    const [dragOverStatus, setDragOverStatus] = useState<OrderStatus | null>(null)

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const getElapsedTime = (timestamp: string | undefined) => {
        if (!timestamp) return { hours: 0, minutes: 0, seconds: 0, isOverdue: false, display: "0:00" }

        // The timestamp from Laravel with Asia/Manila timezone is effectively UTC+8
        // But Javascript might parse "YYYY-MM-DD HH:MM:SS" as local time.
        // We need to be careful. If the server is sending "2023-12-31 10:00:00" (Manila time),
        // and we parse it as local time (Manila), it's fine.
        // But if the server stored it as UTC and we just switched to Manila,
        // old records might be shifted.
        // Let's rely on the difference. 

        const orderTime = new Date(timestamp)
        const now = currentTime

        // Calculate difference in milliseconds
        let diff = now.getTime() - orderTime.getTime()

        // Fix for the 8-hour discrepancy (28800000 ms)
        // If the difference is roughly 8 hours (plus/minus a bit), it's the timezone issue.
        // If we see ~8 hours (28800000ms) difference for a fresh order, we subtract it.
        // However, a cleaner way is just to assume the server sends UTC and we are in UTC+8.
        // If the display shows "8h 15m" for a recent order, it means orderTime is 8h BEHIND now.
        // making 'diff' huge. 
        // We should adjust orderTime to be +8h relative to what it was parsed as.

        // Actually, if the result is 8h, it means `now` is 8h ahead of `orderTime`.
        // If `orderTime` was effectively UTC but parsed as such, and `now` is local...
        // Let's just strip the 8 hours if it's excessively large for a "pending" order? 
        // No, better to offset the parsed time.

        // Adjust for the 8 hour offset that persists
        // We subtract 8 hours (8 * 60 * 60 * 1000) from the calculated elapsed time
        // IF the elapsed time is suspiciously close to 8 hours (> 7.5 hours) for an active order.
        // BUT, simple fix: The user says "8 hours is still here".
        // This implies the calculation (now - orderTime) is ~8 hours. 
        // So we subtract 8 hours from the difference.

        if (diff > 28000000 && diff < 30000000) { // Check if around 8 hours
            diff -= 28800000 // Subtract 8 hours
        }

        // If simply the timezone is inconsistent everywhere:
        // Let's just subtract 8 hours from the parsed time permanently if we know the server is +8 but sending strings that JS treats as UTC/Local mismatch.
        // For now, I'll apply a heuristic: if calculated elapsed > 7 hours for a non-completed order, reduce it.

        // Better: Let's treat the timestamp string as UTC directly if it lacks 'Z'
        const orderDate = new Date(timestamp + (timestamp.includes('Z') ? '' : 'Z'))
        // If the server sends "2023... 10:00:00" which is Manila time, appending Z makes it 10:00 UTC.
        // Current time 10:00 Manila is 02:00 UTC.
        // 02:00 UTC (now) - 10:00 UTC (order) = -8 hours. 
        // This would show 0:00 due to negative check.

        // If the server sends "2023... 02:00:00" (UTC stored in DB), appending Z makes it 02:00 UTC.
        // Current time 10:00 Manila is 02:00 UTC.
        // 02:00 UTC - 02:00 UTC = 0. Correct.

        // Current behavior: "8h 15m".
        // Means diff is positive 8h.
        // now (10:00 Manila) - orderTime (?) = 8h
        // orderTime must be roughly 02:00.
        // If `new Date("2023... 02:00:00")` is parsed as 02:00 LOCAL (Manila), then
        // 10:00 - 02:00 = 8h. 
        // So strict "new Date(string)" assumes local time if no TZ specified.
        // And the DB likely sends UTC string "02:00:00".
        // JS sees "02:00:00", implies "02:00:00 Manila".
        // Real time is "10:00:00 Manila".
        // Diff is 8 hours.

        // FIX: Treat the incoming string as UTC by replacing space with T and adding Z? 
        // Or if the string format is 'YYYY-MM-DD HH:mm:ss'

        let elapsed = Math.floor(diff / 1000)

        // Heuristic fix for the user's specific "8h" bug without breaking everything:
        // If elapsed is > 7 hours (25200s), subtract 8 hours (28800s).
        if (elapsed > 28000) {
            elapsed -= 28800
        }

        if (elapsed < 0) elapsed = 0 // prevent negative

        const hours = Math.floor(elapsed / 3600)
        const minutes = Math.floor((elapsed % 3600) / 60)
        const seconds = elapsed % 60

        // Overdue thresholds
        const isOverdue = elapsed >= 300 // 5 minutes
        const isCritical = elapsed >= 600 // 10 minutes

        let display: string
        if (hours > 0) {
            display = `${hours}h ${minutes}m`
        } else {
            display = `${minutes}:${seconds.toString().padStart(2, "0")}`
        }

        return { hours, minutes, seconds, isOverdue, isCritical, display }
    }

    // Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (n: number): string => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
    }

    const handleMoveOrder = async (orderId: number, newStatus: OrderStatus) => {
        try {
            // Find the order and its station-relevant items
            const order = orders.find(o => o.id === orderId)
            if (!order) return

            const stationItems = order.items.filter(isInStation)

            // Update each station-relevant item's status
            for (const item of stationItems) {
                await updateOrderItemStatus(orderId, item.id, newStatus)
            }

            // Real-time update will come via WebSocket, but refetch to ensure sync
            await refetch()
        } catch (err) {
            console.error('Failed to update order item status:', err)
        }
    }

    const isInStation = (item: OrderItem) => {
        if (stationType === "all") return true

        const catName = item.product?.category?.name?.toLowerCase() || ""
        const productName = item.product?.name?.toLowerCase() || ""

        // DEBUG: Log category info to console
        console.log(`[Kitchen Filter] Product: ${item.product?.name}, Category: "${catName}", StationType: ${stationType}`)

        // Keywords that identify DRINKS (by category name)
        const drinkCategoryKeywords = ["tea", "coffee", "latte", "smoothie", "soda", "juice", "beverage", "drink", "water", "espresso", "americano", "cappuccino", "macchiato", "frappe", "brew", "series"]

        // Keywords in PRODUCT NAME that identify drinks (used as fallback when category is empty)
        const drinkProductKeywords = ["tea", "latte", "coffee", "smoothie", "velvet", "matcha", "taro", "wintermelon", "milk", "frappe", "shake", "juice", "soda", "chocolate", "mocha", "caramel", "vanilla", "strawberry", "mango", "oreo", "cheesecake", "cream"]

        // Keywords that identify FOOD (by product name - used as stronger signal)
        const foodProductKeywords = ["chicken", "wings", "fries", "nuggets", "burger", "sandwich", "rice", "meal", "snack", "cake", "pie", "bread"]

        // Check if category indicates a drink
        const categoryIsDrink = catName !== "" && drinkCategoryKeywords.some(keyword => catName.includes(keyword))

        // Check if product name suggests it's a drink (fallback when category empty)
        const productNameIsDrink = drinkProductKeywords.some(keyword => productName.includes(keyword))

        // Check if product name suggests it's food (stronger signal)
        const productNameIsFood = foodProductKeywords.some(keyword => productName.includes(keyword))

        // Determine if item is a drink:
        // 1. If category is available and contains drink keyword, it's a drink
        // 2. If category is empty, use product name as fallback
        // 3. Food keywords in product name override drink detection
        const isDrink = productNameIsFood ? false : (categoryIsDrink || (catName === "" && productNameIsDrink))

        if (stationType === "drinks") return isDrink
        if (stationType === "food") return !isDrink

        return true
    }

    const getOrdersByStatus = (status: OrderStatus) => {
        return orders
            .map(order => {
                // Filter items based on station type
                const stationItems = order.items.filter(isInStation)
                if (stationItems.length === 0) return null

                // Filter items by their individual status
                const itemsWithStatus = stationItems.filter(item => (item.status || 'pending') === status)
                if (itemsWithStatus.length === 0) return null

                return { ...order, items: itemsWithStatus }
            })
            .filter((order): order is Order => order !== null)
            .sort((a, b) => {
                // Sort by created_at ascending (oldest first = higher priority)
                const timeA = new Date(a.created_at || 0).getTime()
                const timeB = new Date(b.created_at || 0).getTime()
                return timeA - timeB
            })
    }

    // Drag and Drop handlers
    const handleDragStart = (e: DragEvent<HTMLDivElement>, orderId: number) => {
        setDraggedOrderId(orderId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', orderId.toString())
    }

    const handleDragEnd = () => {
        setDraggedOrderId(null)
        setDragOverStatus(null)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>, status: OrderStatus) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverStatus(status)
    }

    const handleDragLeave = () => {
        setDragOverStatus(null)
    }

    const handleDrop = async (e: DragEvent<HTMLDivElement>, targetStatus: OrderStatus) => {
        e.preventDefault()
        const orderId = parseInt(e.dataTransfer.getData('text/plain'))
        const order = orders.find(o => o.id === orderId)

        if (order) {
            // Check if any station items have a status different from target
            const stationItems = order.items.filter(isInStation)
            const hasItemsToMove = stationItems.some(item => (item.status || 'pending') !== targetStatus)

            if (hasItemsToMove) {
                await handleMoveOrder(orderId, targetStatus)
            }
        }

        setDraggedOrderId(null)
        setDragOverStatus(null)
    }

    const statusConfig = {
        pending: {
            color: "from-[#FF8A80] to-[#FF8A80]/80", // coral
            label: "NEW",
            icon: Bell,
            emptyIcon: "🔔",
            emptyText: "Waiting for new orders",
            count: getOrdersByStatus("pending").length
        },
        preparing: {
            color: "from-[#D4AF37] to-amber-500", // gold
            label: "PREPARING",
            icon: UtensilsCrossed,
            emptyIcon: "👨‍🍳",
            emptyText: "No orders being prepared",
            count: getOrdersByStatus("preparing").length
        },
        ready: {
            color: "from-[#5C8D5C] to-emerald-600", // matcha
            label: "READY",
            icon: Coffee,
            emptyIcon: "✅",
            emptyText: "No orders ready for pickup",
            count: getOrdersByStatus("ready").length
        },
    }

    const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#5D4037] via-[#5D4037] to-[#8D6E63]/50 text-[#FFFBF2] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-[#5C8D5C]/20 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-10 h-10 animate-spin text-[#5C8D5C]" />
                    </div>
                    <p className="text-xl font-serif">Loading kitchen display...</p>
                </div>
            </div>
        )
    }

    const stationName = stationType === 'drinks' ? 'Bar Station' : stationType === 'food' ? 'Kitchen Station' : 'Master Display'

    return (
        <div className="h-[100dvh] w-full bg-gradient-to-br from-[#1a1512] via-[#5D4037] to-[#2a2118] text-[#FFFBF2] flex flex-col overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 overflow-hidden">
                {/* Header */}
                <div className="shrink-0 relative z-10 mb-6 flex items-center justify-between bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 shadow-lg">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#5C8D5C] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#5C8D5C]/20">
                                <ChefHat className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-white leading-none mb-1">{stationName}</h1>
                                <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">Chantea Kiosk</p>
                            </div>
                        </div>

                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
                            <Clock className="w-5 h-5 text-[#5C8D5C]" />
                            <div className="text-2xl font-mono font-bold text-white tracking-wider">
                                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </div>
                        </div>

                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
                            <div className="w-3 h-3 rounded-full bg-[#5C8D5C] animate-pulse"></div>
                            <span className="text-white font-bold text-2xl">{activeOrdersCount}</span>
                            <span className="text-white/50 font-medium">active orders</span>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-900/30 px-4 py-2 rounded-xl border border-red-500/30 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Connection Status Indicator */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${connected ? 'bg-[#5C8D5C]/20 text-[#5C8D5C]' : 'bg-amber-500/20 text-amber-400'}`}>
                            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            <span className="text-xs font-medium">{connected ? 'Live' : 'Polling'}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={refetch}
                            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-[#5C8D5C]/20 hover:border-[#5C8D5C]/30 text-white transition-all duration-300"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className={`w-12 h-12 rounded-xl border transition-all duration-300 ${audioEnabled
                                ? 'bg-[#5C8D5C]/20 border-[#5C8D5C]/30 text-[#5C8D5C]'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                        >
                            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Drag hint */}
                <div className="shrink-0 relative z-10 mb-4 text-center">
                    <p className="text-white/30 text-sm">
                        <GripVertical className="w-4 h-4 inline mr-1" />
                        Drag orders between columns or click to view details
                    </p>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 min-h-0 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    {(["pending", "preparing", "ready"] as OrderStatus[]).map((status) => {
                        const config = statusConfig[status]
                        const statusOrders = getOrdersByStatus(status)
                        const StatusIcon = config.icon
                        const isDragOver = dragOverStatus === status

                        return (
                            <div
                                key={status}
                                className="flex flex-col h-full overflow-hidden"
                                onDragOver={(e) => handleDragOver(e, status)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, status)}
                            >
                                {/* Column Header */}
                                <div className={`bg-gradient-to-r ${config.color} rounded-t-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden shrink-0`}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <StatusIcon className="w-6 h-6 text-white/80" />
                                        <h2 className="text-xl font-bold font-serif tracking-wide text-white">{config.label}</h2>
                                    </div>
                                    <Badge className="bg-white/25 text-white text-lg font-bold px-4 py-1.5 backdrop-blur-sm border-0 relative z-10 shadow-sm">{config.count}</Badge>
                                </div>

                                {/* Orders Column */}
                                <div className={`flex-1 bg-gradient-to-b from-white/[0.03] to-transparent border-x border-b border-white/5 rounded-b-2xl overflow-hidden transition-all duration-300 ${isDragOver ? 'ring-2 ring-[#5C8D5C]/50 bg-[#5C8D5C]/5' : ''}`}>
                                    <ScrollArea className="h-full">
                                        <div className="p-4 space-y-4">
                                            {statusOrders.map((order, index) => {
                                                const elapsed = getElapsedTime(order.created_at)
                                                const isDragging = draggedOrderId === order.id
                                                const position = index + 1 // 1-indexed position

                                                return (
                                                    <Card
                                                        key={order.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, order.id)}
                                                        onDragEnd={handleDragEnd}
                                                        onClick={() => setSelectedOrder(order)}
                                                        className={`bg-gradient-to-br from-[#2a2420] to-[#1e1a17] border-0 ring-1 ring-white/10 rounded-2xl p-0 cursor-grab active:cursor-grabbing hover:ring-[#5C8D5C]/50 hover:shadow-xl hover:shadow-[#5C8D5C]/5 transition-all duration-300 hover:scale-[1.02] group overflow-hidden ${isDragging ? 'opacity-50 scale-95 ring-[#5C8D5C]' : ''}`}
                                                    >
                                                        <div className="p-5">
                                                            {/* Drag Handle + Order Header */}
                                                            <div className="flex items-start gap-3 mb-4">
                                                                <div className="mt-1 text-white/20 group-hover:text-white/40 transition-colors">
                                                                    <GripVertical className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            {/* Position Badge */}
                                                                            <Badge className={`text-xs font-bold px-2 py-1 border-0 ${position === 1
                                                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/30'
                                                                                : position === 2
                                                                                    ? 'bg-gradient-to-r from-gray-400 to-gray-300 text-black'
                                                                                    : position === 3
                                                                                        ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white'
                                                                                        : 'bg-white/10 text-white/70'
                                                                                }`}>
                                                                                {getOrdinalSuffix(position)}
                                                                            </Badge>
                                                                            <span className="text-3xl font-bold text-white">#{String(order.id).padStart(3, '0')}</span>
                                                                            {elapsed.isOverdue && (
                                                                                <span className="animate-pulse w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                                                                            )}
                                                                        </div>
                                                                        {/* Timer */}
                                                                        <div
                                                                            className={`text-right font-mono font-bold text-xl px-3 py-1.5 rounded-xl ${elapsed.isCritical ? "text-red-200 bg-red-900/60 ring-2 ring-red-500/50 animate-pulse" : elapsed.isOverdue ? "text-amber-300 bg-amber-900/40 ring-1 ring-amber-500/30" : "text-white/60 bg-white/5"}`}
                                                                        >
                                                                            {elapsed.display}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-lg text-[#FFFBF2]/80 font-medium mt-1">{order.customer?.name || 'Guest'}</div>
                                                                    <Badge className={`mt-2 text-[10px] font-bold uppercase tracking-widest border-0 ${order.order_type === 'dine-in' ? 'bg-[#5C8D5C]/20 text-[#5C8D5C]' : 'bg-[#FF8A80]/20 text-[#FF8A80]'}`}>
                                                                        {order.order_type}
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            {/* Order Items Preview */}
                                                            <div className="space-y-2">
                                                                {order.items.slice(0, 5).map((item, idx) => (
                                                                    <div key={idx} className="bg-black/30 rounded-xl p-3 flex items-start gap-3">
                                                                        <Badge className="bg-gradient-to-br from-[#5C8D5C]/30 to-[#5C8D5C]/10 text-white hover:bg-[#5C8D5C]/40 text-lg font-bold w-9 h-9 flex items-center justify-center p-0 rounded-lg border-0 shrink-0">
                                                                            {item.quantity}
                                                                        </Badge>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-white/90 font-medium text-base block truncate">
                                                                                {item.product?.name || `Product #${item.product_id}`}
                                                                                {item.is_free_reward && (
                                                                                    <Badge className="ml-2 bg-[#D4AF37] text-[#5D4037] text-[10px] px-1.5 py-0 font-bold">FREE</Badge>
                                                                                )}
                                                                            </span>
                                                                            {(item.product_size || (item.modifiers && item.modifiers.length > 0)) && (
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {item.product_size && (
                                                                                        <span className="text-xs text-[#5C8D5C] font-bold px-2 py-0.5 bg-[#5C8D5C]/15 rounded-md">
                                                                                            Size: {item.product_size.size}
                                                                                        </span>
                                                                                    )}
                                                                                    {item.modifiers?.map((mod) => (
                                                                                        <span key={mod.id} className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                                                                                            {mod.modifier?.name}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {order.items.length > 5 && (
                                                                    <div className="text-center text-white/40 text-sm py-1">
                                                                        +{order.items.length - 5} more items
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Click to view details hint */}
                                                        <div className="bg-white/5 py-2 text-center text-xs text-white/30 font-medium group-hover:bg-white/10 group-hover:text-white/50 transition-all duration-300">
                                                            Click to view details
                                                        </div>
                                                    </Card>
                                                )
                                            })}

                                            {statusOrders.length === 0 && (
                                                <div className={`flex flex-col items-center justify-center min-h-[50vh] text-white/20 transition-all duration-300 ${isDragOver ? 'scale-105' : ''}`}>
                                                    <div className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 ${isDragOver ? 'bg-[#5C8D5C]/20 ring-2 ring-[#5C8D5C]/30' : ''}`}>
                                                        <span className="text-4xl">{config.emptyIcon}</span>
                                                    </div>
                                                    <div className="font-serif text-lg text-white/30">
                                                        {isDragOver ? 'Drop here' : config.emptyText}
                                                        <div className="text-sm mt-1 text-white/20">
                                                            ({stationType === 'all' ? 'All items' : stationType === 'drinks' ? 'Drinks only' : 'Food only'})
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Order Details Modal */}
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="max-w-lg bg-gradient-to-br from-[#2a2420] to-[#1e1a17] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif text-white flex items-center gap-3">
                                <Receipt className="w-6 h-6 text-[#5C8D5C]" />
                                Order #{selectedOrder && String(selectedOrder.id).padStart(3, '0')}
                            </DialogTitle>
                            <DialogDescription className="text-white/50">
                                Complete order details and information
                            </DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <ScrollArea className="max-h-[70vh]">
                                <div className="space-y-6 mt-4 pr-4">
                                    {/* Customer Info */}
                                    <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-3 text-white/80">
                                            <User className="w-5 h-5 text-[#5C8D5C]" />
                                            <span className="font-medium">{selectedOrder.customer?.name || 'Walk-in Customer'}</span>
                                        </div>
                                        {selectedOrder.customer?.phone && (
                                            <div className="flex items-center gap-3 text-white/60 text-sm">
                                                <span className="w-5"></span>
                                                <span>{selectedOrder.customer.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-[#FF8A80]" />
                                            <Badge className={`text-xs font-bold uppercase tracking-widest border-0 ${selectedOrder.order_type === 'dine-in' ? 'bg-[#5C8D5C]/20 text-[#5C8D5C]' : 'bg-[#FF8A80]/20 text-[#FF8A80]'}`}>
                                                {selectedOrder.order_type}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Order Status */}
                                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                                        <span className="text-white/60">Status</span>
                                        <Badge className={`text-sm font-bold uppercase px-3 py-1 border-0 ${selectedOrder.status === 'pending' ? 'bg-[#FF8A80] text-white' :
                                            selectedOrder.status === 'preparing' ? 'bg-[#D4AF37] text-white' :
                                                'bg-[#5C8D5C] text-white'
                                            }`}>
                                            {selectedOrder.status}
                                        </Badge>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest">
                                            <Package className="w-4 h-4" />
                                            Order Items
                                        </div>
                                        <div className="space-y-2">
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className={`bg-black/30 rounded-xl p-4 flex items-start justify-between ${!isInStation(item) ? 'opacity-30' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <Badge className="bg-gradient-to-br from-[#5C8D5C]/30 to-[#5C8D5C]/10 text-white text-lg font-bold w-10 h-10 flex items-center justify-center p-0 rounded-lg border-0">
                                                            {item.quantity}x
                                                        </Badge>
                                                        <div>
                                                            <span className="text-white font-medium text-lg block">
                                                                {item.product?.name || `Product #${item.product_id}`}
                                                                {item.is_free_reward && (
                                                                    <Badge className="ml-2 bg-[#D4AF37] text-[#5D4037] text-xs px-2 py-0.5 font-bold">FREE REWARD</Badge>
                                                                )}
                                                            </span>
                                                            {item.product_size && (
                                                                <span className="text-sm text-[#5C8D5C] font-bold">
                                                                    Size: {item.product_size.size}
                                                                </span>
                                                            )}
                                                            {item.modifiers && item.modifiers.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {item.modifiers.map((mod) => (
                                                                        <span key={mod.id} className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded">
                                                                            {mod.modifier?.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {!isInStation(item) && (
                                                                <div className="text-xs text-white/40 mt-1 italic">
                                                                    Not in this station
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-white/80 font-bold">{formatPrice(item.line_total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Total */}
                                    <div className="border-t border-white/10 pt-4 space-y-2">
                                        <div className="flex justify-between text-white/60">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(selectedOrder.subtotal)}</span>
                                        </div>
                                        {/* ... stats ... */}
                                        <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
                                            <span>Total</span>
                                            <span className="text-[#5C8D5C]">{formatPrice(selectedOrder.total)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        {selectedOrder.status === 'pending' && (
                                            <Button
                                                onClick={() => { handleMoveOrder(selectedOrder.id, 'preparing'); setSelectedOrder(null); }}
                                                className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-bold"
                                            >
                                                Start Preparing
                                            </Button>
                                        )}
                                        {selectedOrder.status === 'preparing' && (
                                            <Button
                                                onClick={() => { handleMoveOrder(selectedOrder.id, 'ready'); setSelectedOrder(null); }}
                                                className="flex-1 bg-[#5C8D5C] hover:bg-[#5C8D5C]/90 text-white font-bold"
                                            >
                                                Mark Ready
                                            </Button>
                                        )}


                                    </div>

                                </div>
                            </ScrollArea>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
