import axios from 'axios';
import { Order, CreateOrderRequest } from '../types/order';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const response = await api.post<Order>('/orders', order);
    return response.data;
  },
};
