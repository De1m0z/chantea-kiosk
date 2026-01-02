"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  DollarSign,
  Clock,
  TrendingUp,
  ShoppingBag,
  Package,
  Eye,
  Edit,
  Trash2,
  Coffee,
  Cookie,
  Utensils,
  Wallet,
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const salesData = [
  { day: "Mon", revenue: 450 },
  { day: "Tue", revenue: 680 },
  { day: "Wed", revenue: 520 },
  { day: "Thu", revenue: 750 },
  { day: "Fri", revenue: 920 },
  { day: "Sat", revenue: 1200 },
  { day: "Sun", revenue: 980 },
]

const orderStatusData = [
  { name: "Completed", value: 245, color: "#5C8D5C" }, // matcha
  { name: "Pending", value: 12, color: "#FF8A80" }, // coral
  { name: "Preparing", value: 8, color: "#D4AF37" }, // gold
  { name: "Cancelled", value: 5, color: "#9CA3AF" },
]

const recentOrders = [
  {
    id: "#001",
    customer: "Sarah Chen",
    items: 3,
    total: 19.77,
    status: "completed",
    time: "2 min ago",
  },
  {
    id: "#002",
    customer: "John Smith",
    items: 1,
    total: 5.99,
    status: "preparing",
    time: "5 min ago",
  },
  {
    id: "#003",
    customer: "Emily Wilson",
    items: 2,
    total: 12.48,
    status: "pending",
    time: "8 min ago",
  },
  {
    id: "#004",
    customer: "Mike Johnson",
    items: 1,
    total: 4.79,
    status: "completed",
    time: "12 min ago",
  },
  {
    id: "#005",
    customer: "Lisa Anderson",
    items: 1,
    total: 5.49,
    status: "completed",
    time: "15 min ago",
  },
]

const topProducts = [
  { name: "Classic Milk Tea", sales: 89, revenue: 444.11 },
  { name: "Brown Sugar Boba", sales: 76, revenue: 417.24 },
  { name: "Matcha Latte", sales: 64, revenue: 338.56 },
  { name: "Taro Milk Tea", sales: 52, revenue: 259.48 },
  { name: "Thai Milk Tea", sales: 48, revenue: 229.92 },
]

export default function AdminDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-matcha-light text-matcha border-matcha/20"
      case "preparing":
        return "bg-gold/10 text-gold-dark border-gold/20"
      case "pending":
        return "bg-coral/10 text-coral border-coral/20"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Daily sales state
  const [dailySales, setDailySales] = useState<{
    drinks: { total: number; count: number };
    snacks: { total: number; count: number };
    overall: { total: number; orders_count: number };
  } | null>(null)
  const [loadingSales, setLoadingSales] = useState(true)

  // Sales detail modal state
  const [salesModalOpen, setSalesModalOpen] = useState(false)
  const [salesModalType, setSalesModalType] = useState<'drinks' | 'snacks' | 'all'>('all')
  const [salesDetails, setSalesDetails] = useState<{
    drinks: Array<{
      order_id: number;
      product_name: string;
      size: string;
      quantity: number;
      unit_price: number;
      line_total: number;
      category: string;
    }>;
    snacks: Array<{
      order_id: number;
      product_name: string;
      size: string;
      quantity: number;
      unit_price: number;
      line_total: number;
      category: string;
    }>;
    orders: Array<{
      id: number;
      total: number;
      order_type: string;
      items_count: number;
    }>;
  } | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const openSalesModal = async (type: 'drinks' | 'snacks' | 'all') => {
    setSalesModalType(type)
    setSalesModalOpen(true)
    setLoadingDetails(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1'}/dashboard/daily-sales/details`)
      const data = await response.json()
      if (data.success) {
        setSalesDetails(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sales details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1'}/dashboard/daily-sales`)
        const data = await response.json()
        if (data.success) {
          setDailySales(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch daily sales:', error)
      } finally {
        setLoadingSales(false)
      }
    }
    fetchDailySales()
  }, [])

  return (
    <div className="flex-1 overflow-auto">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-espresso">Dashboard</h2>
              <p className="text-sm text-espresso-light">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none bg-white text-espresso text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-white rounded-[2rem] shadow-premium border-0 overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #5C8D5C, #4a7a4a)' }}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">+15%</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 font-medium">Today&apos;s Revenue</p>
                <p className="text-3xl font-serif font-bold">₱{dailySales?.overall.total.toLocaleString() ?? '0'}</p>
              </div>
            </div>
          </Card>

          <Card className="text-white rounded-[2rem] shadow-premium border-0 overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #FF8A80, #e67a70)' }}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">+{dailySales?.overall.orders_count ?? 0}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 font-medium">Orders Today</p>
                <p className="text-3xl font-serif font-bold">{dailySales?.overall.orders_count ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card className="text-white rounded-[2rem] shadow-premium border-0 overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #D4AF37, #c9a430)' }}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 font-medium">Pending Orders</p>
                <p className="text-3xl font-serif font-bold">12</p>
                <p className="text-xs opacity-75">3 preparing</p>
              </div>
            </div>
          </Card>

          <Card className="text-white rounded-[2rem] shadow-premium border-0 overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #5D4037, #4e352e)' }}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 font-medium">Top Product</p>
                <p className="text-lg font-serif font-bold text-wrap line-clamp-1">Classic Milk Tea</p>
                <p className="text-xs opacity-75">89 orders this week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Daily Sales Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openSalesModal('drinks')}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Coffee className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-espresso-light font-medium">Today&apos;s Drinks</p>
                  <p className="text-2xl font-serif font-bold text-espresso">
                    {loadingSales ? "..." : `₱${dailySales?.drinks.total.toLocaleString() ?? 0}`}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-cream-dark/30">
                <p className="text-sm text-espresso-light">
                  <span className="font-bold text-blue-600">{dailySales?.drinks.count ?? 0}</span> drinks sold today
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openSalesModal('snacks')}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Utensils className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-espresso-light font-medium">Today&apos;s Food</p>
                  <p className="text-2xl font-serif font-bold text-espresso">
                    {loadingSales ? "..." : `₱${dailySales?.snacks.total.toLocaleString() ?? 0}`}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-cream-dark/30">
                <p className="text-sm text-espresso-light">
                  <span className="font-bold text-amber-600">{dailySales?.snacks.count ?? 0}</span> food items sold today
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openSalesModal('all')}
            style={{ background: 'linear-gradient(to bottom right, rgba(92, 141, 92, 0.05), rgba(92, 141, 92, 0.1))' }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #5C8D5C, #4a7a4a)' }}>
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-espresso-light font-medium">Today&apos;s Total Sales</p>
                  <p className="text-2xl font-serif font-bold" style={{ color: '#5C8D5C' }}>
                    {loadingSales ? "..." : `₱${dailySales?.overall.total.toLocaleString() ?? 0}`}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-cream-dark/30">
                <p className="text-sm text-espresso-light">
                  <span className="font-bold" style={{ color: '#5C8D5C' }}>{dailySales?.overall.orders_count ?? 0}</span> completed orders
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-serif font-bold text-espresso mb-6">Sales Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E6CC" />
                  <XAxis dataKey="day" stroke="#8D6E63" />
                  <YAxis stroke="#8D6E63" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFBF2",
                      border: "1px solid #F5E6CC",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#5C8D5C"
                    strokeWidth={4}
                    dot={{ fill: "#5C8D5C", r: 6, strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Orders by Status */}
          <Card className="bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-serif font-bold text-espresso mb-6">Orders by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-espresso font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-espresso">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-serif font-bold text-espresso mb-6">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-dark">
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Order #</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Customer</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Items</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Total</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Status</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Time</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-widest font-bold text-espresso-light">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-cream-dark/30 hover:bg-cream-light/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-espresso">{order.id}</td>
                        <td className="py-4 px-4 text-espresso font-medium">{order.customer}</td>
                        <td className="py-4 px-4 text-espresso-light">{order.items}</td>
                        <td className="py-4 px-4 font-bold text-espresso">₱{order.total.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(order.status)} capitalize border shadow-none font-medium`}>{order.status}</Badge>
                        </td>
                        <td className="py-4 px-4 text-espresso-light text-sm">{order.time}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-espresso-light"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-matcha-light hover:text-matcha rounded-lg text-espresso-light"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-lg text-espresso-light"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Top Products */}
          <Card className="bg-white rounded-[2rem] shadow-sm border border-cream-dark/30 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-serif font-bold text-espresso mb-6">Top Products</h3>
              <div className="space-y-6">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center text-espresso font-bold border border-cream-dark/50">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-espresso text-sm truncate">{product.name}</p>
                      <p className="text-xs text-espresso-light">{product.sales} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-matcha text-sm">₱{product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Sales Detail Modal */}
      <Dialog open={salesModalOpen} onOpenChange={setSalesModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-espresso flex items-center gap-2">
              {salesModalType === 'drinks' && <Coffee className="w-5 h-5 text-blue-600" />}
              {salesModalType === 'snacks' && <Utensils className="w-5 h-5 text-amber-600" />}
              {salesModalType === 'all' && <Wallet className="w-5 h-5" style={{ color: '#5C8D5C' }} />}
              {salesModalType === 'drinks' ? "Today's Drinks Sales" :
                salesModalType === 'snacks' ? "Today's Food Sales" :
                  "Today's Total Sales"}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of {salesModalType === 'all' ? 'all' : salesModalType} sales for today
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4">
            {loadingDetails ? (
              <div className="text-center py-8 text-espresso-light">Loading details...</div>
            ) : (
              <div className="space-y-4">
                {/* Show drinks items */}
                {(salesModalType === 'drinks' || salesModalType === 'all') && salesDetails?.drinks && salesDetails.drinks.length > 0 && (
                  <div>
                    {salesModalType === 'all' && (
                      <h4 className="font-bold text-espresso mb-2 flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-blue-600" /> Drinks
                      </h4>
                    )}
                    <div className="bg-blue-50/50 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-100">
                            <th className="text-left py-2 px-3 text-espresso-light font-medium">Product</th>
                            <th className="text-left py-2 px-3 text-espresso-light font-medium">Size</th>
                            <th className="text-center py-2 px-3 text-espresso-light font-medium">Qty</th>
                            <th className="text-right py-2 px-3 text-espresso-light font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesDetails.drinks.map((item, index) => (
                            <tr key={index} className="border-b border-blue-100/50 last:border-0">
                              <td className="py-2 px-3 font-medium text-espresso">{item.product_name}</td>
                              <td className="py-2 px-3 text-espresso-light">{item.size}</td>
                              <td className="py-2 px-3 text-center text-espresso">{item.quantity}</td>
                              <td className="py-2 px-3 text-right font-bold text-blue-600">₱{Number(item.line_total).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-100/50">
                            <td colSpan={3} className="py-2 px-3 font-bold text-espresso">Total Drinks</td>
                            <td className="py-2 px-3 text-right font-bold text-blue-600">
                              ₱{salesDetails.drinks.reduce((sum, item) => sum + Number(item.line_total), 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Show snacks items */}
                {(salesModalType === 'snacks' || salesModalType === 'all') && salesDetails?.snacks && salesDetails.snacks.length > 0 && (
                  <div>
                    {salesModalType === 'all' && (
                      <h4 className="font-bold text-espresso mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-amber-600" /> Food
                      </h4>
                    )}
                    <div className="bg-amber-50/50 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-amber-100">
                            <th className="text-left py-2 px-3 text-espresso-light font-medium">Product</th>
                            <th className="text-left py-2 px-3 text-espresso-light font-medium">Size</th>
                            <th className="text-center py-2 px-3 text-espresso-light font-medium">Qty</th>
                            <th className="text-right py-2 px-3 text-espresso-light font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesDetails.snacks.map((item, index) => (
                            <tr key={index} className="border-b border-amber-100/50 last:border-0">
                              <td className="py-2 px-3 font-medium text-espresso">{item.product_name}</td>
                              <td className="py-2 px-3 text-espresso-light">{item.size}</td>
                              <td className="py-2 px-3 text-center text-espresso">{item.quantity}</td>
                              <td className="py-2 px-3 text-right font-bold text-amber-600">₱{Number(item.line_total).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-amber-100/50">
                            <td colSpan={3} className="py-2 px-3 font-bold text-espresso">Total Food</td>
                            <td className="py-2 px-3 text-right font-bold text-amber-600">
                              ₱{salesDetails.snacks.reduce((sum, item) => sum + Number(item.line_total), 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {((salesModalType === 'drinks' && (!salesDetails?.drinks || salesDetails.drinks.length === 0)) ||
                  (salesModalType === 'snacks' && (!salesDetails?.snacks || salesDetails.snacks.length === 0)) ||
                  (salesModalType === 'all' && (!salesDetails?.drinks?.length && !salesDetails?.snacks?.length))) && (
                    <div className="text-center py-8 text-espresso-light">
                      No {salesModalType === 'all' ? 'sales' : (salesModalType === 'snacks' ? 'food' : salesModalType)} recorded today
                    </div>
                  )}

                {/* Grand Total for 'all' view */}
                {salesModalType === 'all' && salesDetails && (salesDetails.drinks?.length > 0 || salesDetails.snacks?.length > 0) && (
                  <div className="rounded-xl p-4" style={{ background: 'linear-gradient(to right, rgba(92, 141, 92, 0.1), rgba(92, 141, 92, 0.2))' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-espresso text-lg">Grand Total</span>
                      <span className="font-bold text-2xl" style={{ color: '#5C8D5C' }}>
                        ₱{((salesDetails.drinks?.reduce((sum, item) => sum + Number(item.line_total), 0) || 0) +
                          (salesDetails.snacks?.reduce((sum, item) => sum + Number(item.line_total), 0) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
