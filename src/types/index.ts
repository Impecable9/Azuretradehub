export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface RFQItem {
  description: string;
  quantity: number;
  unit: string;
  type: "BOM" | "BOS";
}

export interface RFQResponseItem extends RFQItem {
  unitPrice: number;
  leadTimeDays: number;
  notes?: string;
}

export interface QuoteLineInput {
  type: "BOM" | "BOS";
  description: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  notes?: string;
}
