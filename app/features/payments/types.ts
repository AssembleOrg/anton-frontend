export interface Payment {
  id: string;
  consorcio_id: string;
  payer_user: string | null;
  amount: string;
  currency: 'ARS' | 'USD';
  period: string; // YYYY-MM format
  concept: string;
  method: 'CASH' | 'TRANSFER' | 'DEBIT' | 'CREDIT' | 'CHECK' | 'OTHER';
  note: string | null;
  recorded_by: string;
  recorded_at: string;
  unit?: string; // Unit/apartment number (optional, from mock data)
}

export interface PaymentResponse {
  id: string;
  consorcio_id: string;
  payer_user: string | null;
  amount: string;
  currency: string;
  period: string;
  concept: string;
  method: string;
  note: string | null;
  recorded_by: string;
  recorded_at: string;
  created_at?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PendingPayment {
  id: string;
  unit: string;              // Apartment number (4B, 1A, 2C)
  debtor_name: string;       // Person who owes
  amount: string;            // Amount owed (numeric string)
  days_overdue: number;      // How many days late
}

export type PaymentTabType = 'RECIBIDOS' | 'PENDIENTES';
