import { TradingConfig } from '@/types';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'config.json');

/**
 * 서버 사이드 설정 저장
 */
export function saveConfigServer(config: TradingConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('설정 저장 오류:', error);
  }
}

/**
 * 서버 사이드 설정 불러오기
 */
export function loadConfigServer(): TradingConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      return JSON.parse(content) as TradingConfig;
    }
  } catch (error) {
    console.error('설정 불러오기 오류:', error);
  }
  return null;
}

/**
 * 기본 설정 반환
 */
export function getDefaultConfigServer(): TradingConfig {
  return {
    symbol: process.env.DEFAULT_SYMBOL || 'AAPL',
    investmentAmount: parseFloat(process.env.DEFAULT_INVESTMENT_AMOUNT || '1000'),
    stopLoss: parseFloat(process.env.DEFAULT_STOP_LOSS || '0.05'),
    takeProfit: parseFloat(process.env.DEFAULT_TAKE_PROFIT || '0.10'),
  };
}

