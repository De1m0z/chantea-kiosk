"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, Plus, Edit, Trash2, AlertTriangle, Settings2, Camera, Loader2, X } from "lucide-react"
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, getModifierGroups, updateProductModifiers, uploadProductImage } from "@/lib/api"
import { Product, Category, ModifierGroup } from "@/lib/types"
import { formatPrice } from "@/lib/format"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isModifiersOpen, setIsModifiersOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
    const [modifiersProduct, setModifiersProduct] = useState<Product | null>(null)
    const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState<number[]>([])
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category_id: 0,
        sku: "",
        is_active: true,
        sizes: [{ size: "Regular", price: 0 }] as Array<{ size: string; price: number }>,
    })
    const [saving, setSaving] = useState(false)
    const [uploadingProductId, setUploadingProductId] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedProductForImage, setSelectedProductForImage] = useState<Product | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const [productsData, categoriesData, modifierGroupsData] = await Promise.all([
                getProducts(true), // Include inactive products for admin
                getCategories(),
                getModifierGroups(),
            ])
            setProducts(productsData)
            setCategories(categoriesData)
            setModifierGroups(modifierGroupsData)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const openCreateForm = () => {
        setEditingProduct(null)
        setFormData({
            name: "",
            description: "",
            category_id: categories[0]?.id || 0,
            sku: "",
            is_active: true,
            sizes: [{ size: "Regular", price: 0 }],
        })
        setIsFormOpen(true)
    }

    const openEditForm = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description || "",
            category_id: product.category_id || product.category?.id || 0,
            sku: product.sku || "",
            is_active: product.is_active ?? true,
            sizes: product.sizes?.length > 0
                ? product.sizes.map(s => ({ size: s.size, price: s.price }))
                : [{ size: "Regular", price: 0 }],
        })
        setIsFormOpen(true)
    }

    const openDeleteConfirm = (product: Product) => {
        setDeletingProduct(product)
        setIsDeleteOpen(true)
    }

    const openModifiersModal = (product: Product) => {
        setModifiersProduct(product)
        // Set current modifier group IDs
        const currentIds = product.modifier_groups?.map(g => g.id) || []
        setSelectedModifierGroupIds(currentIds)
        setIsModifiersOpen(true)
    }

    const toggleModifierGroup = (groupId: number) => {
        setSelectedModifierGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        )
    }

    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, { size: "", price: 0 }]
        }))
    }

    const removeSize = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }))
    }

    const updateSize = (index: number, field: 'size' | 'price', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            )
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Filter out empty sizes
            const validSizes = formData.sizes.filter(s => s.size.trim() !== '')
            const dataToSubmit = { ...formData, sizes: validSizes }

            if (editingProduct) {
                await updateProduct(editingProduct.id, dataToSubmit)
                toast.success("Product updated!", {
                    description: `${formData.name} has been updated successfully`,
                })
            } else {
                await createProduct(dataToSubmit)
                toast.success("Product created!", {
                    description: `${formData.name} has been added to your menu`,
                })
            }
            setIsFormOpen(false)
            fetchData()
        } catch (error) {
            console.error("Failed to save product:", error)
            toast.error("Failed to save product", {
                description: error instanceof Error ? error.message : "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingProduct) return
        setSaving(true)
        try {
            await deleteProduct(deletingProduct.id)
            setIsDeleteOpen(false)
            toast.success("Product deleted!", {
                description: `${deletingProduct.name} has been removed`,
            })
            fetchData()
        } catch (error) {
            console.error("Failed to delete product:", error)
            toast.error("Cannot delete product", {
                description: error instanceof Error ? error.message : "This product may have existing orders. Deactivate it instead.",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveModifiers = async () => {
        if (!modifiersProduct) return
        setSaving(true)
        try {
            await updateProductModifiers(modifiersProduct.id, selectedModifierGroupIds)
            setIsModifiersOpen(false)
            toast.success("Modifiers updated!", {
                description: `${modifiersProduct.name} now has ${selectedModifierGroupIds.length} modifier groups`,
            })
            fetchData()
        } catch (error) {
            console.error("Failed to update modifiers:", error)
            toast.error("Failed to update modifiers", {
                description: error instanceof Error ? error.message : "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const openImageUpload = (product: Product) => {
        setSelectedProductForImage(product)
        fileInputRef.current?.click()
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedProductForImage) return

        setUploadingProductId(selectedProductForImage.id)
        try {
            await uploadProductImage(selectedProductForImage.id, file)
            toast.success("Image uploaded!", {
                description: `${selectedProductForImage.name} image has been updated`,
            })
            fetchData()
        } catch (error) {
            console.error("Failed to upload image:", error)
            toast.error("Failed to upload image", {
                description: error instanceof Error ? error.message : "Please try again",
            })
        } finally {
            setUploadingProductId(null)
            setSelectedProductForImage(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter(p => p.category?.name === selectedCategory)

    return (
        <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-espresso">Products</h2>
                        <p className="text-sm text-espresso-light">Manage your menu items</p>
                    </div>
                    <Button onClick={openCreateForm} className="bg-matcha hover:bg-matcha/90 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                </div>
            </header>

            <main className="p-8 space-y-6">
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        onClick={() => setSelectedCategory("all")}
                        className={selectedCategory === "all" ? "bg-matcha hover:bg-matcha/90" : ""}
                    >
                        All
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.name ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category.name)}
                            className={selectedCategory === category.name ? "bg-matcha hover:bg-matcha/90" : ""}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="p-12 text-center text-espresso-light">Loading products...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Hidden file input for image upload */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        {filteredProducts.map((product) => {
                            const isInactive = !product.is_active
                            return (
                                <Card key={product.id} className={`rounded-2xl shadow-premium overflow-hidden transition-shadow flex flex-col h-full relative ${isInactive ? 'opacity-75' : 'hover:shadow-float'}`}>
                                    {/* Full card unavailable overlay for inactive products */}
                                    {isInactive && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/20 backdrop-blur-[1px] pointer-events-none">
                                            <div className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 rotate-[-5deg]">
                                                <span>😔</span>
                                                <span>UNAVAILABLE</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className={`aspect-square bg-cream-dark/30 flex items-center justify-center relative group shrink-0 ${isInactive ? 'grayscale' : ''}`}>
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-16 h-16 text-espresso-light/50" />
                                        )}
                                        {/* Upload overlay button */}
                                        <button
                                            onClick={() => openImageUpload(product)}
                                            disabled={uploadingProductId === product.id}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                                        >
                                            {uploadingProductId === product.id ? (
                                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                                            ) : (
                                                <Camera className="w-10 h-10 text-white" />
                                            )}
                                        </button>
                                    </div>
                                    <div className={`p-4 space-y-3 flex flex-col flex-1 ${isInactive ? 'opacity-70' : ''}`}>
                                        <div>
                                            <h3 className="font-bold text-espresso line-clamp-1" title={product.name}>{product.name}</h3>
                                            <p className="text-sm text-espresso-light line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Badge className={isInactive ? "bg-gray-200 text-gray-500 border-0" : "bg-matcha-light text-matcha border-0"}>
                                                {product.category?.name}
                                            </Badge>
                                            <span className={`font-bold ${isInactive ? 'text-gray-400' : 'text-matcha'}`}>
                                                {product.sizes?.[0] ? formatPrice(product.sizes[0].price) : "N/A"}
                                            </span>
                                        </div>
                                        {/* Show modifier count */}
                                        <div className="text-xs text-espresso-light">
                                            {product.modifier_groups && product.modifier_groups.length > 0 ? (
                                                <span className={isInactive ? "text-gray-400" : "text-matcha font-medium"}>
                                                    {product.modifier_groups.length} modifier group{product.modifier_groups.length !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className={isInactive ? "text-gray-400" : "text-coral"}>No modifiers</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 pt-2 mt-auto relative z-30">
                                            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditForm(product)}>
                                                <Edit className="w-3 h-3" /> Edit
                                            </Button>
                                            <Button variant="outline" size="sm" className="gap-1" onClick={() => openModifiersModal(product)}>
                                                <Settings2 className="w-3 h-3" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => openDeleteConfirm(product)}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Create/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso">
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct ? "Update the product details" : "Create a new product for your menu"}
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
                            <label className="block text-sm font-medium text-espresso mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none resize-none"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Category</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">SKU</label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                required
                            />
                        </div>
                        {/* Sizes Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-espresso">Sizes & Prices</label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addSize}
                                    className="gap-1 text-xs h-7"
                                >
                                    <Plus className="w-3 h-3" /> Add Size
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {formData.sizes.map((sizeItem, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Size (e.g., Small, Medium)"
                                            value={sizeItem.size}
                                            onChange={(e) => updateSize(index, 'size', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none text-sm"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light text-sm">₱</span>
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={sizeItem.price}
                                                onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-24 pl-7 pr-3 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none text-sm"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        {formData.sizes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSize(index)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded border-cream-dark"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-espresso">Active</label>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="flex-1 bg-matcha hover:bg-matcha/90">
                                {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modifiers Management Modal */}
            <Dialog open={isModifiersOpen} onOpenChange={setIsModifiersOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-matcha" />
                            Manage Modifiers
                        </DialogTitle>
                        <DialogDescription>
                            Select which modifier groups apply to "{modifiersProduct?.name}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {modifierGroups.map((group) => {
                                const isSelected = selectedModifierGroupIds.includes(group.id)
                                return (
                                    <div
                                        key={group.id}
                                        onClick={() => toggleModifierGroup(group.id)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                            ? "border-matcha bg-matcha-light/30"
                                            : "border-cream-dark hover:border-matcha/30"
                                            }`}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleModifierGroup(group.id)}
                                            className="data-[state=checked]:bg-matcha data-[state=checked]:border-matcha"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-espresso">{group.name}</p>
                                            <p className="text-xs text-espresso-light">
                                                {group.modifiers?.length || 0} options
                                                {group.is_required && <span className="text-coral ml-2">• Required</span>}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setIsModifiersOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveModifiers} disabled={saving} className="flex-1 bg-matcha hover:bg-matcha/90">
                                {saving ? "Saving..." : "Save Modifiers"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Product
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
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
