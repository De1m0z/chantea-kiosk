"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Settings2, Plus, Edit, Trash2, AlertTriangle, Hash, ChevronDown, ChevronUp } from "lucide-react"
import { getModifierGroups, createModifierGroup, updateModifierGroup, deleteModifierGroup, createModifier, updateModifier, deleteModifier } from "@/lib/api"
import { ModifierGroup, Modifier } from "@/lib/types"

export default function ModifiersPage() {
    const [groups, setGroups] = useState<ModifierGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

    // Group Modal State
    const [isGroupFormOpen, setIsGroupFormOpen] = useState(false)
    const [isGroupDeleteOpen, setIsGroupDeleteOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null)
    const [deletingGroup, setDeletingGroup] = useState<ModifierGroup | null>(null)
    const [groupFormData, setGroupFormData] = useState({
        name: "",
        min_select: 0,
        max_select: 1,
        required: false,
        sort_order: 0
    })

    // Modifier Modal State
    const [isModifierFormOpen, setIsModifierFormOpen] = useState(false)
    const [isModifierDeleteOpen, setIsModifierDeleteOpen] = useState(false)
    const [editingModifier, setEditingModifier] = useState<Modifier | null>(null)
    const [deletingModifier, setDeletingModifier] = useState<Modifier | null>(null)
    const [modifierGroupId, setModifierGroupId] = useState<number | null>(null)
    const [modifierFormData, setModifierFormData] = useState({
        name: "",
        price_adjustment: 0,
        is_active: true,
        sort_order: 0
    })

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchGroups = async () => {
        try {
            setLoading(true)
            const data = await getModifierGroups()
            setGroups(data)
        } catch (error) {
            console.error("Failed to fetch modifier groups:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const toggleGroupExpand = (groupId: number) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(groupId)) {
                newSet.delete(groupId)
            } else {
                newSet.add(groupId)
            }
            return newSet
        })
    }

    // ============== GROUP HANDLERS ==============
    const openCreateGroupForm = () => {
        setEditingGroup(null)
        setGroupFormData({ name: "", min_select: 0, max_select: 1, required: false, sort_order: 0 })
        setError(null)
        setIsGroupFormOpen(true)
    }

    const openEditGroupForm = (group: ModifierGroup) => {
        setEditingGroup(group)
        setGroupFormData({
            name: group.name,
            min_select: (group as any).min_select || 0,
            max_select: (group as any).max_select || 1,
            required: (group as any).required || false,
            sort_order: (group as any).sort_order || 0,
        })
        setError(null)
        setIsGroupFormOpen(true)
    }

    const openDeleteGroupConfirm = (group: ModifierGroup) => {
        setDeletingGroup(group)
        setError(null)
        setIsGroupDeleteOpen(true)
    }

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            if (editingGroup) {
                await updateModifierGroup(editingGroup.id, groupFormData)
                toast.success("Group updated!", {
                    description: `${groupFormData.name} has been updated`,
                })
            } else {
                await createModifierGroup(groupFormData)
                toast.success("Group created!", {
                    description: `${groupFormData.name} has been added`,
                })
            }
            setIsGroupFormOpen(false)
            fetchGroups()
        } catch (err) {
            console.error("Failed to save modifier group:", err)
            toast.error("Failed to save group", {
                description: err instanceof Error ? err.message : "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleGroupDelete = async () => {
        if (!deletingGroup) return
        setSaving(true)
        setError(null)
        try {
            await deleteModifierGroup(deletingGroup.id)
            setIsGroupDeleteOpen(false)
            toast.success("Group deleted!", {
                description: `${deletingGroup.name} has been removed`,
            })
            fetchGroups()
        } catch (err) {
            console.error("Failed to delete modifier group:", err)
            toast.error("Cannot delete group", {
                description: err instanceof Error ? err.message : "Group may have modifiers attached",
            })
        } finally {
            setSaving(false)
        }
    }

    // ============== MODIFIER HANDLERS ==============
    const openCreateModifierForm = (groupId: number) => {
        setEditingModifier(null)
        setModifierGroupId(groupId)
        setModifierFormData({ name: "", price_adjustment: 0, is_active: true, sort_order: 0 })
        setError(null)
        setIsModifierFormOpen(true)
    }

    const openEditModifierForm = (modifier: Modifier) => {
        setEditingModifier(modifier)
        setModifierGroupId(modifier.modifier_group_id)
        setModifierFormData({
            name: modifier.name,
            price_adjustment: Number(modifier.price_adjustment) || 0,
            is_active: modifier.is_active,
            sort_order: modifier.sort_order || 0,
        })
        setError(null)
        setIsModifierFormOpen(true)
    }

    const openDeleteModifierConfirm = (modifier: Modifier) => {
        setDeletingModifier(modifier)
        setError(null)
        setIsModifierDeleteOpen(true)
    }

    const handleModifierSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!modifierGroupId) return
        setSaving(true)
        setError(null)
        try {
            if (editingModifier) {
                await updateModifier(editingModifier.id, modifierFormData)
                toast.success("Modifier updated!", {
                    description: `${modifierFormData.name} has been updated`,
                })
            } else {
                await createModifier({
                    modifier_group_id: modifierGroupId,
                    ...modifierFormData
                })
                toast.success("Modifier added!", {
                    description: `${modifierFormData.name} has been created`,
                })
            }
            setIsModifierFormOpen(false)
            fetchGroups()
        } catch (err) {
            console.error("Failed to save modifier:", err)
            toast.error("Failed to save modifier", {
                description: err instanceof Error ? err.message : "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleModifierDelete = async () => {
        if (!deletingModifier) return
        setSaving(true)
        setError(null)
        try {
            await deleteModifier(deletingModifier.id)
            setIsModifierDeleteOpen(false)
            toast.success("Modifier deleted!", {
                description: `${deletingModifier.name} has been removed`,
            })
            fetchGroups()
        } catch (err) {
            console.error("Failed to delete modifier:", err)
            toast.error("Cannot delete modifier", {
                description: err instanceof Error ? err.message : "Modifier may be used in orders",
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-md border-b border-cream-dark px-8 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-espresso">Modifier Groups</h2>
                        <p className="text-sm text-espresso-light">Manage customization options (Sugar, Ice, Toppings)</p>
                    </div>
                    <Button onClick={openCreateGroupForm} className="bg-matcha hover:bg-matcha/90 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Group
                    </Button>
                </div>
            </header>

            <main className="p-8">
                {loading ? (
                    <div className="p-12 text-center text-espresso-light">Loading modifier groups...</div>
                ) : groups.length === 0 ? (
                    <div className="p-12 text-center text-espresso-light">No modifier groups found. Create your first group!</div>
                ) : (
                    <div className="space-y-6">
                        {groups.map((group) => {
                            const isExpanded = expandedGroups.has(group.id)
                            return (
                                <Card key={group.id} className="rounded-2xl shadow-premium overflow-hidden hover:shadow-float transition-shadow">
                                    {/* Group Header */}
                                    <div className="p-6 border-b border-cream-dark/30">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleGroupExpand(group.id)}>
                                                <div className="w-14 h-14 bg-coral/10 rounded-2xl flex items-center justify-center">
                                                    <Settings2 className="w-7 h-7 text-coral" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-espresso">{group.name}</h3>
                                                    <p className="text-sm text-espresso-light">
                                                        {(group as any).required ? "Required" : "Optional"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-cream-dark text-espresso border-0 gap-1">
                                                        <Hash className="w-3 h-3" />
                                                        {group.modifiers?.length || 0} options
                                                    </Badge>
                                                    {(group as any).max_select && (
                                                        <Badge variant="outline" className="border-matcha text-matcha">
                                                            Max: {(group as any).max_select}
                                                        </Badge>
                                                    )}
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-espresso-light" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-espresso-light" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditGroupForm(group)}>
                                                    <Edit className="w-3 h-3" /> Edit Group
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => openDeleteGroupConfirm(group)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modifiers List (Collapsible) */}
                                    {isExpanded && (
                                        <div className="p-6 bg-cream/30">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium text-espresso">Modifiers in this group</h4>
                                                <Button size="sm" onClick={() => openCreateModifierForm(group.id)} className="bg-matcha hover:bg-matcha/90 gap-1">
                                                    <Plus className="w-3 h-3" /> Add Modifier
                                                </Button>
                                            </div>

                                            {group.modifiers && group.modifiers.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {group.modifiers.map((mod) => (
                                                        <div key={mod.id} className="bg-white rounded-xl p-4 border border-cream-dark/30 flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-espresso">{mod.name}</span>
                                                                    {!mod.is_active && (
                                                                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                                                            Inactive
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-sm text-espresso-light mt-1">
                                                                    <span className="font-bold">₱</span>
                                                                    {Number(mod.price_adjustment) > 0 ? `+₱${Number(mod.price_adjustment).toFixed(2)}` : "No extra charge"}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModifierForm(mod)}>
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => openDeleteModifierConfirm(mod)}>
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-espresso-light text-center py-4">No modifiers yet. Add your first modifier to this group.</p>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Group Create/Edit Modal */}
            <Dialog open={isGroupFormOpen} onOpenChange={setIsGroupFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso">
                            {editingGroup ? "Edit Modifier Group" : "Add Modifier Group"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingGroup ? "Update the group details" : "Create a new customization group (e.g., Sugar Level, Toppings)"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGroupSubmit} className="space-y-4 mt-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Name *</label>
                            <input
                                type="text"
                                value={groupFormData.name}
                                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                placeholder="e.g., Sugar Level"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-espresso mb-1">Min Selections</label>
                                <input
                                    type="number"
                                    value={groupFormData.min_select}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, min_select: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-espresso mb-1">Max Selections</label>
                                <input
                                    type="number"
                                    value={groupFormData.max_select}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, max_select: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                    min={1}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="required"
                                checked={groupFormData.required}
                                onChange={(e) => setGroupFormData({ ...groupFormData, required: e.target.checked })}
                                className="w-4 h-4 text-matcha border-cream-dark rounded focus:ring-matcha"
                            />
                            <label htmlFor="required" className="text-sm font-medium text-espresso">
                                Required (customers must select)
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Display Order</label>
                            <input
                                type="number"
                                value={groupFormData.sort_order}
                                onChange={(e) => setGroupFormData({ ...groupFormData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                min={0}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsGroupFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="flex-1 bg-matcha hover:bg-matcha/90">
                                {saving ? "Saving..." : editingGroup ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Group Delete Confirmation Modal */}
            <Dialog open={isGroupDeleteOpen} onOpenChange={setIsGroupDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Modifier Group
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deletingGroup?.name}&quot;? You must delete all modifiers in this group first.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsGroupDeleteOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleGroupDelete} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                            {saving ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modifier Create/Edit Modal */}
            <Dialog open={isModifierFormOpen} onOpenChange={setIsModifierFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso">
                            {editingModifier ? "Edit Modifier" : "Add Modifier"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingModifier ? "Update the modifier details" : "Add a new option to this group (e.g., 50% Sugar, Extra Boba)"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleModifierSubmit} className="space-y-4 mt-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Name *</label>
                            <input
                                type="text"
                                value={modifierFormData.name}
                                onChange={(e) => setModifierFormData({ ...modifierFormData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                placeholder="e.g., 50% Sugar"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Price Adjustment (₱)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={modifierFormData.price_adjustment}
                                onChange={(e) => setModifierFormData({ ...modifierFormData, price_adjustment: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                min={0}
                            />
                            <p className="text-xs text-espresso-light mt-1">Extra charge added when this option is selected</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={modifierFormData.is_active}
                                onChange={(e) => setModifierFormData({ ...modifierFormData, is_active: e.target.checked })}
                                className="w-4 h-4 text-matcha border-cream-dark rounded focus:ring-matcha"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-espresso">
                                Active (available for selection)
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-espresso mb-1">Display Order</label>
                            <input
                                type="number"
                                value={modifierFormData.sort_order}
                                onChange={(e) => setModifierFormData({ ...modifierFormData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-cream-dark rounded-xl focus:border-matcha focus:outline-none"
                                min={0}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsModifierFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="flex-1 bg-matcha hover:bg-matcha/90">
                                {saving ? "Saving..." : editingModifier ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modifier Delete Confirmation Modal */}
            <Dialog open={isModifierDeleteOpen} onOpenChange={setIsModifierDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-espresso flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Modifier
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deletingModifier?.name}&quot;? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsModifierDeleteOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleModifierDelete} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                            {saving ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
