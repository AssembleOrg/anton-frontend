'use client';

import { useMemo } from 'react';
import { useAppStore } from '../auth/store';
import { usePayments } from './hooks';
import { generateMockPayments, getMockConsorcioName, getMockDefaulters, getMockFictitiousExpenses } from './mockData';
import type { Payment, PendingPayment } from './types';

export interface FinanzasSummary {
  total: number;
  collected: number;
  pending: number;
  healthPercent: number;
  consorcioName: string;
  fictitiousExpenses: number;
  operativeBalance: number;  // collected - fictitiousExpenses
}

export interface FinanzasData {
  summary: FinanzasSummary;
  recentActivity: Payment[];
  pendingPayments?: PendingPayment[];
  isLoading: boolean;
  isSimulated: boolean;
  error?: Error | null;
}

/**
 * Hybrid hook that fetches real or mock financial data
 * - Real data: From backend API (for real consorcios like ANTON I)
 * - Mock data: Seeded deterministic data (for temp consorcios like ANTON II/III)
 */
export function useFinanzas(): FinanzasData {
  const { activeConsorcioId } = useAppStore();
  const isSimulated = activeConsorcioId?.startsWith('temp-') ?? false;

  // Get current month in YYYY-MM format
  const currentPeriod = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Fetch real data from backend (only enabled for real consorcios)
  const realQuery = usePayments(currentPeriod);

  // Generate mock data (only when simulated)
  const mockData = useMemo(() => {
    if (!isSimulated || !activeConsorcioId) return null;
    const generated = generateMockPayments(activeConsorcioId);
    const fictitiousExpenses = getMockFictitiousExpenses(activeConsorcioId);
    const defaulters = getMockDefaulters(activeConsorcioId);
    const consorcioName = getMockConsorcioName(activeConsorcioId);

    return {
      summary: {
        ...generated.summary,
        consorcioName,
        fictitiousExpenses,
        operativeBalance: generated.summary.collected - fictitiousExpenses,
      },
      recentActivity: generated.payments.slice(0, 3),
      pendingPayments: defaulters,
    };
  }, [isSimulated, activeConsorcioId]);

  // For simulated data, return immediately
  if (isSimulated && mockData) {
    return {
      summary: mockData.summary,
      recentActivity: mockData.recentActivity,
      pendingPayments: mockData.pendingPayments,
      isLoading: false,
      isSimulated: true,
      error: null,
    };
  }

  // For real data, transform backend response
  const summary = useMemo((): FinanzasSummary => {
    const results = realQuery.data?.results;

    if (!Array.isArray(results) || results.length === 0) {
      return {
        total: 0,
        collected: 0,
        pending: 0,
        healthPercent: 0,
        consorcioName: activeConsorcioId || 'ANTON',
        fictitiousExpenses: 0,
        operativeBalance: 0,
      };
    }

    const payments = results;
    const collected = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );

    // Calculate total from first payment's concept or use collected as approximation
    // In a real scenario, you might fetch a budget endpoint
    const total = collected * 1.15; // Assume ~87% collection rate
    const pending = total - collected;
    const healthPercent = Math.round((collected / total) * 100);

    return {
      total: Math.round(total),
      collected: Math.round(collected),
      pending: Math.round(pending),
      healthPercent: Math.max(0, Math.min(100, healthPercent)),
      consorcioName: activeConsorcioId || 'ANTON',
      fictitiousExpenses: 0,
      operativeBalance: Math.round(collected),
    };
  }, [realQuery.data, activeConsorcioId]);

  const recentActivity = useMemo(() => {
    const results = realQuery.data?.results;
    return Array.isArray(results) ? results.slice(0, 3) : [];
  }, [realQuery.data]);

  return {
    summary,
    recentActivity,
    isLoading: realQuery.isLoading,
    isSimulated: false,
    error: realQuery.error,
  };
}
