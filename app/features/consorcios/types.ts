export interface Consorcio {
  id: string;
  name: string;
  default_conversation_id: string | null;
  created_at: string;
}

export interface ConsorcioMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  created_at: string;
}

export interface MyConsorciosResponse {
  results: Consorcio[];
  count: number;
}
