import api from './api';
import { InventoryListResponse, StockMovementsResponse } from '../types/product';

export const inventoryService = {
  async getInventory(search: string = '', page: number = 1, limit: number = 10, lowStock: boolean = false): Promise<InventoryListResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (lowStock) params.append('lowStock', 'true');

    const response = await api.get<InventoryListResponse>(`/inventory?${params.toString()}`);
    return response.data;
  },

  async getStockMovements(productId?: string, page: number = 1, limit: number = 10): Promise<StockMovementsResponse> {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<StockMovementsResponse>(`/inventory/movements?${params.toString()}`);
    return response.data;
  },

  async createStockAdjustment(data: { productId: string; movementType: 'IN' | 'OUT'; quantity: number; reason: string }): Promise<any> {
    const response = await api.post('/inventory/adjustments', data);
    return response.data;
  },
};
