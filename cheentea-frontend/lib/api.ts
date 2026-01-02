import { ApiResponse, Category, Product, ModifierGroup, Modifier, Order, Customer } from './types';

// API Base URL - set NEXT_PUBLIC_API_URL in .env.local to override
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Fetching: ${url}`, options?.body);

    // Add 30 second timeout (increased from 10s to handle cold starts and large responses)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit', // Don't send cookies - prevents CORS complications
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options?.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);

            // Try to parse JSON error response to get meaningful message
            try {
                const errorJson = JSON.parse(errorText);
                const message = errorJson.message || errorJson.error || `API Error: ${response.status}`;
                throw new Error(message);
            } catch (parseError) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }

        return response.json();
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - the server is not responding. Please try again.');
        }
        throw error;
    }
}

// ============== CATEGORIES ==============
export async function getCategories(): Promise<Category[]> {
    const res = await fetchApi<ApiResponse<Category[]>>('/categories');
    return res.data;
}

export async function getCategory(id: number): Promise<Category> {
    const res = await fetchApi<ApiResponse<Category>>(`/categories/${id}`);
    return res.data;
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
    const res = await fetchApi<ApiResponse<Category>>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function updateCategory(id: number, data: { name?: string; description?: string }): Promise<Category> {
    const res = await fetchApi<ApiResponse<Category>>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/categories/${id}`, {
        method: 'DELETE',
    });
}

// ============== PRODUCTS ==============
export async function getProducts(includeInactive = false): Promise<Product[]> {
    const query = includeInactive ? '?all=true' : '';
    const res = await fetchApi<ApiResponse<Product[]>>(`/products${query}`);
    return res.data;
}

export async function getProduct(id: number): Promise<Product> {
    const res = await fetchApi<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
}

export async function createProduct(data: {
    name: string;
    description?: string;
    category_id: number;
    sku: string;
    is_active?: boolean;
    sizes?: Array<{ size: string; price: number }>;
}): Promise<Product> {
    const res = await fetchApi<ApiResponse<Product>>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function updateProduct(id: number, data: {
    name?: string;
    description?: string;
    category_id?: number;
    sku?: string;
    is_active?: boolean;
    sizes?: Array<{ size: string; price: number }>;
}): Promise<Product> {
    const res = await fetchApi<ApiResponse<Product>>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/products/${id}`, {
        method: 'DELETE',
    });
}

export async function updateProductModifiers(
    productId: number,
    modifierGroupIds: number[]
): Promise<Product> {
    const res = await fetchApi<ApiResponse<Product>>(`/products/${productId}/modifiers`, {
        method: 'PUT',
        body: JSON.stringify({ modifier_group_ids: modifierGroupIds }),
    });
    return res.data;
}

// ============== IMAGE UPLOADS ==============

export async function uploadProductImage(productId: number, imageFile: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE}/products/${productId}/image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Failed to upload image');
        } catch {
            throw new Error('Failed to upload image: ' + response.status);
        }
    }

    const data = await response.json();
    return data.data;
}

export async function uploadCategoryImage(categoryId: number, imageFile: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE}/categories/${categoryId}/image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data;
}

export async function deleteProductImage(productId: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/products/${productId}/image`, {
        method: 'DELETE',
    });
}

export async function deleteCategoryImage(categoryId: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/categories/${categoryId}/image`, {
        method: 'DELETE',
    });
}

// ============== CUSTOMERS ==============
export async function getCustomers(): Promise<Customer[]> {
    const res = await fetchApi<ApiResponse<Customer[]>>('/customers');
    return res.data;
}

export async function getCustomer(id: number): Promise<Customer> {
    const res = await fetchApi<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data;
}

export async function createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
}): Promise<Customer> {
    const res = await fetchApi<ApiResponse<Customer>>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function updateCustomer(id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
}): Promise<Customer> {
    const res = await fetchApi<ApiResponse<Customer>>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function deleteCustomer(id: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/customers/${id}`, {
        method: 'DELETE',
    });
}

// Modifier Groups
export async function getModifierGroups(): Promise<ModifierGroup[]> {
    const res = await fetchApi<ApiResponse<ModifierGroup[]>>('/modifier-groups');
    return res.data;
}

export async function getModifierGroup(id: number): Promise<ModifierGroup> {
    const res = await fetchApi<ApiResponse<ModifierGroup>>(`/modifier-groups/${id}`);
    return res.data;
}

export async function createModifierGroup(data: {
    name: string;
    min_select?: number;
    max_select?: number;
    required?: boolean;
    sort_order?: number;
}): Promise<ModifierGroup> {
    const res = await fetchApi<ApiResponse<ModifierGroup>>('/modifier-groups', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function updateModifierGroup(id: number, data: {
    name?: string;
    min_select?: number;
    max_select?: number;
    required?: boolean;
    sort_order?: number;
}): Promise<ModifierGroup> {
    const res = await fetchApi<ApiResponse<ModifierGroup>>(`/modifier-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function deleteModifierGroup(id: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/modifier-groups/${id}`, {
        method: 'DELETE',
    });
}

// ============== MODIFIERS ==============
export async function getModifiers(): Promise<Modifier[]> {
    const res = await fetchApi<ApiResponse<Modifier[]>>('/modifiers');
    return res.data;
}

export async function getModifier(id: number): Promise<Modifier> {
    const res = await fetchApi<ApiResponse<Modifier>>(`/modifiers/${id}`);
    return res.data;
}

export async function createModifier(data: {
    modifier_group_id: number;
    name: string;
    price_adjustment?: number;
    is_active?: boolean;
    sort_order?: number;
}): Promise<Modifier> {
    const res = await fetchApi<ApiResponse<Modifier>>('/modifiers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function updateModifier(id: number, data: {
    modifier_group_id?: number;
    name?: string;
    price_adjustment?: number;
    is_active?: boolean;
    sort_order?: number;
}): Promise<Modifier> {
    const res = await fetchApi<ApiResponse<Modifier>>(`/modifiers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function deleteModifier(id: number): Promise<void> {
    await fetchApi<ApiResponse<null>>(`/modifiers/${id}`, {
        method: 'DELETE',
    });
}

// Orders - Kitchen Display
export async function getPendingOrders(): Promise<Order[]> {
    const res = await fetchApi<ApiResponse<Order[]>>('/orders/queue/pending');
    return res.data;
}

export async function getPreparingOrders(): Promise<Order[]> {
    const res = await fetchApi<ApiResponse<Order[]>>('/orders/queue/preparing');
    return res.data;
}

export async function getAllOrders(): Promise<Order[]> {
    const res = await fetchApi<ApiResponse<Order[]>>('/orders');
    return res.data;
}

export async function updateOrderStatus(
    orderId: number,
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
): Promise<Order> {
    const res = await fetchApi<ApiResponse<Order>>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return res.data;
}

export async function updateOrderItemStatus(
    orderId: number,
    itemId: number,
    status: 'pending' | 'preparing' | 'ready'
): Promise<Order> {
    const res = await fetchApi<ApiResponse<Order>>(`/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return res.data;
}

// Orders - Create (requires authentication)
// Orders - Create
export async function createOrder(
    orderData: {
        order_type: 'dine-in' | 'take-out';
        items: Array<{
            product_id: number;
            product_size_id: number;
            quantity: number;
            modifier_ids?: number[];
        }>;
    },
    token?: string
): Promise<Order> {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetchApi<ApiResponse<Order>>('/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData),
    });
    return res.data;
}

// Customer Login
export async function customerLogin(phone: string): Promise<{ token: string; customer: Customer }> {
    const res = await fetchApi<ApiResponse<{ token: string; customer: Customer }>>('/customer/login', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
    return res.data;
}

// Dashboard - Daily Sales Summary
export interface DailySalesSummary {
    date: string;
    drinks: {
        total: number;
        count: number;
    };
    snacks: {
        total: number;
        count: number;
    };
    overall: {
        total: number;
        orders_count: number;
    };
}

export async function getDailySales(): Promise<DailySalesSummary> {
    const res = await fetchApi<ApiResponse<DailySalesSummary>>('/dashboard/daily-sales');
    return res.data;
}

// ============== LOYALTY / REWARDS ==============

export interface LoyaltyCustomer {
    id: number;
    name: string;
    username: string;
    stamps: number;
    can_redeem: boolean;
    stamps_until_free: number;
}

export interface LoyaltyInfo {
    customer_name: string;
    stamps_pending: number; // Stamps to be earned when order is completed
    stamps_earned: number; // Always 0 at order creation - awarded on completion
    current_stamps: number; // Customer's current stamp count
    free_drink_redeemed: boolean;
    can_redeem: boolean;
    message?: string; // Message about pending stamps
}

export interface OrderWithLoyalty extends Order {
    loyalty?: LoyaltyInfo;
}

/**
 * Register a new customer account
 */
export async function registerCustomer(data: {
    name: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
}): Promise<{ id: number; name: string; username: string; stamps: number; message: string }> {
    const res = await fetchApi<ApiResponse<{ id: number; name: string; username: string; stamps: number; message: string }>>('/customers/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
    // Use base URL without /v1 prefix for email routes
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api').replace('/v1', '');
    const res = await fetch(`${baseUrl}/email/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
    }
    return data;
}

/**
 * Lookup customer by username
 */
export async function lookupCustomerByUsername(username: string): Promise<LoyaltyCustomer> {
    const res = await fetchApi<ApiResponse<LoyaltyCustomer>>(`/loyalty/lookup?username=${encodeURIComponent(username)}`);
    return res.data;
}

/**
 * Preview stamps for an order
 */
export async function previewStamps(items: Array<{ product_id: number; quantity: number }>): Promise<{ stamps_to_earn: number }> {
    const res = await fetchApi<ApiResponse<{ stamps_to_earn: number }>>('/loyalty/preview', {
        method: 'POST',
        body: JSON.stringify({ items }),
    });
    return res.data;
}

/**
 * Redeem free drink
 */
export async function redeemFreeDrink(customerId: number): Promise<{ redeemed: boolean; remaining_stamps: number; message: string }> {
    const res = await fetchApi<ApiResponse<{ redeemed: boolean; remaining_stamps: number; message: string }>>('/loyalty/redeem', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId }),
    });
    return res.data;
}

/**
 * Create order with optional loyalty tracking
 */
export async function createOrderWithLoyalty(
    orderData: {
        order_type: 'dine-in' | 'take-out';
        username?: string;
        redeem_free_drink?: boolean;
        items: Array<{
            product_id: number;
            product_size_id: number;
            quantity: number;
            modifier_ids?: number[];
            is_free_reward?: boolean;
            free_drink_base_price?: number;
        }>;
    },
    token?: string
): Promise<OrderWithLoyalty> {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetchApi<ApiResponse<OrderWithLoyalty>>('/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData),
    });
    return res.data;
}
