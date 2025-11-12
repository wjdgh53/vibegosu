// TradingView Webhook 타입
export interface TradingViewWebhook {
  action: 'buy' | 'sell';
  symbol: string;
  price?: number;
  time?: string;
}

// 설정 타입
export interface TradingConfig {
  symbol: string;
  investmentAmount: number; // 투자금 (USD)
  stopLoss: number; // 손절 비율 (예: 0.05 = 5%)
  takeProfit: number; // 익절 비율 (예: 0.10 = 10%)
}

// 뉴스 센티먼트 타입
export interface NewsSentiment {
  score: number; // -1 ~ 1 사이의 점수
  relevance: number; // 0 ~ 1 사이의 관련도
}

// 포지션 타입
export interface Position {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlpc: number;
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'buy' | 'sell' | 'reject' | 'error';
  symbol: string;
  message: string;
  timestamp: Date;
  sentimentScore?: number;
}

