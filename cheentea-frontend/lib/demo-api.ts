import {
  Category,
  Customer,
  Modifier,
  ModifierGroup,
  Order,
  OrderItem,
  Product,
  ProductSize,
} from "./types";
import { sitePath } from "./site-path";

type DailySalesSummary = {
  date: string;
  drinks: { total: number; count: number };
  snacks: { total: number; count: number };
  overall: { total: number; orders_count: number };
};

type LoyaltyCustomer = {
  id: number;
  name: string;
  username: string;
  stamps: number;
  can_redeem: boolean;
  stamps_until_free: number;
};

type OrderWithLoyalty = Order & {
  loyalty?: {
    customer_name: string;
    stamps_pending: number;
    stamps_earned: number;
    current_stamps: number;
    free_drink_redeemed: boolean;
    can_redeem: boolean;
    message?: string;
  };
};

type VoiceOrderResult = {
  items: Array<{
    product_id: number;
    product_name: string;
    product_size_id: number;
    size_name: string;
    quantity: number;
    modifier_ids: number[];
    modifier_names: string[];
    unit_price: number;
    notes: string;
  }>;
  not_found: string[];
  message: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type DemoCustomer = Customer & {
  username?: string;
  stamps?: number;
};

type DemoState = {
  categories: Category[];
  products: Product[];
  modifierGroups: ModifierGroup[];
  customers: DemoCustomer[];
  orders: Order[];
  nextCategoryId: number;
  nextProductId: number;
  nextProductSizeId: number;
  nextModifierGroupId: number;
  nextModifierId: number;
  nextCustomerId: number;
  nextOrderId: number;
  nextOrderItemId: number;
};

const DEMO_STORAGE_KEY = "cheentea-kiosk-demo-state-v2";

function now() {
  return new Date().toISOString();
}

function response<T>(data: T, message = "Demo response"): ApiResponse<T> {
  return { success: true, message, data };
}

function demoImage(name: string) {
  return sitePath(`/demo-menu/${name}`);
}

function size(id: number, productId: number, label: string, price: number): ProductSize {
  return {
    id,
    product_id: productId,
    size: label,
    price,
    created_at: now(),
    updated_at: now(),
  };
}

function modifier(
  id: number,
  groupId: number,
  name: string,
  price: number,
  sortOrder: number,
): Modifier {
  return {
    id,
    modifier_group_id: groupId,
    name,
    price_adjustment: price,
    is_active: true,
    sort_order: sortOrder,
    created_at: now(),
    updated_at: now(),
  };
}

function createInitialState(): DemoState {
  const categories: Category[] = [
    {
      id: 1,
      name: "Milk Tea Series",
      description: "Classic milk teas with chewy add-ons.",
      products_count: 4,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 2,
      name: "Fruit Tea Series",
      description: "Refreshing fruit tea blends.",
      products_count: 3,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 3,
      name: "Food",
      description: "Snacks to pair with drinks.",
      products_count: 2,
      created_at: now(),
      updated_at: now(),
    },
  ];

  const sugar = {
    id: 1,
    name: "Sugar Level",
    description: "Choose preferred sweetness.",
    is_required: true,
    max_selections: 1,
    created_at: now(),
    updated_at: now(),
    modifiers: [
      modifier(1, 1, "25% sugar", 0, 1),
      modifier(2, 1, "50% sugar", 0, 2),
      modifier(3, 1, "100% sugar", 0, 3),
    ],
  };
  const ice = {
    id: 2,
    name: "Ice Level",
    description: "Choose preferred ice.",
    is_required: true,
    max_selections: 1,
    created_at: now(),
    updated_at: now(),
    modifiers: [
      modifier(4, 2, "Less ice", 0, 1),
      modifier(5, 2, "Regular ice", 0, 2),
    ],
  };
  const toppings = {
    id: 3,
    name: "Toppings",
    description: "Optional add-ons.",
    is_required: false,
    max_selections: 3,
    created_at: now(),
    updated_at: now(),
    modifiers: [
      modifier(6, 3, "Pearls", 15, 1),
      modifier(7, 3, "Cream cheese", 25, 2),
      modifier(8, 3, "Coffee jelly", 20, 3),
    ],
  };
  const modifierGroups: ModifierGroup[] = [sugar, ice, toppings];

  const products: Product[] = [
    {
      id: 1,
      category_id: 1,
      name: "Classic Milk Tea",
      description: "Creamy black tea with brown sugar pearls.",
      sku: "CMT-001",
      is_active: true,
      image_url: demoImage("classic-milk-tea.webp"),
      sizes: [size(1, 1, "Regular", 89), size(2, 1, "Large", 109)],
      modifier_groups: modifierGroups,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 2,
      category_id: 1,
      name: "Brown Sugar Boba",
      description: "Fresh milk with brown sugar syrup and pearls.",
      sku: "BSB-002",
      is_active: true,
      image_url: demoImage("brown-sugar-boba.webp"),
      sizes: [size(3, 2, "Regular", 109), size(4, 2, "Large", 129)],
      modifier_groups: modifierGroups,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 3,
      category_id: 1,
      name: "Taro Milk Tea",
      description: "Smooth taro milk tea with a rich finish.",
      sku: "TMT-003",
      is_active: true,
      image_url: demoImage("taro-milk-tea.webp"),
      sizes: [size(5, 3, "Regular", 99), size(6, 3, "Large", 119)],
      modifier_groups: modifierGroups,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 4,
      category_id: 1,
      name: "Matcha Latte",
      description: "Earthy matcha with milk and soft sweetness.",
      sku: "ML-004",
      is_active: true,
      image_url: demoImage("matcha-latte.webp"),
      sizes: [size(7, 4, "Regular", 119), size(8, 4, "Large", 139)],
      modifier_groups: modifierGroups,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 5,
      category_id: 2,
      name: "Mango Green Tea",
      description: "Green tea with mango fruit notes.",
      sku: "MGT-005",
      is_active: true,
      image_url: demoImage("mango-green-tea.webp"),
      sizes: [size(9, 5, "Regular", 89), size(10, 5, "Large", 109)],
      modifier_groups: [sugar, ice, toppings],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 6,
      category_id: 2,
      name: "Passion Fruit Tea",
      description: "Bright fruit tea with a tart finish.",
      sku: "PFT-006",
      is_active: true,
      image_url: demoImage("passion-fruit-tea.webp"),
      sizes: [size(11, 6, "Regular", 89), size(12, 6, "Large", 109)],
      modifier_groups: [sugar, ice, toppings],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 7,
      category_id: 2,
      name: "Peach Oolong Tea",
      description: "Oolong tea with peach aroma.",
      sku: "POT-007",
      is_active: true,
      image_url: demoImage("peach-oolong-tea.webp"),
      sizes: [size(13, 7, "Regular", 95), size(14, 7, "Large", 115)],
      modifier_groups: [sugar, ice, toppings],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 8,
      category_id: 3,
      name: "Egg Waffles",
      description: "Crisp outside, soft inside.",
      sku: "EW-008",
      is_active: true,
      image_url: demoImage("egg-waffles.webp"),
      sizes: [size(15, 8, "One order", 95)],
      modifier_groups: [],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 9,
      category_id: 3,
      name: "Popcorn Chicken",
      description: "Bite-sized fried chicken snack.",
      sku: "PC-009",
      is_active: true,
      image_url: demoImage("popcorn-chicken.webp"),
      sizes: [size(16, 9, "One order", 109)],
      modifier_groups: [],
      created_at: now(),
      updated_at: now(),
    },
  ];

  const customers: DemoCustomer[] = [
    {
      id: 1,
      name: "Russel Buisan",
      username: "russel",
      phone: "0917-000-1001",
      email: "russel@example.com",
      stamps: 7,
    },
    {
      id: 2,
      name: "Mika Santos",
      username: "mika",
      phone: "0917-000-1002",
      email: "mika@example.com",
      stamps: 10,
    },
  ];

  const orders = [
    buildOrder(101, "pending", "dine-in", customers[0], [
      { product: products[0], sizeId: 2, quantity: 1, modifierIds: [2, 5, 6] },
      { product: products[7], sizeId: 15, quantity: 1, modifierIds: [] },
    ]),
    buildOrder(102, "preparing", "take-out", customers[1], [
      { product: products[1], sizeId: 3, quantity: 2, modifierIds: [3, 5, 6] },
    ]),
    buildOrder(103, "ready", "take-out", undefined, [
      { product: products[4], sizeId: 10, quantity: 1, modifierIds: [2, 4] },
    ]),
  ];

  return {
    categories,
    products,
    modifierGroups,
    customers,
    orders,
    nextCategoryId: 4,
    nextProductId: 10,
    nextProductSizeId: 17,
    nextModifierGroupId: 4,
    nextModifierId: 9,
    nextCustomerId: 3,
    nextOrderId: 104,
    nextOrderItemId: 1000,
  };
}

function buildOrder(
  id: number,
  status: Order["status"],
  orderType: Order["order_type"],
  customer: DemoCustomer | undefined,
  items: Array<{
    product: Product;
    sizeId: number;
    quantity: number;
    modifierIds: number[];
  }>,
): Order {
  const orderItems: OrderItem[] = items.map((item, index) => {
    const productSize = item.product.sizes.find((entry) => entry.id === item.sizeId) || item.product.sizes[0];
    const modifiers = (item.product.modifier_groups || [])
      .flatMap((group) => group.modifiers)
      .filter((entry) => item.modifierIds.includes(entry.id));
    const modifierTotal = modifiers.reduce((sum, entry) => sum + Number(entry.price_adjustment), 0);
    const unitPrice = Number(productSize?.price || 0) + modifierTotal;

    return {
      id: id * 10 + index,
      order_id: id,
      product_id: item.product.id,
      product_size_id: productSize?.id || 0,
      quantity: item.quantity,
      unit_price: unitPrice,
      line_total: unitPrice * item.quantity,
      status: status === "pending" ? "pending" : status === "ready" ? "ready" : "preparing",
      product: item.product,
      product_size: productSize,
      modifiers: modifiers.map((entry, modifierIndex) => ({
        id: id * 100 + modifierIndex,
        order_item_id: id * 10 + index,
        modifier_id: entry.id,
        price_adjustment: entry.price_adjustment,
        modifier: entry,
        created_at: now(),
        updated_at: now(),
      })),
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);
  const tax = 0;
  const discount = 0;

  return {
    id,
    customer_id: customer?.id || 0,
    user_id: null,
    status,
    order_type: orderType,
    subtotal,
    tax,
    discount,
    total: subtotal + tax - discount,
    customer,
    items: orderItems,
    created_at: now(),
  };
}

function getState(): DemoState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const saved = window.localStorage.getItem(DEMO_STORAGE_KEY);
  if (!saved) {
    const initial = createInitialState();
    saveState(initial);
    return initial;
  }

  try {
    return JSON.parse(saved) as DemoState;
  } catch {
    const initial = createInitialState();
    saveState(initial);
    return initial;
  }
}

function saveState(state: DemoState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  }
}

function withCategoryProducts(state: DemoState, categories = state.categories) {
  return categories.map((category) => ({
    ...category,
    products_count: state.products.filter((product) => product.category_id === category.id).length,
  }));
}

function allModifiers(state: DemoState) {
  return state.modifierGroups.flatMap((group) => group.modifiers);
}

function nextId(items: Array<{ id: number }>, fallback: number) {
  return Math.max(fallback, ...items.map((item) => item.id + 1));
}

function parseBody(options?: RequestInit) {
  if (!options?.body || typeof options.body !== "string") return {};
  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function splitEndpoint(endpoint: string) {
  const [path, queryString = ""] = endpoint.split("?");
  return { path, query: new URLSearchParams(queryString) };
}

function findProduct(state: DemoState, id: number) {
  return state.products.find((product) => product.id === id);
}

function findCustomerByUsername(state: DemoState, username: string) {
  return state.customers.find((customer) => customer.username?.toLowerCase() === username.toLowerCase());
}

function hydrateProductModifiers(product: Product, state: DemoState) {
  const ids = product.modifier_groups?.map((group) => group.id) || state.modifierGroups.map((group) => group.id);
  return {
    ...product,
    modifier_groups: state.modifierGroups.filter((group) => ids.includes(group.id)),
  };
}

function buildOrderFromPayload(state: DemoState, payload: Record<string, unknown>) {
  const id = state.nextOrderId++;
  const customer =
    typeof payload.username === "string"
      ? findCustomerByUsername(state, payload.username)
      : undefined;
  const payloadItems = Array.isArray(payload.items) ? payload.items : [];
  const orderItems: OrderItem[] = payloadItems.map((rawItem, index) => {
    const item = rawItem as Record<string, unknown>;
    const product = findProduct(state, Number(item.product_id)) || state.products[0];
    const productSize = product.sizes.find((entry) => entry.id === Number(item.product_size_id)) || product.sizes[0];
    const modifierIds = Array.isArray(item.modifier_ids)
      ? (item.modifier_ids as unknown[]).map(Number)
      : [];
    const modifiers = allModifiers(state).filter((entry) => modifierIds.includes(entry.id));
    const modifierTotal = modifiers.reduce((sum, entry) => sum + Number(entry.price_adjustment), 0);
    const unitPrice = (Number(productSize?.price) || 0) + modifierTotal;
    const quantity = Number(item.quantity) || 1;

    return {
      id: state.nextOrderItemId++,
      order_id: id,
      product_id: product.id,
      product_size_id: productSize?.id || 0,
      quantity,
      unit_price: unitPrice,
      line_total: unitPrice * quantity,
      is_free_reward: Boolean(item.is_free_reward),
      status: "pending",
      product,
      product_size: productSize,
      modifiers: modifiers.map((entry) => ({
        id: state.nextOrderItemId++,
        order_item_id: state.nextOrderItemId + index,
        modifier_id: entry.id,
        price_adjustment: entry.price_adjustment,
        modifier: entry,
        created_at: now(),
        updated_at: now(),
      })),
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);

  const order: OrderWithLoyalty = {
    id,
    customer_id: customer?.id || 0,
    user_id: null,
    status: "pending",
    order_type: payload.order_type === "dine-in" ? "dine-in" : "take-out",
    subtotal,
    tax: 0,
    discount: 0,
    total: subtotal,
    customer,
    items: orderItems,
    created_at: now(),
    loyalty: customer
      ? {
          customer_name: customer.name,
          stamps_pending: orderItems.reduce((sum, item) => sum + item.quantity, 0),
          stamps_earned: 0,
          current_stamps: customer.stamps || 0,
          free_drink_redeemed: Boolean(payload.redeem_free_drink),
          can_redeem: (customer.stamps || 0) >= 10,
          message: "Demo stamps are pending until staff completes the order.",
        }
      : undefined,
  };

  state.orders.unshift(order);
  return order;
}

export async function demoFetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const state = getState();
  const method = (options?.method || "GET").toUpperCase();
  const body = parseBody(options);
  const { path, query } = splitEndpoint(endpoint);

  if (path === "/categories" && method === "GET") {
    return response(withCategoryProducts(state)) as T;
  }
  if (path === "/categories" && method === "POST") {
    const category: Category = {
      id: state.nextCategoryId++,
      name: String(body.name || "New Category"),
      description: typeof body.description === "string" ? body.description : null,
      products_count: 0,
      created_at: now(),
      updated_at: now(),
    };
    state.categories.push(category);
    saveState(state);
    return response(category, "Category created") as T;
  }
  if (path.startsWith("/categories/")) {
    const id = Number(path.split("/")[2]);
    const category = state.categories.find((item) => item.id === id);
    if (method === "PUT" && category) {
      Object.assign(category, {
        name: body.name ?? category.name,
        description: body.description ?? category.description,
        updated_at: now(),
      });
      saveState(state);
      return response(category, "Category updated") as T;
    }
    if (method === "DELETE") {
      state.categories = state.categories.filter((item) => item.id !== id);
      saveState(state);
      return response(null) as T;
    }
    return response(category) as T;
  }

  if (path === "/products" && method === "GET") {
    const products = query.get("all") === "true" ? state.products : state.products.filter((item) => item.is_active);
    return response(products.map((product) => hydrateProductModifiers(product, state))) as T;
  }
  if (path === "/products" && method === "POST") {
    const productId = state.nextProductId++;
    const sizes = Array.isArray(body.sizes)
      ? (body.sizes as Array<Record<string, unknown>>).map((entry) =>
          size(state.nextProductSizeId++, productId, String(entry.size || "Regular"), Number(entry.price) || 0),
        )
      : [size(state.nextProductSizeId++, productId, "Regular", 0)];
    const product: Product = {
      id: productId,
      category_id: Number(body.category_id) || state.categories[0]?.id || 1,
      name: String(body.name || "New Product"),
      description: typeof body.description === "string" ? body.description : null,
      sku: String(body.sku || `DEMO-${productId}`),
      is_active: body.is_active !== false,
      image_url: demoImage("classic-milk-tea.webp"),
      sizes,
      modifier_groups: [],
      created_at: now(),
      updated_at: now(),
    };
    state.products.push(product);
    saveState(state);
    return response(product, "Product created") as T;
  }
  if (path.startsWith("/products/")) {
    const [, , idPart, child] = path.split("/");
    const id = Number(idPart);
    const product = findProduct(state, id);
    if (child === "modifiers" && method === "PUT" && product) {
      const ids = Array.isArray(body.modifier_group_ids)
        ? (body.modifier_group_ids as unknown[]).map(Number)
        : [];
      product.modifier_groups = state.modifierGroups.filter((group) => ids.includes(group.id));
      product.updated_at = now();
      saveState(state);
      return response(product, "Product modifiers updated") as T;
    }
    if (method === "PUT" && product) {
      const nextSizes = Array.isArray(body.sizes)
        ? (body.sizes as Array<Record<string, unknown>>).map((entry) =>
            size(state.nextProductSizeId++, product.id, String(entry.size || "Regular"), Number(entry.price) || 0),
          )
        : product.sizes;
      Object.assign(product, {
        name: body.name ?? product.name,
        description: body.description ?? product.description,
        category_id: Number(body.category_id) || product.category_id,
        sku: body.sku ?? product.sku,
        is_active: body.is_active ?? product.is_active,
        sizes: nextSizes,
        updated_at: now(),
      });
      saveState(state);
      return response(product, "Product updated") as T;
    }
    if (method === "DELETE") {
      state.products = state.products.filter((item) => item.id !== id);
      saveState(state);
      return response(null) as T;
    }
    return response(product) as T;
  }

  if (path === "/customers" && method === "GET") {
    return response(state.customers) as T;
  }
  if (path === "/customers" && method === "POST") {
    const customer: DemoCustomer = {
      id: state.nextCustomerId++,
      name: String(body.name || "New Customer"),
      email: String(body.email || "customer@example.com"),
      phone: typeof body.phone === "string" ? body.phone : null,
      username: String(body.email || `customer${state.nextCustomerId}`).split("@")[0],
      stamps: 0,
    };
    state.customers.push(customer);
    saveState(state);
    return response(customer, "Customer created") as T;
  }
  if (path.startsWith("/customers/") && path !== "/customers/register") {
    const id = Number(path.split("/")[2]);
    const customer = state.customers.find((item) => item.id === id);
    if (method === "PUT" && customer) {
      Object.assign(customer, {
        name: body.name ?? customer.name,
        email: body.email ?? customer.email,
        phone: body.phone ?? customer.phone,
      });
      saveState(state);
      return response(customer, "Customer updated") as T;
    }
    if (method === "DELETE") {
      state.customers = state.customers.filter((item) => item.id !== id);
      saveState(state);
      return response(null) as T;
    }
    return response(customer) as T;
  }

  if (path === "/modifier-groups" && method === "GET") {
    return response(state.modifierGroups) as T;
  }
  if (path === "/modifier-groups" && method === "POST") {
    const group: ModifierGroup = {
      id: state.nextModifierGroupId++,
      name: String(body.name || "New Modifier Group"),
      description: typeof body.description === "string" ? body.description : null,
      is_required: Boolean(body.required),
      max_selections: Number(body.max_select) || 1,
      modifiers: [],
      created_at: now(),
      updated_at: now(),
    };
    state.modifierGroups.push(group);
    saveState(state);
    return response(group, "Modifier group created") as T;
  }
  if (path.startsWith("/modifier-groups/")) {
    const id = Number(path.split("/")[2]);
    const group = state.modifierGroups.find((item) => item.id === id);
    if (method === "PUT" && group) {
      Object.assign(group, {
        name: body.name ?? group.name,
        is_required: body.required ?? group.is_required,
        max_selections: Number(body.max_select) || group.max_selections,
        updated_at: now(),
      });
      saveState(state);
      return response(group, "Modifier group updated") as T;
    }
    if (method === "DELETE") {
      state.modifierGroups = state.modifierGroups.filter((item) => item.id !== id);
      saveState(state);
      return response(null) as T;
    }
    return response(group) as T;
  }

  if (path === "/modifiers" && method === "GET") {
    return response(allModifiers(state)) as T;
  }
  if (path === "/modifiers" && method === "POST") {
    const group = state.modifierGroups.find((item) => item.id === Number(body.modifier_group_id));
    const created = modifier(
      state.nextModifierId++,
      group?.id || state.modifierGroups[0].id,
      String(body.name || "New Modifier"),
      Number(body.price_adjustment) || 0,
      Number(body.sort_order) || 1,
    );
    created.is_active = body.is_active !== false;
    group?.modifiers.push(created);
    saveState(state);
    return response(created, "Modifier created") as T;
  }
  if (path.startsWith("/modifiers/")) {
    const id = Number(path.split("/")[2]);
    const group = state.modifierGroups.find((entry) => entry.modifiers.some((item) => item.id === id));
    const modifierItem = group?.modifiers.find((item) => item.id === id);
    if (method === "PUT" && modifierItem) {
      Object.assign(modifierItem, {
        name: body.name ?? modifierItem.name,
        price_adjustment: body.price_adjustment ?? modifierItem.price_adjustment,
        is_active: body.is_active ?? modifierItem.is_active,
        sort_order: body.sort_order ?? modifierItem.sort_order,
        updated_at: now(),
      });
      saveState(state);
      return response(modifierItem, "Modifier updated") as T;
    }
    if (method === "DELETE" && group) {
      group.modifiers = group.modifiers.filter((item) => item.id !== id);
      saveState(state);
      return response(null) as T;
    }
    return response(modifierItem) as T;
  }

  if (path === "/orders/queue/pending") {
    return response(state.orders.filter((order) => order.status === "pending")) as T;
  }
  if (path === "/orders/queue/preparing") {
    return response(state.orders.filter((order) => order.status === "preparing")) as T;
  }
  if (path === "/orders" && method === "GET") {
    return response(state.orders) as T;
  }
  if (path === "/orders" && method === "POST") {
    const order = buildOrderFromPayload(state, body);
    saveState(state);
    return response(order, "Order created") as T;
  }
  if (path.match(/^\/orders\/\d+\/status$/) && method === "PATCH") {
    const orderId = Number(path.split("/")[2]);
    const order = state.orders.find((item) => item.id === orderId);
    if (order) {
      order.status = body.status as Order["status"];
      order.items = order.items.map((item) => ({
        ...item,
        status: order.status === "ready" ? "ready" : order.status === "preparing" ? "preparing" : item.status,
      }));
      saveState(state);
    }
    return response(order) as T;
  }
  if (path.match(/^\/orders\/\d+\/items\/\d+\/status$/) && method === "PATCH") {
    const parts = path.split("/");
    const order = state.orders.find((item) => item.id === Number(parts[2]));
    const orderItem = order?.items.find((item) => item.id === Number(parts[4]));
    if (orderItem) {
      orderItem.status = body.status as OrderItem["status"];
      if (order && order.items.every((item) => item.status === "ready")) order.status = "ready";
      else if (order && order.items.some((item) => item.status === "preparing" || item.status === "ready")) order.status = "preparing";
      saveState(state);
    }
    return response(order) as T;
  }

  if (path === "/dashboard/daily-sales") {
    const completed = state.orders.filter((order) => order.status === "completed");
    const fallback = state.orders;
    const orders = completed.length ? completed : fallback;
    const drinksTotal = orders.reduce((sum, order) => sum + order.items
      .filter((item) => item.product?.category_id !== 3)
      .reduce((itemSum, item) => itemSum + item.line_total, 0), 0);
    const snacksTotal = orders.reduce((sum, order) => sum + order.items
      .filter((item) => item.product?.category_id === 3)
      .reduce((itemSum, item) => itemSum + item.line_total, 0), 0);
    const summary: DailySalesSummary = {
      date: new Date().toISOString().slice(0, 10),
      drinks: { total: drinksTotal, count: orders.length },
      snacks: { total: snacksTotal, count: orders.length },
      overall: { total: drinksTotal + snacksTotal, orders_count: orders.length },
    };
    return response(summary) as T;
  }

  if (path === "/customers/register" && method === "POST") {
    const customer: DemoCustomer = {
      id: state.nextCustomerId++,
      name: String(body.name || "Demo Customer"),
      email: String(body.email || "demo@example.com"),
      phone: typeof body.phone === "string" ? body.phone : null,
      username: String(body.username || `demo${state.nextCustomerId}`).toLowerCase(),
      stamps: 0,
    };
    state.customers.push(customer);
    saveState(state);
    return response({
      id: customer.id,
      name: customer.name,
      username: customer.username || "",
      stamps: customer.stamps || 0,
      message: "Demo account created. Use this username at checkout.",
    }) as T;
  }
  if (path === "/loyalty/lookup") {
    const username = query.get("username") || "";
    const customer = findCustomerByUsername(state, username);
    if (!customer) throw new Error("Demo account not found. Try russel or mika.");
    const loyalty: LoyaltyCustomer = {
      id: customer.id,
      name: customer.name,
      username: customer.username || "",
      stamps: customer.stamps || 0,
      can_redeem: (customer.stamps || 0) >= 10,
      stamps_until_free: Math.max(0, 10 - (customer.stamps || 0)),
    };
    return response(loyalty) as T;
  }
  if (path === "/loyalty/preview" && method === "POST") {
    const items = Array.isArray(body.items) ? body.items : [];
    const stampsToEarn = items.reduce((sum, raw) => sum + (Number((raw as { quantity?: number }).quantity) || 1), 0);
    return response({ stamps_to_earn: stampsToEarn }) as T;
  }
  if (path === "/loyalty/redeem" && method === "POST") {
    const customer = state.customers.find((item) => item.id === Number(body.customer_id));
    if (customer && (customer.stamps || 0) >= 10) customer.stamps = (customer.stamps || 0) - 10;
    saveState(state);
    return response({
      redeemed: Boolean(customer),
      remaining_stamps: customer?.stamps || 0,
      message: "Demo reward applied.",
    }) as T;
  }
  if (path === "/voice-order" && method === "POST") {
    const transcript = String(body.transcript || "").toLowerCase();
    const matches = state.products.filter((product) => transcript.includes(product.name.toLowerCase().split(" ")[0]));
    const chosen = matches.length ? matches : [state.products[0]];
    const result: VoiceOrderResult = {
      items: chosen.slice(0, 2).map((product) => ({
        product_id: product.id,
        product_name: product.name,
        product_size_id: product.sizes[0].id,
        size_name: product.sizes[0].size,
        quantity: transcript.includes("two") ? 2 : 1,
        modifier_ids: [],
        modifier_names: [],
        unit_price: Number(product.sizes[0].price),
        notes: "Demo voice order match",
      })),
      not_found: [],
      message: "Demo voice order parsed with sample menu data.",
    };
    return response(result) as T;
  }

  throw new Error(`Demo endpoint is not implemented: ${method} ${endpoint}`);
}

export async function demoUploadImage(): Promise<{ image_url: string }> {
  return { image_url: demoImage("classic-milk-tea.webp") };
}

export async function demoResendVerificationEmail(): Promise<{ message: string }> {
  return { message: "Demo verification email marked as sent." };
}
