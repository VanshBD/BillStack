# Product Management APIs

This document contains all Product Management API endpoints for the ERP System.

## Base URL
```
http://localhost:8888/api/product
```

## Authentication
All Product APIs require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Product Model Structure

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Laptop Pro 15",
  "sku": "LAPTOP-1234",  // Auto-generated from product name, cannot be modified
  "description": "High-performance laptop for professionals",
  "category": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Electronics"
  },
  "price": 1299.99,
  "cost": 999.99,
  "currency": "USD",
  "hsnCode": "8471",
  "quantity": 50,
  "reorderLevel": 10,
  "trackInventory": true,
  "enabled": true,
  "removed": false,
  "files": [
    {
      "id": "file_123",
      "name": "product-image.jpg",
      "path": "/uploads/products/product-image.jpg",
      "description": "Main product image",
      "isPublic": true
    }
  ],
  "createdBy": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Admin User"
  },
  "created": "2024-01-15T10:30:00.000Z",
  "updated": "2024-01-15T10:30:00.000Z"
}
```

## API Endpoints

### 1. Create Product
**POST** `/api/product/create`

Create a new product in the system.

**Request Body:**
```json
{
  "name": "Laptop Pro 15",
  "description": "High-performance laptop for professionals",
  "category": "507f1f77bcf86cd799439012",
  "price": 1299.99,
  "cost": 999.99,
  "currency": "USD",
  "hsnCode": "8471",
  "quantity": 50,
  "reorderLevel": 10,
  "trackInventory": true,
  "enabled": true
}
```

**Note:** SKU is automatically generated from product name and should not be included in the request. Example: "LAPTOP-1234"

**Response:**
```json
{
  "success": true,
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Pro 15",
    "sku": "LAPTOP-1234",  // Auto-generated from name
    // ... full product object
  },
  "message": "Product created successfully"
}
```

**Dummy URL:** `POST http://localhost:8888/api/product/create`

---

### 2. Get Product by ID
**GET** `/api/product/read/:id`

Retrieve a specific product by its ID.

**URL Parameters:**
- `id` (string): Product ID

**Response:**
```json
{
  "success": true,
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Pro 15",
    // ... full product object with populated category
  },
  "message": "Product retrieved successfully"
}
```

**Dummy URL:** `GET http://localhost:8888/api/product/read/507f1f77bcf86cd799439011`

---

### 3. Update Product
**PUT** `/api/product/update/:id`

Update an existing product.

**URL Parameters:**
- `id` (string): Product ID

**Request Body:**
```json
{
  "name": "Laptop Pro 15 Updated",
  "price": 1199.99,
  "quantity": 45,
  "reorderLevel": 15
}
```

**Note:** SKU field cannot be modified after creation. It's auto-generated from the product name and is protected from updates.

**Response:**
```json
{
  "success": true,
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Pro 15 Updated",
    "price": 1199.99,
    // ... updated product object
  },
  "message": "Product updated successfully"
}
```

**Dummy URL:** `PUT http://localhost:8888/api/product/update/507f1f77bcf86cd799439011`

---

### 4. Delete Product
**DELETE** `/api/product/delete/:id`

Soft delete a product (sets removed: true).

**URL Parameters:**
- `id` (string): Product ID

**Response:**
```json
{
  "success": true,
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "removed": true
  },
  "message": "Product deleted successfully"
}
```

**Dummy URL:** `DELETE http://localhost:8888/api/product/delete/507f1f77bcf86cd799439011`

---

### 5. List Products (Paginated)
**GET** `/api/product/list`

Get paginated list of products with filtering options.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search in name, description, SKU
- `category` (string, optional): Filter by category ID
- `enabled` (boolean, optional): Filter by enabled status
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter

**Response:**
```json
{
  "success": true,
  "result": {
    "docs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Laptop Pro 15",
        "price": 1299.99,
        // ... product object
      }
    ],
    "totalDocs": 150,
    "limit": 10,
    "page": 1,
    "totalPages": 15,
    "pagingCounter": 1,
    "hasPrev": false,
    "hasNext": true,
    "prevPage": null,
    "nextPage": 2
  },
  "message": "Products retrieved successfully"
}
```

**Dummy URL:** `GET http://localhost:8888/api/product/list?page=1&limit=10&search=laptop`

---

### 6. List All Products
**GET** `/api/product/listAll`

Get all products without pagination (use with caution for large datasets).

**Response:**
```json
{
  "success": true,
  "result": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop Pro 15",
      // ... product object
    }
  ],
  "message": "All products retrieved successfully"
}
```

**Dummy URL:** `GET http://localhost:8888/api/product/listAll`

---

### 7. Search Products
**POST** `/api/product/search`

Advanced search with multiple criteria.

**Request Body:**
```json
{
  "search": "laptop",
  "fields": ["name", "description", "sku"],
  "category": "507f1f77bcf86cd799439012",
  "minPrice": 500,
  "maxPrice": 2000,
  "enabled": true,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "result": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop Pro 15",
      "price": 1299.99,
      // ... product object
    }
  ],
  "message": "Products found successfully"
}
```

**Dummy URL:** `POST http://localhost:8888/api/product/search`

---

### 8. Filter Products
**POST** `/api/product/filter`

Filter products with complex criteria.

**Request Body:**
```json
{
  "filters": {
    "category": "507f1f77bcf86cd799439012",
    "price": { "$gte": 1000, "$lte": 2000 },
    "quantity": { "$gt": 0 },
    "enabled": true
  },
  "sort": { "name": 1, "price": -1 },
  "limit": 10,
  "skip": 0
}
```

**Response:**
```json
{
  "success": true,
  "result": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop Pro 15",
      "price": 1299.99,
      // ... product object
    }
  ],
  "message": "Products filtered successfully"
}
```

**Dummy URL:** `POST http://localhost:8888/api/product/filter`

---

### 9. Product Summary
**POST** `/api/product/summary`

Get summary statistics for products.

**Request Body:**
```json
{
  "group": "category",
  "match": { "enabled": true },
  "aggregate": {
    "totalProducts": { "$sum": 1 },
    "totalValue": { "$sum": "$price" },
    "averagePrice": { "$avg": "$price" },
    "totalStock": { "$sum": "$quantity" }
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": [
    {
      "_id": {
        "category": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Electronics"
        }
      },
      "totalProducts": 25,
      "totalValue": 32499.75,
      "averagePrice": 1299.99,
      "totalStock": 1250
    }
  ],
  "message": "Product summary retrieved successfully"
}
```

**Dummy URL:** `POST http://localhost:8888/api/product/summary`

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "result": null,
  "message": "Error description"
}
```

### Common Error Codes:
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `500` - Internal Server Error

## Field Validation Rules

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| `name` | ✅ Yes | String | Minimum 1 character |
| `sku` | ❌ No | String | **Auto-generated from name, non-editable** |
| `description` | ❌ No | String | Optional |
| `category` | ❌ No | ObjectId | References Category model |
| `price` | ✅ Yes | Number | Default: 0 |
| `cost` | ❌ No | Number | Default: 0 |
| `currency` | ❌ No | String | Default: "NA", Uppercase |
| `hsnCode` | ❌ No | String | Default: "" (for tax purposes) |
| `quantity` | ❌ No | Number | Default: 0 |
| `reorderLevel` | ❌ No | Number | Default: 0 |
| `trackInventory` | ❌ No | Boolean | Default: true |
| `enabled` | ❌ No | Boolean | Default: true |

## Usage Examples

### Create a new product:
```bash
curl -X POST http://localhost:8888/api/product/create \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "price": 29.99,
    "category": "507f1f77bcf86cd799439012",
    "hsnCode": "8471",
    "quantity": 100
  }'

# Note: SKU will be auto-generated as "WIRELE-5678"
```

### Search products:
```bash
curl -X POST http://localhost:8888/api/product/search \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "mouse",
    "limit": 10
  }'
```

### Get product by ID:
```bash
curl -X GET http://localhost:8888/api/product/read/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer your-jwt-token"
```
