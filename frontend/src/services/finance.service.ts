import api from './api';
import type { Wallet, Transaction, Category, CreateWalletRequest } from '../types/finance';

export const financeService = {
  async getWallets() {
    const response = await api.get<Wallet[]>('/finance/wallets/');
    return response.data;
  },

  async createWallet(data: CreateWalletRequest) {
    const response = await api.post<Wallet>('/finance/wallets/', data);
    return response.data;
  },

  async getTransactions() {
    const response = await api.get<Transaction[]>('/finance/transactions/');
    return response.data;
  },

  async getCategories() {
    const response = await api.get<Category[]>('/finance/categories/');
    return response.data;
  }
};
