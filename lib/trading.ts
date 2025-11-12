import { alpacaClient } from './alpaca';
import { alphaVantageClient } from './alphavantage';
import { TradingConfig, Notification } from '@/types';

/**
 * 매수 신호 처리
 */
export async function handleBuySignal(
  symbol: string,
  config: TradingConfig
): Promise<Notification> {
  try {
    // 1. 뉴스 센티먼트 조회
    const sentiment = await alphaVantageClient.getNewsSentiment(symbol);
    
    // 2. 센티먼트 점수 확인
    if (sentiment.score < -0.3) {
      // 부정 뉴스: 매수 거부
      return {
        id: Date.now().toString(),
        type: 'reject',
        symbol,
        message: `매수 거부: 부정 뉴스 감지 (센티먼트: ${sentiment.score.toFixed(2)})`,
        timestamp: new Date(),
        sentimentScore: sentiment.score,
      };
    }

    if (sentiment.score < 0.7) {
      // 중립: 매수 거부
      return {
        id: Date.now().toString(),
        type: 'reject',
        symbol,
        message: `매수 거부: 센티먼트 점수 부족 (${sentiment.score.toFixed(2)} < 0.7)`,
        timestamp: new Date(),
        sentimentScore: sentiment.score,
      };
    }

    // 3. 현재 가격 조회
    const currentPrice = await alpacaClient.getCurrentPrice(symbol);
    
    // 4. 매수 수량 계산
    const qty = Math.floor((config.investmentAmount / currentPrice) * 100) / 100;
    
    if (qty <= 0) {
      return {
        id: Date.now().toString(),
        type: 'error',
        symbol,
        message: `매수 실패: 투자금이 부족합니다 (현재 가격: $${currentPrice})`,
        timestamp: new Date(),
        sentimentScore: sentiment.score,
      };
    }

    // 5. 매수 실행
    const order = await alpacaClient.buyStock(symbol, qty);
    
    return {
      id: Date.now().toString(),
      type: 'buy',
      symbol,
      message: `매수 완료: ${qty}주 @ $${currentPrice.toFixed(2)} (센티먼트: ${sentiment.score.toFixed(2)})`,
      timestamp: new Date(),
      sentimentScore: sentiment.score,
    };
  } catch (error: any) {
    return {
      id: Date.now().toString(),
      type: 'error',
      symbol,
      message: `매수 처리 오류: ${error.message}`,
      timestamp: new Date(),
    };
  }
}

/**
 * 매도 신호 처리
 */
export async function handleSellSignal(symbol: string): Promise<Notification> {
  try {
    // 1. 포지션 확인
    const position = await alpacaClient.getPosition(symbol);
    
    if (!position || position.qty === 0) {
      return {
        id: Date.now().toString(),
        type: 'error',
        symbol,
        message: `매도 실패: ${symbol} 포지션이 없습니다`,
        timestamp: new Date(),
      };
    }

    // 2. 전량 매도
    const order = await alpacaClient.sellStock(symbol, position.qty);
    
    const profit = position.unrealizedPl;
    const profitPercent = (position.unrealizedPlpc * 100).toFixed(2);
    
    return {
      id: Date.now().toString(),
      type: 'sell',
      symbol,
      message: `매도 완료: ${position.qty}주 청산 (손익: $${profit.toFixed(2)}, ${profitPercent}%)`,
      timestamp: new Date(),
    };
  } catch (error: any) {
    return {
      id: Date.now().toString(),
      type: 'error',
      symbol,
      message: `매도 처리 오류: ${error.message}`,
      timestamp: new Date(),
    };
  }
}

