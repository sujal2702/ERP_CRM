export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: CustomerNote[];
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
  };
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponse {
  success: boolean;
  message: string;
  data?: {
    customers: Customer[];
    pagination: CustomerPagination;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  message: string;
  data?: {
    customer: Customer;
  };
}

export interface CustomerNotesResponse {
  success: boolean;
  message: string;
  data?: {
    notes: CustomerNote[];
  };
}
