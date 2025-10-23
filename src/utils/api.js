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
    products: mapProducts(payload?.data ?? []),
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
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function fetchCategoryProducts(categoryId, params = {}) {
  if (!categoryId) throw new Error('Category id is required');
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.perPage) searchParams.set('per_page', params.perPage);
  if (params.sort) searchParams.set('sort', params.sort);

  const payload = await request(`/categories/${categoryId}/products`, { searchParams });
  return {
    products: mapProducts(payload?.data ?? []),
    meta: payload?.meta ?? null,
  };
}
