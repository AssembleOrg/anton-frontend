import type { Payment, PendingPayment } from './types';

/**
 * Simple hash function to seed random data generation
 * Ensures same consorcioId always produces same mock data
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator for consistency
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Mock data configurations by consorcio ID
 */
const MOCK_CONFIGS = {
  'temp-anton-2': {
    name: 'ANTON II',
    totalExpenses: 850000,
    fictitiousExpenses: 125000,
    healthPercent: 85,
    payerNames: ['Juan García', 'Ana Rodríguez', 'Carlos López'],
    units: ['2A', '4B', '6C'],
    defaulters: [
      { unit: '4B', debtor_name: 'Roberto Fernández', amount: '87500', days_overdue: 15 },
      { unit: '1A', debtor_name: 'Laura Martínez', amount: '87500', days_overdue: 8 },
      { unit: '2C', debtor_name: 'Diego Torres', amount: '87500', days_overdue: 22 },
    ],
  },
  'temp-anton-3': {
    name: 'ANTON III',
    totalExpenses: 1250000,
    fictitiousExpenses: 180000,
    healthPercent: 92,
    payerNames: ['Juan Pérez', 'María López', 'Carlos Ruiz'],
    units: ['3A', '5B', '7C'],
    defaulters: [
      { unit: '2D', debtor_name: 'Ana Gómez', amount: '125000', days_overdue: 12 },
      { unit: '6A', debtor_name: 'Pedro Silva', amount: '125000', days_overdue: 5 },
      { unit: '8C', debtor_name: 'Carmen Vega', amount: '125000', days_overdue: 18 },
    ],
  },
};

/**
 * Generate mock payments for a consorcio
 * Returns consistent data based on consorcio ID (seeded)
 */
export function generateMockPayments(consorcioId: string): {
  payments: Payment[];
  summary: {
    total: number;
    collected: number;
    pending: number;
    healthPercent: number;
  };
} {
  const config =
    MOCK_CONFIGS[consorcioId as keyof typeof MOCK_CONFIGS] ||
    MOCK_CONFIGS['temp-anton-3'];

  const seed = hashCode(consorcioId);
  const random = new SeededRandom(seed);

  // Calculate collected amount based on health percent
  const collected = Math.round(
    (config.totalExpenses * config.healthPercent) / 100,
  );
  const pending = config.totalExpenses - collected;

  // Generate 3 recent payments (most recent first)
  const now = new Date();
  const payments: Payment[] = config.payerNames.map((name, index) => {
    // Vary amounts slightly based on seeded random
    const baseAmount = Math.floor(
      (collected / config.payerNames.length) * (0.85 + random.next() * 0.3),
    );

    // Create date variations (1-3 days ago)
    const daysAgo = 1 + Math.floor(random.next() * 3);
    const paymentDate = new Date(now);
    paymentDate.setDate(paymentDate.getDate() - daysAgo);

    return {
      id: `mock-${consorcioId}-${index}`,
      consorcio_id: consorcioId,
      payer_user: name,
      amount: baseAmount.toString(),
      currency: 'ARS',
      period: now.toISOString().slice(0, 7), // YYYY-MM
      concept: 'EXPENSAS',
      method: index % 3 === 0 ? 'TRANSFER' : 'DEBIT',
      note: null,
      recorded_by: 'System',
      recorded_at: paymentDate.toISOString(),
      unit: config.units[index],
    };
  });

  // Sort by most recent first, but ensure consistent order
  payments.sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  );

  return {
    payments,
    summary: {
      total: config.totalExpenses,
      collected,
      pending,
      healthPercent: config.healthPercent,
    },
  };
}

/**
 * Get consortium name from mock config
 */
export function getMockConsorcioName(consorcioId: string): string {
  const config =
    MOCK_CONFIGS[consorcioId as keyof typeof MOCK_CONFIGS];
  return config?.name || 'ANTON';
}

/**
 * Get mock defaulters (pending payments) for a consorcio
 */
export function getMockDefaulters(consorcioId: string): PendingPayment[] {
  const config = MOCK_CONFIGS[consorcioId as keyof typeof MOCK_CONFIGS];
  if (!config?.defaulters) return [];

  return config.defaulters.map((d, idx) => ({
    id: `pending-${consorcioId}-${idx}`,
    unit: d.unit,
    debtor_name: d.debtor_name,
    amount: d.amount,
    days_overdue: d.days_overdue,
  }));
}

/**
 * Get fictitious expenses for operative balance calculation
 */
export function getMockFictitiousExpenses(consorcioId: string): number {
  const config = MOCK_CONFIGS[consorcioId as keyof typeof MOCK_CONFIGS];
  return config?.fictitiousExpenses || 0;
}
