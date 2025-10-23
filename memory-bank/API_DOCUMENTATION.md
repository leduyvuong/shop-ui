# Shop API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://api.example.com`

## Authentication
API sử dụng JWT Bearer Token. Thêm header sau vào mọi request:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
Tất cả response đều có format chuẩn:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Error Response
```json
{
  "success": false,
  "errors": ["Error message 1", "Error message 2"]
}
```

---

## 🔐 Authentication APIs

### 1. Đăng ký tài khoản
**POST** `/api/v1/auth/sign_up`

**Request Body:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "password_confirmation": "Password123",
    "role": "customer" // optional: customer, staff, admin
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signed up successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 2. Đăng nhập
**POST** `/api/v1/auth/sign_in`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 3. Đăng xuất
**DELETE** `/api/v1/auth/sign_out`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

### 4. Refresh Token
**POST** `/api/v1/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

## 👤 User APIs

### 1. Lấy danh sách users (Admin)
**GET** `/api/v1/users`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `per_page` (optional): Số items mỗi trang (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": "0123456789",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 1,
    "total_count": 1
  }
}
```

### 2. Lấy chi tiết user
**GET** `/api/v1/users/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "0123456789",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Cập nhật user
**PUT** `/api/v1/users/{id}`

**Request Body:**
```json
{
  "user": {
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "0987654321"
  }
}
```

---

## 📍 Address APIs

### 1. Lấy danh sách địa chỉ
**GET** `/api/v1/addresses`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "0123456789",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "street": "123 Nguyễn Huệ",
      "default": true
    }
  ]
}
```

### 2. Tạo địa chỉ mới
**POST** `/api/v1/addresses`

**Request Body:**
```json
{
  "address": {
    "name": "John Doe",
    "phone": "0123456789",
    "province": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "street": "123 Nguyễn Huệ",
    "default": true
  }
}
```

### 3. Đặt địa chỉ mặc định
**PATCH** `/api/v1/addresses/{id}/set_default`

---

## 🏷️ Category APIs

### 1. Lấy danh sách danh mục
**GET** `/api/v1/categories`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "description": "Điện thoại di động",
      "parent_id": null
    }
  ]
}
```

### 2. Lấy sản phẩm theo danh mục
**GET** `/api/v1/categories/{category_id}/products`

---

## 🛍️ Product APIs

### 1. Lấy danh sách sản phẩm
**GET** `/api/v1/products`

**Query Parameters:**
- `page` (optional): Số trang
- `per_page` (optional): Số items mỗi trang
- `q` (optional): Từ khóa tìm kiếm
- `sort` (optional): Sắp xếp (price asc, price desc, newest)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "price": 29990000,
      "sale_price": 27990000,
      "description": "iPhone 15 Pro mới nhất",
      "stock": 50,
      "status": "published",
      "weight": 187,
      "sku": "IP15P-128GB",
      "brand": "Apple",
      "effective_price": 27990000,
      "category": {
        "id": 1,
        "name": "Điện thoại",
        "slug": "dien-thoai"
      },
      "variants": [
        {
          "id": 1,
          "option_name": "Màu sắc",
          "option_value": "Titanium Blue",
          "price": 27990000,
          "stock": 25
        }
      ],
      "product_images": [
        {
          "id": 1,
          "image_url": "https://example.com/image1.jpg"
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 1,
    "total_count": 1
  }
}
```

### 2. Lấy chi tiết sản phẩm
**GET** `/api/v1/products/{id}`

### 3. Tạo sản phẩm (Admin)
**POST** `/api/v1/products`

**Request Body:**
```json
{
  "product": {
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "iPhone 15 Pro mới nhất",
    "price": 29990000,
    "sale_price": 27990000,
    "stock": 50,
    "status": "published",
    "weight": 187,
    "sku": "IP15P-128GB",
    "brand": "Apple",
    "category_id": 1
  }
}
```

---

## 🛒 Cart APIs

### 1. Lấy giỏ hàng
**GET** `/api/v1/cart`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "price": 29990000,
        "sale_price": 27990000,
        "effective_price": 27990000
      }
    }
  ]
}
```

### 2. Thêm sản phẩm vào giỏ
**POST** `/api/v1/cart`

**Request Body:**
```json
{
  "cart_item": {
    "product_id": 1,
    "quantity": 2
  }
}
```

### 3. Cập nhật số lượng
**PUT** `/api/v1/cart/{id}`

**Request Body:**
```json
{
  "cart_item": {
    "quantity": 3
  }
}
```

### 4. Xóa sản phẩm khỏi giỏ
**DELETE** `/api/v1/cart/{id}`

---

## 📦 Order APIs

### 1. Lấy danh sách đơn hàng
**GET** `/api/v1/orders`

**Query Parameters:**
- `page` (optional): Số trang
- `per_page` (optional): Số items mỗi trang

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "status": "pending",
      "total_price": 55980000,
      "payment_method": "cod",
      "shipping_fee": 30000,
      "created_at": "2024-01-01T00:00:00.000Z",
      "address": {
        "id": 1,
        "name": "John Doe",
        "phone": "0123456789",
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Phường Bến Nghé",
        "street": "123 Nguyễn Huệ"
      },
      "order_items": [
        {
          "id": 1,
          "quantity": 2,
          "price": 27990000,
          "product": {
            "id": 1,
            "name": "iPhone 15 Pro",
            "price": 29990000,
            "sale_price": 27990000
          }
        }
      ],
      "payment": {
        "id": 1,
        "method": "cod",
        "status": "pending",
        "amount": 55980000,
        "transaction_id": null
      }
    }
  ]
}
```

### 2. Tạo đơn hàng (Checkout)
**POST** `/api/v1/orders`

**Request Body:**
```json
{
  "order": {
    "address_id": 1,
    "payment_method": "cod",
    "coupon_code": "SAVE10" // optional
  }
}
```

### 3. Hủy đơn hàng
**POST** `/api/v1/orders/{id}/cancel`

### 4. Hoàn tất đơn hàng
**POST** `/api/v1/orders/{id}/complete`

### 5. Cập nhật trạng thái giao hàng
**POST** `/api/v1/orders/{id}/ship`

---

## 💳 Payment APIs

### 1. Lấy danh sách thanh toán
**GET** `/api/v1/payments`

### 2. Tạo thanh toán cho đơn hàng
**POST** `/api/v1/orders/{order_id}/payments`

**Request Body:**
```json
{
  "payment": {
    "amount": 55980000,
    "method": "vnpay", // cod, vnpay, stripe
    "transaction_id": "TXN123456789"
  }
}
```

---

## 🎫 Coupon APIs

### 1. Lấy danh sách mã giảm giá
**GET** `/api/v1/coupons`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SAVE10",
      "discount_type": "percent",
      "discount_value": 10,
      "usage_limit": 100,
      "used_count": 25,
      "expired_at": "2024-12-31T23:59:59.000Z"
    }
  ]
}
```

### 2. Áp dụng mã giảm giá
**POST** `/api/v1/coupons/apply`

**Request Body:**
```json
{
  "coupon": {
    "code": "SAVE10",
    "order_total": 1000000
  }
}
```

---

## ⭐ Review APIs

### 1. Lấy đánh giá theo sản phẩm
**GET** `/api/v1/products/{product_id}/reviews`

### 2. Tạo đánh giá
**POST** `/api/v1/products/{product_id}/reviews`

**Request Body:**
```json
{
  "review": {
    "rating": 5,
    "comment": "Sản phẩm rất tốt!"
  }
}
```

### 3. Cập nhật đánh giá
**PUT** `/api/v1/reviews/{id}`

### 4. Xóa đánh giá
**DELETE** `/api/v1/reviews/{id}`

---

## 📝 Blog APIs

### 1. Lấy danh sách bài viết
**GET** `/api/v1/blog_posts`

### 2. Tạo bài viết (Admin)
**POST** `/api/v1/blog_posts`

**Request Body:**
```json
{
  "blog_post": {
    "title": "Tiêu đề bài viết",
    "slug": "tieu-de-bai-viet",
    "content": "Nội dung bài viết...",
    "published": true
  }
}
```

---

## 🖼️ Banner APIs

### 1. Lấy danh sách banner
**GET** `/api/v1/banners`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Banner chính",
      "image_url": "https://example.com/banner1.jpg",
      "link_url": "https://example.com/promotion",
      "active": true
    }
  ]
}
```

---

## 👨‍💼 Admin APIs

### 1. Dashboard thống kê
**GET** `/api/v1/admin/dashboard`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_revenue": 1000000000,
    "total_orders": 150,
    "total_customers": 75,
    "recent_orders": [...],
    "top_products": [...]
  }
}
```

### 2. Báo cáo doanh thu
**GET** `/api/v1/admin/reports`

**Query Parameters:**
- `from` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `to` (optional): Ngày kết thúc (YYYY-MM-DD)

---

## 📊 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## 🔒 Permissions

- **Customer**: Chỉ có thể xem/sửa dữ liệu của chính mình
- **Staff**: Có thể quản lý sản phẩm, đơn hàng
- **Admin**: Toàn quyền truy cập tất cả APIs

---

## 📝 Notes

1. Tất cả timestamps đều theo format ISO 8601
2. Giá tiền được trả về theo đơn vị VND (không có dấu phẩy)
3. Pagination mặc định: 20 items/trang, tối đa 100 items/trang
4. JWT token có thời hạn, cần refresh khi hết hạn
5. Upload file sử dụng multipart/form-data
6. Tất cả string fields đều có giới hạn độ dài tùy theo validation rules
