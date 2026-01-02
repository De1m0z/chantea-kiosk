// API Types matching Laravel backend response structure

export interface Category {
    id: number;
    name: string;
    description: string | null;
    image_url?: string | null;
    products_count?: number;
    products?: Product[];
    created_at: string;
    updated_at: string;
}

export interface ProductSize {
    id: number;
    product_id: number;
    size: string;
    price: number;
    created_at: string;
    updated_at: string;
}

export interface Modifier {
    id: number;
    modifier_group_id: number;
    name: string;
    price_adjustment: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ModifierGroup {
    id: number;
    name: string;
    description: string | null;
    is_required: boolean;
    max_selections: number;
    modifiers: Modifier[];
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    sku: string;
    is_active: boolean;
    image_url?: string | null;
    category?: Category;
    sizes: ProductSize[];
    modifier_groups?: ModifierGroup[];
    created_at: string;
    updated_at: string;
}

export interface OrderItemModifier {
    id: number;
    order_item_id: number;
    modifier_id: number;
    price_adjustment: number;
    modifier?: Modifier;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_size_id: number;
    quantity: number;
    unit_price: number;
    line_total: number;
    is_free_reward?: boolean;
    status?: 'pending' | 'preparing' | 'ready';
    product?: Product;
    product_size?: ProductSize;
    modifiers?: OrderItemModifier[];
}

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
}

export interface Order {
    id: number;
    customer_id: number;
    user_id: number | null;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    order_type: 'dine-in' | 'take-out';
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    customer?: Customer;
    items: OrderItem[];
    created_at?: string;
}

// Cart types for frontend state management
export interface CartItemCustomization {
    size: ProductSize;
    sugarLevel: number;
    iceLevel: string;
    toppings: Modifier[];
    sugarModifier?: Modifier;
    iceModifier?: Modifier;
}

export interface CartItem {
    id: string;
    product: Product;
    customization: CartItemCustomization;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
