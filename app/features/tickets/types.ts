export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  consorcio_id: string;
  created_by: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface CreateTicketPayload {
  consorcio_id: string;
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  assigned_to?: string | null;
}
