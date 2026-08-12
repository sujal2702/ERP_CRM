export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    businessName: string;
    mobile?: string;
    email?: string;
    address?: string;
    gstNumber?: string;
  };
  items?: ChallanItem[];
  totalQuantity: number;
  status: ChallanStatus;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdDate: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface InsufficientStockDetail {
  productId: string;
  product: string;
  sku: string;
  available: number;
  requested: number;
}

export interface ChallanPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChallanListResponse {
  success: boolean;
  message: string;
  data?: {
    challans: Challan[];
    pagination: ChallanPagination;
  };
}

export interface ChallanDetailResponse {
  success: boolean;
  message: string;
  data?: {
    challan: Challan;
  };
  details?: InsufficientStockDetail[];
}
