'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, FileText, Bell } from 'lucide-react';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFinanzas } from '../features/payments/useFinanzas';
import type { Payment, PendingPayment, PaymentTabType } from '../features/payments/types';

const easeOutLuxury: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Load image as base64 for jsPDF
 */
function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Format payment method with shorter names for compact display
 */
function formatMethodShort(method: Payment['method']): string {
  const methodMap = {
    TRANSFER: 'Transferencia',
    CASH: 'Efectivo',
    DEBIT: 'Débito',
    CREDIT: 'Crédito',
    CHECK: 'Cheque',
    OTHER: 'Otro',
  };
  return methodMap[method] || method;
}

/**
 * Format date as DD/MM/YY for compact receipt display
 */
function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits
  return `${day}/${month}/${year}`;
}

/**
 * Generate professional receipt reference number
 * Format: REF-YYYY-XXXX (e.g., REF-2026-0001)
 */
function formatReceiptID(paymentId: string): string {
  const year = new Date().getFullYear();

  // Extract numeric part from ID or use hash
  const numericPart = paymentId.replace(/\D/g, ''); // Remove non-digits
  const sequence = numericPart.slice(-4).padStart(4, '0'); // Last 4 digits, zero-padded

  return `REF-${year}-${sequence}`;
}

/**
 * Generate luxury receipt PDF (Ticket de Lujo) with ANTON branding
 * Features: 2-column grid, itemized billing, refined typography, professional formatting
 * Note: Uses Helvetica font (jsPDF standard) as approximation of Montserrat Light
 */
async function generateReceiptPDF(payment: Payment, consorcioName: string) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Dark background (app aesthetic)
  pdf.setFillColor(10, 10, 15);
  pdf.rect(0, 0, 210, 297, 'F');

  // Add ANTON logo
  try {
    const logoImg = await loadImage('/logo_Anton_blanco.png');
    pdf.addImage(logoImg, 'PNG', 20, 20, 40, 15);
  } catch (error) {
    console.warn('Logo failed to load, continuing without it');
  }

  // Header (smaller, more refined)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(18); // Reduced from 24pt
  pdf.setTextColor(210, 210, 210);
  pdf.text('COMPROBANTE DE PAGO', 105, 50, { align: 'center' });

  pdf.setFontSize(9); // Reduced from 10pt
  pdf.setTextColor(150, 150, 150);
  pdf.text(consorcioName, 105, 57, { align: 'center' });

  // Separator line
  pdf.setDrawColor(60, 60, 70);
  pdf.setLineWidth(0.5);
  pdf.line(20, 63, 190, 63);

  // 2-Column Grid Layout
  const leftCol = 20;
  const rightCol = 110;
  let yPos = 75;

  // Row 1: EMITIDO A (left) + FECHA (right)
  pdf.setFontSize(6); // Micro labels
  pdf.setTextColor(120, 120, 130);
  pdf.text('EMITIDO A', leftCol, yPos);
  pdf.text('FECHA', rightCol, yPos);

  pdf.setFontSize(10); // Values
  pdf.setTextColor(210, 210, 210);
  pdf.text(payment.payer_user || 'N/A', leftCol, yPos + 5);
  pdf.text(formatDateShort(payment.recorded_at), rightCol, yPos + 5);

  yPos += 12;

  // Row 2: UNIDAD (left) + MÉTODO (right)
  pdf.setFontSize(6);
  pdf.setTextColor(120, 120, 130);
  pdf.text('UNIDAD', leftCol, yPos);
  pdf.text('MÉTODO', rightCol, yPos);

  pdf.setFontSize(10);
  pdf.setTextColor(210, 210, 210);
  pdf.text(payment.unit || 'N/A', leftCol, yPos + 5);
  pdf.text(formatMethodShort(payment.method), rightCol, yPos + 5);

  yPos += 15; // Extra spacing before detail section

  // DETALLE DE COBRO section
  pdf.setFontSize(6);
  pdf.setTextColor(120, 120, 130);
  pdf.text('DETALLE DE COBRO', leftCol, yPos);

  yPos += 6;

  // Calculate 80/20 split
  const totalAmount = parseFloat(payment.amount);
  const expensasOrdinarias = totalAmount * 0.8;
  const fondoReserva = totalAmount * 0.2;

  // Line 1: Expensas Ordinarias
  pdf.setFontSize(9);
  pdf.setTextColor(210, 210, 210);
  pdf.text('Expensas Ordinarias', leftCol, yPos);

  // Dotted line separator
  const dotsStart = leftCol + 55; // Start dots after text
  const dotsEnd = 170; // End before amount
  pdf.setDrawColor(80, 80, 90);
  pdf.line(dotsStart, yPos - 1, dotsEnd, yPos - 1);

  // Right-aligned amount
  pdf.text(
    `$ ${expensasOrdinarias.toLocaleString('es-AR')}`,
    190,
    yPos,
    { align: 'right' }
  );

  yPos += 6;

  // Line 2: Fondo de Reserva
  pdf.text('Fondo de Reserva', leftCol, yPos);

  // Dotted line
  pdf.setDrawColor(80, 80, 90);
  pdf.line(dotsStart, yPos - 1, dotsEnd, yPos - 1);

  pdf.text(
    `$ ${fondoReserva.toLocaleString('es-AR')}`,
    190,
    yPos,
    { align: 'right' }
  );

  yPos += 12;

  // Professional Receipt ID
  pdf.setFontSize(6);
  pdf.setTextColor(120, 120, 130);
  pdf.text('REFERENCIA', leftCol, yPos);

  pdf.setFontSize(10);
  pdf.setTextColor(210, 210, 210);
  pdf.text(formatReceiptID(payment.id), leftCol, yPos + 5);

  yPos += 15;

  // Refined amount box (slim, brand-moss theme)
  const boxY = yPos;
  const boxHeight = 15; // Reduced from 25mm

  // Background: brand-moss/20 approximation RGB(226, 232, 222)
  pdf.setFillColor(226, 232, 222);

  // Border: brand-moss solid RGB(115, 130, 105)
  pdf.setDrawColor(115, 130, 105);
  pdf.setLineWidth(0.3); // Thinner border

  // Rounded rectangle with fill and stroke
  pdf.roundedRect(20, boxY, 170, boxHeight, 2, 2, 'FD');

  // Amount text (centered vertically in box)
  pdf.setFontSize(18); // Reduced from 20pt
  pdf.setTextColor(115, 130, 105); // brand-moss color for amount
  pdf.text(
    `$ ${parseFloat(payment.amount).toLocaleString('es-AR')}`,
    105,
    boxY + 9, // Vertically centered
    { align: 'center' }
  );

  // "MONTO TOTAL" label
  pdf.setFontSize(6); // Micro label
  pdf.setTextColor(100, 100, 110);
  pdf.text('MONTO TOTAL', 105, boxY + 13, { align: 'center' });

  // Official footer with disclaimer
  const footerY = 270;

  pdf.setFontSize(6); // Very small text
  pdf.setTextColor(90, 90, 100);

  const disclaimerLines = [
    'Este documento sirve como comprobante de pago oficial',
    'para consorcios administrados por Anton Arqs.'
  ];

  disclaimerLines.forEach((line, index) => {
    pdf.text(line, 105, footerY + (index * 4), { align: 'center' });
  });

  // Generation date (below disclaimer)
  pdf.setFontSize(6);
  pdf.setTextColor(80, 80, 90);
  pdf.text(
    `Generado el ${new Date().toLocaleDateString('es-AR')}`,
    105,
    footerY + 12,
    { align: 'center' }
  );

  // Download
  pdf.save(`recibo-${payment.id}.pdf`);
}

/**
 * Status badge showing LIVE DATA (with pulsing dot) or DEMO (static)
 */
function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs tracking-widest">
      {isLive ? (
        <>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-green-400"
          >
            ●
          </motion.span>
          <span className="text-green-400">LIVE DATA</span>
        </>
      ) : (
        <>
          <span className="text-brand-beige">●</span>
          <span className="text-brand-beige">DEMO</span>
        </>
      )}
    </div>
  );
}

/**
 * Summary card with large amount display + operative balance
 */
function SummaryCard({
  amount,
  label,
  operativeBalance,
}: {
  amount: number;
  label: string;
  operativeBalance?: number;
}) {
  // Format with dot separator: 1.250.000
  const formatted = amount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const formattedOperative = operativeBalance
    ?.toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutLuxury, delay: 0.1 }}
      className="mt-8 rounded-2xl border border-white/10 bg-brand/5 p-8"
    >
      <div className="space-y-4">
        {/* Primary metric */}
        <div className="space-y-2">
          <div className="text-5xl font-extralight tracking-[0.15em] text-brand-light">
            $ {formatted}
          </div>
          <div className="text-xs tracking-[0.3em] text-muted">{label}</div>
        </div>

        {/* Operative balance */}
        {operativeBalance !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutLuxury, delay: 0.3 }}
            className="pt-4 border-t border-white/5 space-y-1"
          >
            <div className="text-2xl font-extralight tracking-[0.12em] text-brand-beige/80">
              $ {formattedOperative}
            </div>
            <div className="text-[10px] tracking-[0.25em] text-muted/70">
              SALDO OPERATIVO
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Health bar showing collection percentage
 * Animates from 0% to the target percentage on mount
 */
function HealthBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutLuxury, delay: 0.2 }}
      className="mt-8 space-y-3"
    >
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="h-full rounded-full bg-brand"
        />
      </div>
      <div className="text-sm tracking-widest text-muted">
        {percent}% pagado
      </div>
    </motion.div>
  );
}

/**
 * Tab switcher for received vs pending payments
 * Uses layoutId for smooth indicator animation
 */
function TabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: PaymentTabType;
  onTabChange: (tab: PaymentTabType) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutLuxury, delay: 0.25 }}
      className="mt-8 flex gap-1 rounded-xl border border-white/10 bg-white/2.5 p-1"
    >
      {(['RECIBIDOS', 'PENDIENTES'] as PaymentTabType[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className="relative flex-1 rounded-lg px-4 py-2.5 text-xs tracking-[0.25em] transition-colors"
        >
          {/* Active indicator with layoutId magic */}
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg bg-brand/15 border border-brand/30"
              transition={{ duration: 0.35, ease: easeOutLuxury }}
            />
          )}

          {/* Tab label */}
          <span
            className={`relative z-10 ${
              activeTab === tab ? 'text-brand-light' : 'text-muted'
            }`}
          >
            {tab}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

/**
 * Expandable payment row with smooth accordion animation
 * Click to reveal: method, concept, date, receipt button
 */
function PaymentRow({
  payment,
  index,
  consorcioName,
}: {
  payment: Payment;
  index: number;
  consorcioName: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatMethod = (method: Payment['method']) => {
    const methodMap = {
      TRANSFER: 'Transferencia',
      CASH: 'Efectivo',
      DEBIT: 'Débito',
      CREDIT: 'Crédito',
      CHECK: 'Cheque',
      OTHER: 'Otro',
    };
    return methodMap[method] || method;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        ease: easeOutLuxury,
        delay: 0.35 + index * 0.1,
      }}
      className="rounded-lg border border-white/5 bg-white/2.5 overflow-hidden"
    >
      {/* Collapsed view (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm tracking-wide hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-brand">●</span>
          <span className="text-foreground/80">{payment.payer_user}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>•</span>
          <span>{payment.unit || '—'}</span>
          <span>•</span>
          <span className="text-brand-light font-medium">
            ${parseFloat(payment.amount).toLocaleString('es-AR')}
          </span>
        </div>
      </button>

      {/* Expanded details (animated) */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          height: { duration: 0.3, ease: easeOutLuxury },
          opacity: { duration: 0.2, ease: easeOutLuxury },
        }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/5">
          {/* Payment details grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted tracking-wider mb-1">MÉTODO</div>
              <div className="text-foreground/90">{formatMethod(payment.method)}</div>
            </div>
            <div>
              <div className="text-muted tracking-wider mb-1">CONCEPTO</div>
              <div className="text-foreground/90">{payment.concept}</div>
            </div>
          </div>

          <div className="text-xs">
            <div className="text-muted tracking-wider mb-1">FECHA</div>
            <div className="text-foreground/90">{formatDate(payment.recorded_at)}</div>
          </div>

          {/* Receipt button */}
          <button
            onClick={async () => {
              toast.info('Generando Recibo...');
              try {
                await generateReceiptPDF(payment, consorcioName);
                toast.success('Recibo descargado');
              } catch (error) {
                console.error('Error generating PDF:', error);
                toast.error('Error al generar recibo');
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/5 px-4 py-2.5 text-xs tracking-[0.2em] text-brand-light transition-all hover:bg-brand/10"
          >
            <FileText className="h-4 w-4" />
            <span>VER RECIBO</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Utility for combining class names
 */
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get color class based on overdue days (severity indicator)
 */
function getOverdueColor(days: number): string {
  if (days >= 20) return 'text-red-400/70';      // 20+ days: Critical
  if (days >= 10) return 'text-amber-400/70';    // 10-19 days: Warning
  return 'text-muted/60';                        // 0-9 days: Normal
}

/**
 * Format days overdue with Spanish grammar
 */
function formatDaysOverdue(days: number): string {
  const safeDays = Math.max(0, days);  // Ensure non-negative
  return safeDays === 1 ? '1 día' : `${safeDays} días`;
}

type ReminderStatus = 'idle' | 'sending' | 'success';

/**
 * Reminder button with loading → success micro-interaction
 * FULL WIDTH version for expanded accordion section
 */
function ReminderButton({ pending }: { pending: PendingPayment }) {
  const [status, setStatus] = useState<ReminderStatus>('idle');

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    if (status !== 'idle') return;

    setStatus('sending');

    // Simulate API call (1.2s)
    await new Promise(resolve => setTimeout(resolve, 1200));

    setStatus('success');
    toast.success(`Recordatorio enviado a ${pending.debtor_name}`);

    // Reset to idle after 1.5s
    setTimeout(() => setStatus('idle'), 1500);
  };

  // Animation transitions
  const fadeTransition = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.2 }
  };

  const popTransition = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: { duration: 0.2 }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status !== 'idle'}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/5 px-4 py-2.5 text-xs tracking-[0.2em] text-brand-light transition-all hover:bg-brand/10 disabled:opacity-50"
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div key="bell" {...fadeTransition}>
            <Bell className="h-4 w-4" />
          </motion.div>
        )}
        {status === 'sending' && (
          <motion.div key="loading" {...fadeTransition}>
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {status === 'success' && (
          <motion.div key="check" {...popTransition}>
            <Check className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span>
        {status === 'idle' && 'RECORDAR'}
        {status === 'sending' && 'ENVIANDO...'}
        {status === 'success' && 'ENVIADO ✓'}
      </span>
    </button>
  );
}

/**
 * Individual pending payment row with expandable details
 * Matches PaymentRow pattern for visual consistency
 */
function PendingPaymentRow({
  pending,
  index,
}: {
  pending: PendingPayment;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        ease: easeOutLuxury,
        delay: 0.35 + index * 0.1,
      }}
      className="rounded-lg border border-white/5 bg-white/2.5 overflow-hidden"
    >
      {/* Collapsed view (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm tracking-wide hover:bg-white/5 transition-colors text-left"
      >
        {/* Left: Name */}
        <div className="flex items-center gap-3">
          <span className="text-brand">●</span>
          <span className="text-foreground/80">{pending.debtor_name}</span>
        </div>

        {/* Right: Unit + Days */}
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>•</span>
          <span>{pending.unit}</span>
          <span>•</span>
          <span className={cn(
            "font-mono text-[10px] tabular-nums",
            getOverdueColor(pending.days_overdue)
          )}>
            {formatDaysOverdue(pending.days_overdue)}
          </span>
        </div>
      </button>

      {/* Expanded details (animated accordion) */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          height: { duration: 0.3, ease: easeOutLuxury },
          opacity: { duration: 0.2, ease: easeOutLuxury },
        }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/5">
          {/* Amount section */}
          <div className="text-xs">
            <div className="text-muted tracking-wider mb-1">MONTO A DEBER</div>
            <div className="text-brand-light font-medium">
              ${parseFloat(pending.amount).toLocaleString('es-AR')}
            </div>
          </div>

          {/* Reminder button */}
          <ReminderButton pending={pending} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * List of pending payments (defaulters)
 * Now uses expandable PendingPaymentRow components (matches RECIBIDOS pattern)
 */
function PendingPaymentsList({ payments }: { payments: PendingPayment[] }) {
  return (
    <div className="space-y-2">
      {payments.map((pending, index) => (
        <PendingPaymentRow
          key={pending.id}
          pending={pending}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * Activity section with tab switcher
 * Shows received payments OR pending payments based on active tab
 */
function RecentActivity({
  payments,
  pendingPayments = [],
  consorcioName,
}: {
  payments: Payment[];
  pendingPayments?: PendingPayment[];
  consorcioName: string;
}) {
  const [activeTab, setActiveTab] = useState<PaymentTabType>('RECIBIDOS');

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutLuxury, delay: 0.3 }}
        className="text-xs tracking-[0.3em] text-muted"
      >
        ACTIVIDAD RECIENTE
      </motion.div>

      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'RECIBIDOS' ? (
          <motion.div
            key="recibidos"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3, ease: easeOutLuxury }}
            className="space-y-2"
          >
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  index={index}
                  consorcioName={consorcioName}
                />
              ))
            ) : (
              <div className="text-sm text-muted py-4">
                No hay actividad este mes
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pendientes"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3, ease: easeOutLuxury }}
          >
            {pendingPayments.length > 0 ? (
              <PendingPaymentsList payments={pendingPayments} />
            ) : (
              <div className="text-sm text-muted py-4">
                No hay pagos pendientes
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Emit button with loading and success states
 */
function EmitButton({
  status,
  onClick,
}: {
  status: 'idle' | 'loading' | 'success';
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutLuxury, delay: 0.45 }}
      onClick={onClick}
      disabled={status !== 'idle'}
      className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-brand px-6 py-3 text-xs tracking-[0.3em] text-brand transition-all hover:bg-brand/10 disabled:opacity-50 disabled:hover:bg-transparent"
    >
      {status === 'loading' && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {status === 'success' && <Check className="h-4 w-4" />}
      <span>
        {status === 'idle' && 'EMITIR LIQUIDACIÓN'}
        {status === 'loading' && 'PROCESANDO...'}
        {status === 'success' && 'ENVIADA ✓'}
      </span>
    </motion.button>
  );
}

/**
 * Main Finanzas Panel component
 * Displays financial data with real or mock data based on active consorcio
 */
export function FinanzasPanel() {
  const { summary, recentActivity, pendingPayments, isLoading, isSimulated } = useFinanzas();
  const [emitStatus, setEmitStatus] = useState<
    'idle' | 'loading' | 'success'
  >('idle');

  const handleEmit = async () => {
    setEmitStatus('loading');
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEmitStatus('success');
    toast.success('Liquidación enviada a residentes');
    // Reset after 2 seconds
    setTimeout(() => setEmitStatus('idle'), 2000);
  };

  if (isLoading && !isSimulated) {
    // Show skeleton loader for real data while loading
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-6 w-full animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOutLuxury }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs tracking-[0.38em] text-muted">
            FINANZAS — {summary.consorcioName}
          </div>
          <StatusBadge isLive={!isSimulated} />
        </div>
      </motion.div>

      <SummaryCard
        amount={summary.total}
        label="RECAUDACIÓN MES ACTUAL"
        operativeBalance={summary.operativeBalance}
      />

      <HealthBar percent={summary.healthPercent} />

      <RecentActivity
        payments={recentActivity}
        pendingPayments={pendingPayments}
        consorcioName={summary.consorcioName}
      />

      <EmitButton status={emitStatus} onClick={handleEmit} />
    </div>
  );
}
