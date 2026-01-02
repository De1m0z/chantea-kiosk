"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Layers, Plus, Edit, Trash2, AlertTriangle, Package } from "lucide-react"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api"
import { Category } from "@/lib/types"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({ name: "", description: "", sort_order: 0 })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const data = await getCategories()
            setCategories(data)
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const openCreateForm = () => {
        setEditingCategory(null)
        setFormData({ name: "", description: "", sort_order: 0 })
        setError(null)
        setIsFormOpen(true)
    }

    const openEditForm = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            sort_order: (category as { sort_order?: number }).sort_order || 0,
        })
        setError(null)
        setIsFormOpen(true)
    }

    const openDeleteConfirm = (category: Category) => {
        setDeletingCategory(category)
        setError(null)
        setIsDeleteOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData)
            } else {
                await createCategory(formData)
            }
            setIsFormOpen(false)
            fetchCategories()
        } catch (err) {
            console.error("Failed to save category:", err)
            setError(err instanceof Error ? err.message : "Failed to save category")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingCategory) return
        setSaving(true)
        setError(null)
        try {
            await deleteCategory(deletingCategory.id)
            setIsDeleteOpen(false)
            fetchCategories()
        } catch (err) {
            console.error("Failed to delete category:", err)
            setError(err instanceof Error ? err.message : "Failed to delete category")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-espresso">Categories</h2>
                        <p className="text-sm text-espresso-light">Organize your menu items</p>
                    </div>
                    <Button onClick={openCreateForm} className="bg-matcha hover:bg-matcha/90 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Button>
                </div>
            </header>

            <main className="p-8">
                {loading ? (
                    <div className="p-12 text-center text-espresso-light">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center text-espresso-light">No categories found. Create your first category!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Card key={category.id} className="rounded-2xl shadow-premium overflow-hidden hover:shadow-float transition-shadow p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-matcha-light rounded-2xl flex items-center justify-center">
                                            <Layers className="w-7 h-7 text-matcha" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-espresso">{category.name}</h3>
                                            <p className="text-sm text-espresso-light line-clamp-1">{category.description || "No description"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <Badge className="bg-cream-dark text-espresso border-0 gap-1">
                                        <Package className="w-3 h-3" />
                                        {(category as { products_count?: number }).products_count || 0} products
                                    </Badge>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditForm(category)}>
                                        <Edit className="w-3 h-3" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => openDeleteConfirm(category)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Create/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso">
                            {editingCategory ? "Edit Category" : "Add Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update the category details" : "Create a new category for your menu"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Display Position</label>
                            <p className="text-xs text-espresso-light mb-2">Lower numbers appear first on the menu (0 = first)</p>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                min={0}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="flex-1 bg-matcha hover:bg-matcha/90">
                                {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
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
                            Delete Category
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
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
