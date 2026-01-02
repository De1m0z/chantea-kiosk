"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

// Placeholder data
const salesData = [
    { month: "Jan", revenue: 4500 },
    { month: "Feb", revenue: 5200 },
    { month: "Mar", revenue: 4800 },
    { month: "Apr", revenue: 6100 },
    { month: "May", revenue: 5800 },
    { month: "Jun", revenue: 7200 },
]

const productSalesData = [
    { name: "Classic Milk Tea", sales: 245 },
    { name: "Brown Sugar Boba", sales: 198 },
    { name: "Matcha Latte", sales: 156 },
    { name: "Taro Milk Tea", sales: 134 },
    { name: "Thai Milk Tea", sales: 112 },
]

export default function ReportsPage() {
    return (
        <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-espresso">Reports</h2>
                        <p className="text-sm text-espresso-light">Analytics and insights</p>
                    </div>
                    <select className="px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none bg-white text-espresso text-sm">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>This year</option>
                    </select>
                </div>
            </header>

            <main className="p-8 space-y-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 rounded-2xl shadow-premium">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-matcha-light rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-matcha" />
                            </div>
                            <div>
                                <p className="text-sm text-espresso-light">Total Revenue</p>
                                <p className="text-2xl font-bold text-espresso">₱33,600</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 rounded-2xl shadow-premium">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-coral" />
                            </div>
                            <div>
                                <p className="text-sm text-espresso-light">Total Orders</p>
                                <p className="text-2xl font-bold text-espresso">1,245</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 rounded-2xl shadow-premium">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-gold-dark" />
                            </div>
                            <div>
                                <p className="text-sm text-espresso-light">Avg Order Value</p>
                                <p className="text-2xl font-bold text-espresso">₱27.00</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 rounded-2xl shadow-premium">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-espresso/10 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-espresso" />
                            </div>
                            <div>
                                <p className="text-sm text-espresso-light">Customers</p>
                                <p className="text-2xl font-bold text-espresso">342</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6 rounded-2xl shadow-premium">
                        <h3 className="text-lg font-bold text-espresso mb-6">Revenue Trend</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E6CC" />
                                    <XAxis dataKey="month" stroke="#8D6E63" />
                                    <YAxis stroke="#8D6E63" />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#5C8D5C" strokeWidth={3} dot={{ fill: "#5C8D5C" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-2xl shadow-premium">
                        <h3 className="text-lg font-bold text-espresso mb-6">Top Products</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productSalesData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E6CC" />
                                    <XAxis type="number" stroke="#8D6E63" />
                                    <YAxis dataKey="name" type="category" stroke="#8D6E63" width={120} />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="#5C8D5C" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
