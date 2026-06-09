"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Loader2, CheckCircle, Coffee, Bell, ChefHat } from "lucide-react"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"
import Image from "next/image"
import { sitePath } from "@/lib/site-path"

/**
 * Customer-facing Pickup Display
 * Minimalist Chantea Theme - Light Version
 */
export default function PickupDisplay() {
  const { orders: allOrders, loading, connected, refetch } = useRealtimeOrders({
    statusFilter: ['pending', 'preparing', 'ready'],
    enableAudio: true,
  })

  const readyOrders = allOrders.filter(order => {
    if (!order.items || order.items.length === 0) return false
    const hasPreparingItems = order.items.some(item => item.status === 'preparing')
    if (hasPreparingItems) return false
    return order.status === 'ready' || order.items.every(item => (item.status || 'pending') === 'ready')
  })

  const preparingOrders = allOrders.filter(order => {
    if (order.status === 'completed' || order.status === 'cancelled') return false
    if (readyOrders.some(r => r.id === order.id)) return false
    return true
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#c9a227]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#0f2920] font-sans selection:bg-[#c9a227] selection:text-white">

      {/* Top Bar */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 relative">
            <Image src={sitePath("/chantea-logo.png")} alt="Chantea" fill className="object-contain" />
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-[#0f2920] uppercase">Order Pickup</h1>
            <div className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${connected ? 'text-emerald-600' : 'text-red-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {connected ? 'System Live' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-[#c9a227] tracking-widest tabular-nums">
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-1">Current Time</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 h-[calc(100vh-100px)]">

        {/* Preparing Column */}
        <div className="bg-slate-50 p-8 border-r border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-500 flex items-center gap-3 tracking-widest uppercase">
              <Loader2 className="w-5 h-5 animate-spin text-[#c9a227]" />
              Preparing
            </h2>
            <span className="text-[#c9a227] font-mono text-2xl font-bold">
              {String(preparingOrders.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Coffee className="w-12 h-12 mb-3 text-slate-400" />
                <p className="font-light tracking-wide uppercase text-sm text-slate-500">No orders</p>
              </div>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border-l-[6px] border-[#c9a227] shadow-sm hover:shadow-md transition-all duration-500 animate-in slide-in-from-left-2 fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-6xl font-black text-[#0f2920] tracking-tighter drop-shadow-sm">#{String(order.id).padStart(3, '0')}</span>
                        <span className="text-[#c9a227] font-bold text-lg uppercase tracking-wide">Preparing</span>
                      </div>
                      <div className="text-slate-700 font-bold text-xl mb-1">{order.customer?.name || 'Walk-in Customer'}</div>
                      <div className="text-sm text-slate-500 font-medium max-w-[300px] truncate leading-relaxed">
                        {order.items.map(i => i.product?.name).join(', ')}
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-[#c9a227] shadow-inner">
                      <ChefHat className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-white p-8 flex flex-col relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-emerald-100 relative z-10">
            <h2 className="text-2xl font-black text-[#0f2920] flex items-center gap-3 tracking-widest uppercase">
              <Bell className="w-6 h-6 text-emerald-600 fill-emerald-600" />
              Ready for Pickup
            </h2>
            <div className="bg-emerald-100 text-emerald-800 font-mono text-3xl font-bold px-4 py-1 rounded-xl">
              {String(readyOrders.length).padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-emerald-100 scrollbar-track-transparent relative z-10">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <CheckCircle className="w-16 h-16 mb-4 text-emerald-200" />
                <p className="font-bold tracking-widest uppercase text-lg text-emerald-900/30">All orders picked up</p>
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl border-l-[8px] border-emerald-500 shadow-md flex items-center justify-between group hover:shadow-lg hover:scale-[1.01] transition-all duration-500 animate-in slide-in-from-right-2 fade-in">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="text-7xl font-black text-[#0f2920] tracking-tighter drop-shadow-sm leading-none">#{String(order.id).padStart(3, '0')}</span>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-1">Please Collect</span>
                    </div>
                    <div className="text-emerald-800 font-bold text-2xl truncate">{order.customer?.name || 'Walk-in Customer'}</div>
                    <div className="text-slate-500 text-sm font-medium mt-1 truncate">
                      {order.items.map(i => i.product?.name).join(', ')}
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0 animate-bounce">
                    <CheckCircle className="w-8 h-8 fill-current stroke-[3]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
