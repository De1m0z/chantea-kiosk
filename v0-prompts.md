# Cheentea Kiosk - v0 by Vercel Prompts

Use these prompts in [v0.dev](https://v0.dev) to generate the frontend for your Cheentea Kiosk.

---

## Brand Guidelines

- **Brand Name:** Cheentea
- **Color Palette:**
  - Cream: `#FFF8E7`
  - Matcha Green: `#7DB87D`
  - Brown Sugar: `#8B4513`
  - Coral Accent: `#FF6B6B`
- **Style:** Clean, playful, premium bubble tea aesthetic with rounded corners and soft shadows

---

## Page 1: Customer Menu Screen

```
Create a premium milk tea kiosk menu screen for "Cheentea" brand.

Design:
- Warm color palette: cream (#FFF8E7), matcha green (#7DB87D), brown sugar (#8B4513), coral accent (#FF6B6B)
- Friendly, modern aesthetic with rounded corners and soft shadows

Layout:
- Header: Cheentea logo, "Welcome! What would you like today?" greeting
- Category filter pills: All, Milk Tea, Fruit Tea, Specials, Snacks (horizontally scrollable)
- Product grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Each product card: large image, product name, price badge, subtle hover animation, "Add" button
- Floating cart FAB in bottom-right: shows item count badge and total price

Make it touch-optimized with large 48px+ tap targets. Use shadcn/ui components. Include empty state for "No products in this category".
```

---

## Page 2: Product Customization Modal

```
Create a product customization modal for a milk tea ordering kiosk.

Design: Warm cream/brown/green palette, rounded corners, premium feel.

Layout (side-by-side on desktop, stacked on mobile):
- Left: Large product image with name overlay
- Right side customization panel:
  1. Size selector: 3 buttons (S/M/L) with price differences (+$0, +$0.50, +$1.00)
  2. Sugar level: 5 segmented buttons (0%, 25%, 50%, 75%, 100%) with cute icons
  3. Ice level: 4 buttons (No Ice, Less, Regular, Extra) with ice cube icons
  4. Toppings: Checkbox cards with image, name, and +$0.50 price (Boba Pearls, Pudding, Coconut Jelly, Aloe Vera, Cheese Foam)
  5. Quantity: Minus/Plus stepper with number display
  6. Calculated total price updating in real-time
  7. Large "Add to Cart - $X.XX" button

Include close button, smooth slide-in animation. Use shadcn/ui Sheet or Dialog component.
```

---

## Page 3: Cart & Checkout

```
Create a cart and checkout page for a milk tea kiosk app.

Design: Warm cream/green palette, clean and simple for quick checkout.

Layout:
- Header: "Your Order" title with item count
- Cart items list:
  - Product thumbnail, name, customizations as tags (Medium, 50% sugar, Less ice, +Pearls)
  - Quantity stepper, item total price
  - Edit and remove icon buttons
- Order summary card: Subtotal, service fee, total
- Login section: "Log in for rewards" with phone number input or Google button
- Large sticky footer: "Place Order - $XX.XX" button

Include empty cart state with "Your cart is empty" illustration and "Browse Menu" button. Use shadcn/ui components.
```

---

## Page 4: Order Confirmation

```
Create an order confirmation screen for a milk tea kiosk.

Design: Warm cream/green palette, celebratory feel.

Layout:
- Success animation: Checkmark with confetti or bubble animation
- Order number: Large bold display "#001"
- Status message: "Your order is being prepared!"
- Estimated wait time: "Ready in ~5 minutes"
- Order summary: Collapsible list of items ordered
- Action buttons: "Track Order" (primary) and "Order More" (secondary)

Full screen centered layout. Include subtle pulsing animation on order number.
```

---

## Page 5: Kitchen Display System (KDS)

```
Create a kitchen display system for a bubble tea shop showing order queue.

Design: Dark theme for kitchen visibility (dark gray #1a1a1a background, white text)

Layout - 3-column Kanban board:
- Column 1 "NEW" (red header): New orders awaiting preparation
- Column 2 "PREPARING" (yellow header): Orders being made
- Column 3 "READY" (green header): Completed orders for pickup

Order cards:
- Order number large and bold (#001)
- Customer name
- List of items with customizations: "1x Taro Milk Tea (L, 50%, Less Ice, +Pearls)"
- Timer showing minutes:seconds since order placed (turns red if > 5 min)
- Tap to move to next column

Header: Current time, total orders today count, audio toggle button.

Full screen layout, optimized for wall-mounted tablet/monitor. Include new order notification animation.
```

---

## Page 6: Admin Dashboard

```
Create an admin dashboard for a milk tea shop management system.

Design: Clean professional look, light theme with green (#7DB87D) accent color.

Layout:
- Collapsible sidebar: Logo, nav items (Dashboard, Orders, Products, Categories, Customers, Reports), logout button
- Dashboard content:
  1. Stats row: Today's Revenue, Orders Today, Pending Orders, Top Product - as metric cards with icons
  2. Sales chart: Line/bar chart showing past 7 days revenue
  3. Orders by status: Donut chart (Pending, Preparing, Completed, Cancelled)
  4. Recent orders table: Order #, Customer, Items count, Total, Status badge, Time, Actions
  5. Top products: Horizontal bar chart or list with product images

Include date range picker, responsive sidebar that becomes hamburger menu on mobile. Use shadcn/ui components and Recharts for charts.
```

---

## Laravel API Integration

Once you export from v0, connect to your Laravel backend:

### API Service Layer

```typescript
// lib/api.ts
const API_BASE = 'http://localhost:8000/api/v1';

export const api = {
  // Products
  getProducts: () => fetch(`${API_BASE}/products`).then(r => r.json()),
  getProduct: (id: string) => fetch(`${API_BASE}/products/${id}`).then(r => r.json()),
  
  // Categories
  getCategories: () => fetch(`${API_BASE}/categories`).then(r => r.json()),
  
  // Modifier groups (for customization options)
  getModifierGroups: () => fetch(`${API_BASE}/modifier-groups`).then(r => r.json()),
  
  // Orders
  createOrder: (data: any, token: string) => fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  // Kitchen queue
  getPendingOrders: () => fetch(`${API_BASE}/orders/queue/pending`).then(r => r.json()),
  getPreparingOrders: () => fetch(`${API_BASE}/orders/queue/preparing`).then(r => r.json()),
  
  // Customer auth
  customerLogin: (phone: string) => fetch(`${API_BASE}/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  }).then(r => r.json()),
};
```

### API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/categories` | GET | List all categories |
| `/api/v1/products` | GET | List all products |
| `/api/v1/products/{id}` | GET | Get product details |
| `/api/v1/modifier-groups` | GET | Get customization options |
| `/api/v1/orders` | POST | Create new order (requires auth) |
| `/api/v1/orders/queue/pending` | GET | Kitchen: pending orders |
| `/api/v1/orders/queue/preparing` | GET | Kitchen: orders being made |
| `/api/v1/customer/login` | POST | Customer login |

---

## Tips for v0

1. **Generate one page at a time** for best results
2. **Iterate and refine** - ask v0 to adjust specific elements
3. **Export to Next.js** - v0 outputs React/Next.js code by default
4. **Update API calls** - Replace mock data with real API calls using the service layer above
