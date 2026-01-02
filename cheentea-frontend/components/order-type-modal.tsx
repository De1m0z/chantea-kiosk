"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Utensils, ShoppingBasket } from "lucide-react"

interface OrderTypeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (type: "dine-in" | "take-out") => void
}

export function OrderTypeModal({ open, onOpenChange, onSelect }: OrderTypeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-2xl w-[90vw] p-0 bg-white rounded-3xl shadow-2xl border-0 overflow-hidden focus:outline-none"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Hide the default close button */}
                <style jsx global>{`
                    [data-radix-dialog-content] > button[class*="absolute"][class*="right"] {
                        display: none !important;
                    }
                `}</style>

                <div className="py-12 px-8 relative z-10">
                    <DialogHeader className="mb-10 space-y-3">
                        <DialogTitle className="text-4xl font-serif font-bold text-espresso text-center tracking-tight">
                            Welcome to Cheentea
                        </DialogTitle>
                        <DialogDescription className="text-lg text-espresso-light text-center font-sans max-w-md mx-auto leading-relaxed">
                            Please select your dining preference to begin
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                        <button
                            type="button"
                            onClick={() => onSelect("dine-in")}
                            className="group relative h-48 rounded-2xl bg-matcha overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-matcha/50"
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            <div className="relative h-full flex flex-col items-center justify-center p-6 text-white z-10">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Utensils className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-1">Dine In</h3>
                                <p className="text-white/80 text-sm">Enjoy in store</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => onSelect("take-out")}
                            className="group relative h-48 rounded-2xl bg-espresso overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-espresso/50"
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            <div className="relative h-full flex flex-col items-center justify-center p-6 text-white z-10">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <ShoppingBasket className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-1">Take Out</h3>
                                <p className="text-white/80 text-sm">Grab and go</p>
                            </div>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
