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
