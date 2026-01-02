"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { getAllOrders, updateOrderStatus } from "@/lib/api"
import { Order } from "@/lib/types"
import { formatPrice } from "@/lib/format"

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order)
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const data = await getAllOrders()
            setOrders(data)
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusUpdate = async (orderId: number, status: 'preparing' | 'ready' | 'completed' | 'cancelled') => {
        try {
            await updateOrderStatus(orderId, status)
            fetchOrders() // Refresh list
        } catch (error) {
            console.error("Failed to update order:", error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-matcha-light text-matcha border-matcha/20"
            case "preparing":
                return "bg-gold/10 text-gold-dark border-gold/20"
            case "pending":
                return "bg-coral/10 text-coral border-coral/20"
            case "ready":
                return "bg-blue-100 text-blue-700 border-blue-200"
            case "cancelled":
                return "bg-gray-100 text-gray-700 border-gray-200"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(o => o.status === filter)

    return (
        <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-espresso">Orders</h2>
                        <p className="text-sm text-espresso-light">Manage and track all orders</p>
                    </div>
                    <Button onClick={fetchOrders} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </header>

            <main className="p-8 space-y-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? "default" : "outline"}
                            onClick={() => setFilter(status)}
                            className={`capitalize ${filter === status ? "bg-matcha hover:bg-matcha/90" : ""}`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>

                {/* Orders Table */}
                <Card className="rounded-2xl shadow-premium overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-espresso-light">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center text-espresso-light">No orders found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-dark/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Order ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Items</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Total</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cream-dark">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-cream-dark/20 transition-colors">
                                            <td className="px-6 py-4 font-bold text-espresso">#{order.id}</td>
                                            <td className="px-6 py-4 text-espresso-light">{order.customer?.name || "Walk-in"}</td>
                                            <td className="px-6 py-4 text-espresso-light capitalize">{order.order_type?.replace("-", " ")}</td>
                                            <td className="px-6 py-4 text-espresso-light">{order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} items</td>
                                            <td className="px-6 py-4 font-bold text-matcha">{formatPrice(order.total)}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={`${getStatusColor(order.status)} capitalize`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openOrderDetails(order)}>
                                                        <Eye className="w-4 h-4 text-espresso-light" />
                                                    </Button>
                                                    {order.status === "pending" && (
                                                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order.id, 'preparing')}>
                                                            Start
                                                        </Button>
                                                    )}
                                                    {order.status === "preparing" && (
                                                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order.id, 'ready')}>
                                                            Ready
                                                        </Button>
                                                    )}
                                                    {order.status === "ready" && (
                                                        <Button size="sm" className="bg-matcha hover:bg-matcha/90" onClick={() => handleStatusUpdate(order.id, 'completed')}>
                                                            Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </main>

            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-espresso flex justify-between items-center pr-8">
                            <span>Order #{selectedOrder?.id}</span>
                            <div className="flex gap-2">
                                {selectedOrder && (
                                    <>
                                        <Badge className={`text-base px-3 py-1 ${getStatusColor(selectedOrder.status)} capitalize`}>
                                            {selectedOrder.status}
                                        </Badge>
                                        <Badge className="text-base px-3 py-1 bg-gray-100 text-gray-700 capitalize">
                                            {selectedOrder.order_type}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 mt-4">
                            {/* Customer Info */}
                            <div className="bg-cream-dark/20 p-4 rounded-xl">
                                <p className="font-bold text-espresso text-lg">{selectedOrder.customer?.name || "Walk-in Customer"}</p>
                                <p className="text-espresso-light text-sm">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}</p>
                            </div>

                            {/* Items List */}
                            <div className="space-y-3">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-b border-cream-dark/50 pb-3 last:border-0">
                                        <div className="flex items-start gap-3">
                                            <Badge className="w-6 h-6 rounded flex items-center justify-center bg-gray-200 text-gray-700 p-0 text-xs">
                                                {item.quantity}
                                            </Badge>
                                            <div>
                                                <p className="font-bold text-espresso">
                                                    {item.product?.name || `Product #${item.product_id}`}
                                                    {item.is_free_reward && (
                                                        <Badge className="ml-2 bg-gold text-espresso text-[10px] px-1.5 py-0 font-bold">FREE REWARD</Badge>
                                                    )}
                                                </p>
                                                <p className="text-xs text-matcha font-medium">Size: {item.product_size?.size}</p>
                                                {item.modifiers && item.modifiers.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.modifiers.map(mod => (
                                                            <span key={mod.id} className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500">
                                                                {mod.modifier?.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-bold text-espresso">{formatPrice((item.quantity * (item.product?.sizes?.find(s => s.id === item.product_size_id)?.price || 0)))}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Budget Breakdown */}
                            <div className="space-y-2 pt-4 border-t border-dashed border-gray-300">
                                <div className="flex justify-between items-center text-espresso-light">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold">{formatPrice(selectedOrder.subtotal)}</span>
                                </div>
                                {Number(selectedOrder.discount) > 0 && (
                                    <div className="flex justify-between items-center text-matcha">
                                        <span className="font-medium">Discount</span>
                                        <span className="font-bold">-{formatPrice(selectedOrder.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 text-xl font-bold text-espresso">
                                    <span>Total</span>
                                    <span>{formatPrice(selectedOrder.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
