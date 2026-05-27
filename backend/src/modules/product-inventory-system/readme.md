# Product Inventory System Module

## Purpose
Handles all product-related data and inventory management, including stock tracking and product categorization.

---

## Responsibilities
- Product creation and management
- Stock tracking and updates
- Product categorization
- Low-stock monitoring
- Inventory adjustments after sales

## Endpoints

- `GET /api/products` - list products. Query: `page`, `limit`, `search`, `categoryId`.
- `GET /api/products/:id` - get product details.
- `POST /api/products` - create product (AUTH required, STAFF/ADMIN).
- `PUT /api/products/:id` - update product (AUTH required, STAFF/ADMIN).
- `PATCH /api/products/:id/stock` - adjust stock (body: `changeAmount` number, `reason` string) (AUTH required, STAFF/ADMIN).
- `DELETE /api/products/:id` - delete product (AUTH required, STAFF/ADMIN).

## Notes

- All endpoints require a `Bearer` JWT in `Authorization` header.
- Stock adjustments create an `InventoryLog` entry automatically.
- Prices are stored as Decimal strings; pass numeric values in JSON.


