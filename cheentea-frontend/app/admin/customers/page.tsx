"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, UserPlus, Mail, Phone, Star, Edit, Trash2, AlertTriangle } from "lucide-react"
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/api"
import { Customer } from "@/lib/types"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
    const [saving, setSaving] = useState(false)

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const data = await getCustomers()
            setCustomers(data)
        } catch (error) {
            console.error("Failed to fetch customers:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const openCreateForm = () => {
        setEditingCustomer(null)
        setFormData({ name: "", email: "", phone: "" })
        setIsFormOpen(true)
    }

    const openEditForm = (customer: Customer) => {
        setEditingCustomer(customer)
        setFormData({
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
        })
        setIsFormOpen(true)
    }

    const openDeleteConfirm = (customer: Customer) => {
        setDeletingCustomer(customer)
        setIsDeleteOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData)
            } else {
                await createCustomer(formData)
            }
            setIsFormOpen(false)
            fetchCustomers()
        } catch (error) {
            console.error("Failed to save customer:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingCustomer) return
        setSaving(true)
        try {
            await deleteCustomer(deletingCustomer.id)
            setIsDeleteOpen(false)
            fetchCustomers()
        } catch (error) {
            console.error("Failed to delete customer:", error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-espresso">Customers</h2>
                        <p className="text-sm text-espresso-light">Manage customer relationships</p>
                    </div>
                    <Button onClick={openCreateForm} className="bg-matcha hover:bg-matcha/90 gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Customer
                    </Button>
                </div>
            </header>

            <main className="p-8">
                {loading ? (
                    <div className="p-12 text-center text-espresso-light">Loading customers...</div>
                ) : (
                    <Card className="rounded-2xl shadow-premium overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-dark/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Contact</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Loyalty Points</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-espresso">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cream-dark">
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-cream-dark/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-matcha-light rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-matcha" />
                                                    </div>
                                                    <span className="font-medium text-espresso">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-espresso-light">
                                                        <Mail className="w-3 h-3" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-espresso-light">
                                                            <Phone className="w-3 h-3" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-gold" />
                                                    <span className="font-medium text-espresso">{(customer as { loyalty_points?: number }).loyalty_points || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEditForm(customer)}>
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => openDeleteConfirm(customer)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </main>

            {/* Create/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso">
                            {editingCustomer ? "Edit Customer" : "Add Customer"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCustomer ? "Update customer information" : "Create a new customer profile"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Phone (optional)</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="flex-1 bg-matcha hover:bg-matcha/90">
                                {saving ? "Saving..." : editingCustomer ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Customer
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingCustomer?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                            {saving ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
