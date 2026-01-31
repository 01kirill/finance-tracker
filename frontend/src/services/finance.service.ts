import api from './api';
import type { ExpenseStat, Wallet, Transaction, Category, CreateWalletRequest } from '../types/finance';

export const financeService = {
  async getWallets() {
    const response = await api.get<Wallet[]>('/finance/wallets/');
    return response.data;
  },

  async createWallet(data: CreateWalletRequest) {
    const response = await api.post<Wallet>('/finance/wallets/', data);
    return response.data;
  },

  async updateWallet(id: number, name: string) {
    const response = await api.patch<Wallet>(`/finance/wallets/${id}/`, { name });
    return response.data;
  },

  async deleteWallet(id: number) {
    await api.delete(`/finance/wallets/${id}/`);
  },

  async getTransactions() {
    const response = await api.get<Transaction[]>('/finance/transactions/');
    return response.data;
  },

  async createTransaction(data: any) {
    const response = await api.post<Transaction>('/finance/transactions/', data);
    return response.data;
  },

  async deleteTransaction(id: number) {
    await api.delete(`/finance/transactions/${id}/`);
  },

  async getCategories() {
    const response = await api.get<Category[]>('/finance/categories/');
    return response.data;
  },

  async createCategory(data: { title: string; transaction_type: string }) {
    const response = await api.post<Category>('/finance/categories/', data);
    return response.data;
  },

  async updateCategory(id: number, title: string) {
    const response = await api.patch<Category>(`/finance/categories/${id}/`, { title });
    return response.data;
  },

  async deleteCategory(id: number) {
    await api.delete(`/finance/categories/${id}/`);
  },

  async getExpenseStats(startDate: string, endDate: string) {
    const response = await api.get<ExpenseStat[]>('/finance/stats/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

};
