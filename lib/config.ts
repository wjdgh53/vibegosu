import { TradingConfig } from '@/types';

const CONFIG_STORAGE_KEY = 'trading_config';

/**
 * 설정 저장
 */
export function saveConfig(config: TradingConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

/**
 * 설정 불러오기
 */
export function loadConfig(): TradingConfig | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as TradingConfig;
      } catch (error) {
        console.error('설정 파싱 오류:', error);
        return null;
      }
    }
  }
  return null;
}

/**
 * 기본 설정 반환
 */
export function getDefaultConfig(): TradingConfig {
  return {
    symbol: 'AAPL',
    investmentAmount: 1000,
    stopLoss: 0.05, // 5%
    takeProfit: 0.10, // 10%
  };
}

