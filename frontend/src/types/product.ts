export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type MovementType = 'IN' | 'OUT';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  stockStatus?: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data?: {
    products: Product[];
    pagination: ProductPagination;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data?: {
    product: Product;
  };
}

export interface InventoryListResponse {
  success: boolean;
  message: string;
  data?: {
    inventory: Product[];
    pagination: ProductPagination;
  };
}

export interface StockMovementsResponse {
  success: boolean;
  message: string;
  data?: {
    movements: StockMovement[];
    pagination: ProductPagination;
  };
}
