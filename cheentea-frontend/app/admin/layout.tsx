"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Layers,
    Settings2,
    Users,
    BarChart3,
    LogOut,
    Menu,
    X,
} from "lucide-react"

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: Layers, label: "Categories", href: "/admin/categories" },
    { icon: Settings2, label: "Modifiers", href: "/admin/modifiers" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: BarChart3, label: "Reports", href: "/admin/reports" },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin"
        }
        return pathname.startsWith(href)
    }

    return (
        <div className="min-h-screen bg-cream flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-0"
                    } bg-white border-r border-cream-dark transition-all duration-300 overflow-hidden flex flex-col`}
            >
                <div className="p-6 border-b border-cream-dark">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-matcha rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm transform rotate-3">
                            C
                        </div>
                        <div>
                            <h1 className="text-xl font-serif font-bold text-espresso">Chantea</h1>
                            <p className="text-xs text-espresso-light uppercase tracking-wider">Admin Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href) ? "bg-matcha text-white shadow-md" : "text-espresso-light hover:bg-cream-dark/20 hover:text-espresso"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-cream-dark">
                    <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-espresso-light hover:bg-cream-dark/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Back to Kiosk</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Mobile Menu Button */}
                <div className="lg:hidden fixed top-4 left-4 z-50">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                {children}
            </div>
        </div>
    )
}
