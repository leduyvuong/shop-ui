const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');

const resolveUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(`${API_BASE_URL}${normalizedPath}`);
};

const appendSearchParams = (url, params) => {
  if (!params) return url;
  const entries = params instanceof URLSearchParams ? params : Object.entries(params);
  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  } else {
    for (const [key, value] of entries) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, value);
    }
  }
  return url;
};

const parseErrorMessage = (payload) => {
  if (!payload) return 'Request failed';
  if (payload.message) return payload.message;
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors.join(', ');
  }
  return 'Request failed';
};

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export async function request(path, { method = 'GET', headers = {}, searchParams, body, ...rest } = {}) {
  const url = resolveUrl(path);
  appendSearchParams(url, searchParams);

  const requestHeaders = new Headers({ Accept: 'application/json', ...headers });
  
  // Add JWT token if available
  const token = window.localStorage.getItem('shop-auth-token') || window.localStorage.getItem('admin_token');
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }
  
  let requestBody = body;

  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), {
    method,
    headers: requestHeaders,
    body: requestBody,
    ...rest,
  });

  let payload = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  }

  if (!response.ok || (payload && payload.success === false)) {
    throw new Error(parseErrorMessage(payload));
  }

  return payload;
}

export const mapProduct = (product) => {
  if (!product) return null;

  const effectivePrice = toNumber(
    product.effective_price ?? product.sale_price ?? product.price ?? product.effectivePrice ?? 0,
  );
  const regularPrice = toNumber(product.price ?? effectivePrice);
  const salePrice = product.sale_price != null ? toNumber(product.sale_price) : null;

  const images = Array.isArray(product.product_images) ? product.product_images : [];
  const primaryImage =
    product.image ?? images.find((entry) => entry?.image_url)?.image_url ?? images[0]?.url ?? images[0]?.src ?? '';
  const fallbackImage = 'https://placehold.co/400x400?text=No+Image';

  const ratingValue = toNumber(
    product.rating?.average ?? product.rating?.rate ?? product.average_rating ?? product.avg_rating ?? 0,
  );
  const ratingCount = toNumber(product.rating?.count ?? product.reviews_count ?? product.review_count ?? 0);

  return {
    id: product.id,
    title: product.name ?? product.title ?? 'Unnamed product',
    description: product.description ?? '',
    category: product.category?.name ?? product.category ?? '',
    categoryId: product.category?.id ?? null,
    categorySlug: product.category?.slug ?? null,
    image: primaryImage || fallbackImage,
    images,
    price: effectivePrice,
    effectivePrice,
    originalPrice: regularPrice,
    salePrice,
    rating: { rate: ratingValue, count: ratingCount },
    brand: product.brand ?? '',
    sku: product.sku ?? '',
    stock: toNumber(product.stock ?? 0),
    variants: Array.isArray(product.variants) ? product.variants : [],
    raw: product,
  };
};

export const mapProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(mapProduct).filter(Boolean);
};

export const mapCartItem = (item) => {
  if (!item) return null;

  const product = mapProduct(item.product ?? item);
  if (!product) return null;

  const quantity = toNumber(item.quantity ?? item.qty ?? 1, 1);

  return {
    ...product,
    id: product.id,
    quantity,
    cartItemId: item.id ?? null,
  };
};

export const mapCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(mapCartItem).filter(Boolean);
};

export const mapUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name ?? 'Unknown user',
    email: user.email ?? '',
    role: user.role ?? 'customer',
    phone: user.phone ?? '',
    createdAt: user.created_at ?? user.createdAt ?? null,
    raw: user,
  };
};

export const mapUsers = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map(mapUser).filter(Boolean);
};

export const mapAddress = (address) => {
  if (!address) return null;

  return {
    id: address.id,
    name: address.name ?? '',
    phone: address.phone ?? '',
    province: address.province ?? '',
    district: address.district ?? '',
    ward: address.ward ?? '',
    street: address.street ?? '',
    isDefault: Boolean(address.default ?? address.is_default ?? false),
    raw: address,
  };
};

export const mapAddresses = (addresses) => {
  if (!Array.isArray(addresses)) return [];
  return addresses.map(mapAddress).filter(Boolean);
};

export const mapOrderItem = (item) => {
  if (!item) return null;

  const product = mapProduct(item.product ?? item.product_details ?? item.product_detail ?? {});
  const quantity = toNumber(item.quantity ?? item.qty ?? 1, 1);
  const price = toNumber(item.price ?? product?.price ?? 0);
  const total = toNumber(item.total_price ?? item.total ?? price * quantity, price * quantity);

  return {
    id: item.id ?? product?.id ?? null,
    quantity,
    price,
    total,
    product,
    raw: item,
  };
};

export const mapOrderItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(mapOrderItem).filter(Boolean);
};

export const mapOrder = (order) => {
  if (!order) return null;

  const items = mapOrderItems(order.order_items ?? order.items ?? []);
  const total = toNumber(order.total_price ?? order.total ?? 0);
  const shippingFee = toNumber(order.shipping_fee ?? order.shippingFee ?? 0);

  return {
    id: order.id,
    status: order.status ?? 'pending',
    userId: order.user_id ?? order.user?.id ?? null,
    total,
    shippingFee,
    paymentMethod: order.payment_method ?? order.payment?.method ?? 'cod',
    createdAt: order.created_at ?? order.createdAt ?? null,
    address: order.address ?? null,
    payment: order.payment ?? null,
    items,
    raw: order,
  };
};

export const mapOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map(mapOrder).filter(Boolean);
};

export async function fetchProducts(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.perPage) searchParams.set('per_page', params.perPage);
  if (params.query) searchParams.set('q', params.query);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.categoryId) searchParams.set('category_id', params.categoryId);
  if (params.categorySlug) searchParams.set('category', params.categorySlug);

  const payload = await request('/products', { searchParams });
  return {
    products: mapProducts(payload?.data?.products ?? []),
    meta: payload?.meta ?? null,
  };
}

export async function fetchProduct(productId) {
  if (!productId) throw new Error('Product id is required');
  const payload = await request(`/products/${productId}`);
  return mapProduct(payload?.data);
}

export async function fetchCategories(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.perPage) searchParams.set('per_page', params.perPage);

  const payload = await request('/categories', { searchParams });
  return Array.isArray(payload?.data?.categories) ? payload.data.categories : [];
}

export async function fetchCategoryProducts(categoryId, params = {}) {
  if (!categoryId) throw new Error('Category id is required');
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.perPage) searchParams.set('per_page', params.perPage);
  if (params.sort) searchParams.set('sort', params.sort);

  const payload = await request(`/categories/${categoryId}/products`, { searchParams });
  return {
    products: mapProducts(payload?.data?.products ?? []),
    meta: payload?.meta ?? null,
  };
}

export async function fetchCart() {
  const payload = await request('/cart');
  return mapCartItems(payload?.data?.items ?? payload?.data ?? []);
}

export async function fetchUsers(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.perPage) searchParams.set('per_page', params.perPage);

  const payload = await request('/users', { searchParams });
  return {
    users: mapUsers(payload?.data?.users ?? []),
    meta: payload?.meta ?? null,
  };
}

export async function fetchUser(userId) {
  if (!userId) throw new Error('User id is required');
  const payload = await request(`/users/${userId}`);
  return mapUser(payload?.data);
}

export async function fetchOrders(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.perPage) searchParams.set('per_page', params.perPage);
  if (params.status) searchParams.set('status', params.status);

  const payload = await request('/orders', { searchParams });
  return {
    orders: mapOrders(payload?.data?.orders ?? []),
    meta: payload?.meta ?? null,
  };
}

export async function fetchAddresses() {
  const payload = await request('/addresses');
  return mapAddresses(payload?.data?.addresses ?? payload?.data ?? []);
}

// Authentication APIs
export async function signUp(userData) {
  const payload = await request('/auth/sign_up', {
    method: 'POST',
    body: { user: userData },
  });
  return {
    user: mapUser(payload?.data?.user),
    token: payload?.data?.token,
  };
}

export async function signIn(email, password) {
  const payload = await request('/auth/sign_in', {
    method: 'POST',
    body: { email, password },
  });
  return {
    user: mapUser(payload?.data?.user),
    token: payload?.data?.token,
  };
}

export async function signOut() {
  const payload = await request('/auth/sign_out', {
    method: 'DELETE',
  });
  return payload;
}

export async function refreshToken(refreshToken) {
  const payload = await request('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  });
  return {
    user: mapUser(payload?.data?.user),
    token: payload?.data?.token,
  };
}

// Cart APIs
export async function addToCart(productId, quantity = 1) {
  const payload = await request('/cart', {
    method: 'POST',
    body: {
      cart_item: {
        product_id: productId,
        quantity: quantity,
      },
    },
  });
  return mapCartItem(payload?.data);
}

export async function updateCartItem(cartItemId, quantity) {
  const payload = await request(`/cart/${cartItemId}`, {
    method: 'PUT',
    body: {
      cart_item: {
        quantity: quantity,
      },
    },
  });
  return mapCartItem(payload?.data);
}

export async function removeFromCart(cartItemId) {
  const payload = await request(`/cart/${cartItemId}`, {
    method: 'DELETE',
  });
  return payload;
}

// Order APIs
export async function createOrder(orderData) {
  const payload = await request('/orders', {
    method: 'POST',
    body: { order: orderData },
  });
  return mapOrder(payload?.data);
}

export async function getOrder(orderId) {
  const payload = await request(`/orders/${orderId}`);
  return mapOrder(payload?.data);
}

// Wishlist APIs (assuming they exist, if not we'll use localStorage)
export async function addToWishlist(productId) {
  try {
    const payload = await request('/wishlist', {
      method: 'POST',
      body: { product_id: productId },
    });
    return mapProduct(payload?.data);
  } catch (error) {
    // If wishlist API doesn't exist, we'll handle it in context
    throw error;
  }
}

export async function removeFromWishlist(productId) {
  try {
    const payload = await request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
    return payload;
  } catch (error) {
    // If wishlist API doesn't exist, we'll handle it in context
    throw error;
  }
}

export async function fetchWishlist() {
  try {
    const payload = await request('/wishlist');
    return mapProducts(payload?.data || []);
  } catch (error) {
    // If wishlist API doesn't exist, we'll handle it in context
    throw error;
  }
}
