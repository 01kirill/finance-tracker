export interface Wallet {
  id: number;
  name: string;
  currency: 'BYN' | 'USD' | 'EUR';
  balance: string;
  created_at: string;
}

export interface Category {
  id: number;
  title: string;
  transaction_type: 'INCOME' | 'EXPENSE';
}

export interface Transaction {
  id: number;
  amount: string;
  date: string;
  description: string;
  wallet: number;
  category: number | null;
  created_at: string;
}

export interface CreateWalletRequest {
  name: string;
  currency: string;
}
