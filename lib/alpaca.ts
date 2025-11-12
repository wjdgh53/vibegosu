import Alpaca from '@alpacahq/alpaca-trade-api';
import { Position } from '@/types';

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY!,
  secretKey: process.env.ALPACA_SECRET_KEY!,
  baseUrl: process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',
  paper: true,
});

export class AlpacaClient {
  /**
   * 주식 매수
   */
  async buyStock(symbol: string, qty: number): Promise<any> {
    try {
      const order = await alpaca.createOrder({
        symbol: symbol,
        qty: qty,
        side: 'buy',
        type: 'market',
        time_in_force: 'day',
      });
      return order;
    } catch (error: any) {
      throw new Error(`매수 실패: ${error.message}`);
    }
  }

  /**
   * 주식 매도 (전량 청산)
   */
  async sellStock(symbol: string, qty: number): Promise<any> {
    try {
      const order = await alpaca.createOrder({
        symbol: symbol,
        qty: qty,
        side: 'sell',
        type: 'market',
        time_in_force: 'day',
      });
      return order;
    } catch (error: any) {
      throw new Error(`매도 실패: ${error.message}`);
    }
  }

  /**
   * 특정 종목의 포지션 조회
   */
  async getPosition(symbol: string): Promise<Position | null> {
    try {
      const positions = await alpaca.getPositions();
      const position = positions.find((p: any) => p.symbol === symbol);
      
      if (!position) return null;

      return {
        symbol: position.symbol,
        qty: parseFloat(position.qty),
        avgEntryPrice: parseFloat(position.avg_entry_price),
        currentPrice: parseFloat(position.current_price),
        marketValue: parseFloat(position.market_value),
        unrealizedPl: parseFloat(position.unrealized_pl),
        unrealizedPlpc: parseFloat(position.unrealized_plpc),
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new Error(`포지션 조회 실패: ${error.message}`);
    }
  }

  /**
   * 모든 포지션 조회
   */
  async getAllPositions(): Promise<Position[]> {
    try {
      const positions = await alpaca.getPositions();
      return positions.map((p: any) => ({
        symbol: p.symbol,
        qty: parseFloat(p.qty),
        avgEntryPrice: parseFloat(p.avg_entry_price),
        currentPrice: parseFloat(p.current_price),
        marketValue: parseFloat(p.market_value),
        unrealizedPl: parseFloat(p.unrealized_pl),
        unrealizedPlpc: parseFloat(p.unrealized_plpc),
      }));
    } catch (error: any) {
      throw new Error(`포지션 조회 실패: ${error.message}`);
    }
  }

  /**
   * 계정 정보 조회
   */
  async getAccount(): Promise<any> {
    try {
      return await alpaca.getAccount();
    } catch (error: any) {
      throw new Error(`계정 정보 조회 실패: ${error.message}`);
    }
  }

  /**
   * 현재 가격 조회
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // 먼저 포지션이 있으면 포지션의 현재 가격 사용 (실패해도 계속 진행)
      try {
        const position = await this.getPosition(symbol);
        if (position) {
          return position.currentPrice;
        }
      } catch (positionError: any) {
        // 포지션 조회 실패 시 무시하고 계속 진행
        console.warn(`포지션 조회 실패 (${symbol}), 다른 방법 시도:`, positionError?.message || positionError);
      }
      
      // 1순위: getLatestBar를 사용한 최신 바 조회 (가장 안정적)
      try {
        const latestBar: any = await alpaca.getLatestBar(symbol);
        if (latestBar) {
          const closePrice = latestBar.ClosePrice || latestBar.close || latestBar.c || 
                           latestBar.Close;
          if (closePrice !== undefined && closePrice !== null) {
            const numPrice = typeof closePrice === 'string' ? parseFloat(closePrice) : closePrice;
            if (!isNaN(numPrice) && numPrice > 0) {
              console.log(`가격 조회 성공 (${symbol}): getLatestBar = ${numPrice}`);
              return numPrice;
            }
          }
        }
      } catch (barError: any) {
        console.warn(`최신 바 조회 실패 (${symbol}):`, barError?.message || barError);
      }
      
      // 2순위: 마지막 거래 가격 조회
      try {
        // getLatestTrade는 객체를 받을 수도 있음
        let lastTrade: any;
        try {
          lastTrade = await alpaca.getLatestTrade(symbol);
        } catch (e1: any) {
          // 객체 형식으로 시도
          try {
            const trades: any = await alpaca.getLatestTrades({ symbols: [symbol] });
            if (trades) {
              // Map 타입일 수도 있고 객체일 수도 있음
              if (trades instanceof Map) {
                lastTrade = trades.get(symbol);
              } else if (trades[symbol]) {
                lastTrade = trades[symbol];
              }
            }
          } catch (e2: any) {
            throw e1; // 원래 에러 사용
          }
        }
        
        if (lastTrade) {
          // 응답 형식 확인: 다양한 필드명 지원
          const price = lastTrade.Price || lastTrade.price || lastTrade.p || 
                       (lastTrade as any).Price || (lastTrade as any).price;
          if (price !== undefined && price !== null) {
            const numPrice = typeof price === 'string' ? parseFloat(price) : price;
            if (!isNaN(numPrice) && numPrice > 0) {
              console.log(`가격 조회 성공 (${symbol}): getLatestTrade = ${numPrice}`);
              return numPrice;
            }
          }
        }
      } catch (tradeError: any) {
        console.warn(`마지막 거래 가격 조회 실패 (${symbol}):`, tradeError?.message || tradeError);
      }
      
      // 3순위: 최신 인용 가격 조회 (bid/ask 중간값)
      try {
        let lastQuote: any;
        try {
          lastQuote = await alpaca.getLatestQuote(symbol);
        } catch (e1: any) {
          // 객체 형식으로 시도
          try {
            const quotes: any = await alpaca.getLatestQuotes({ symbols: [symbol] });
            if (quotes) {
              // Map 타입일 수도 있고 객체일 수도 있음
              if (quotes instanceof Map) {
                lastQuote = quotes.get(symbol);
              } else if (quotes[symbol]) {
                lastQuote = quotes[symbol];
              }
            }
          } catch (e2: any) {
            throw e1; // 원래 에러 사용
          }
        }
        
        if (lastQuote) {
          // bid와 ask의 중간값 사용
          const bid = lastQuote.BidPrice || lastQuote.bidPrice || lastQuote.bid || 
                     lastQuote.b || (lastQuote as any).BidPrice || (lastQuote as any).bidPrice;
          const ask = lastQuote.AskPrice || lastQuote.askPrice || lastQuote.ask || 
                     lastQuote.a || (lastQuote as any).AskPrice || (lastQuote as any).askPrice;
          
          if (bid !== undefined && ask !== undefined && bid !== null && ask !== null) {
            const numBid = typeof bid === 'string' ? parseFloat(bid) : bid;
            const numAsk = typeof ask === 'string' ? parseFloat(ask) : ask;
            if (!isNaN(numBid) && !isNaN(numAsk) && numBid > 0 && numAsk > 0) {
              const midPrice = (numBid + numAsk) / 2;
              console.log(`가격 조회 성공 (${symbol}): getLatestQuote = ${midPrice}`);
              return midPrice;
            }
          }
        }
      } catch (quoteError: any) {
        console.warn(`인용 가격 조회 실패 (${symbol}):`, quoteError?.message || quoteError);
      }
      
      // 4순위: getBarsV2를 사용한 최신 바 조회
      try {
        const barsIterator = alpaca.getBarsV2(symbol, {
          start: new Date(Date.now() - 60000 * 10).toISOString(), // 10분 전부터
          end: new Date().toISOString(),
          timeframe: '1Min',
          limit: 1,
        });
        
        // async generator에서 첫 번째 값 가져오기
        const barsResult = await barsIterator.next();
        if (!barsResult.done && barsResult.value) {
          // 응답 형식: { [symbol]: Bar[] } 또는 Bar[]
          let bars: any[] = [];
          
          if (barsResult.value[symbol]) {
            bars = Array.isArray(barsResult.value[symbol]) 
              ? barsResult.value[symbol] 
              : [barsResult.value[symbol]];
          } else if (Array.isArray(barsResult.value)) {
            bars = barsResult.value;
          } else {
            bars = [barsResult.value];
          }
          
          if (bars.length > 0) {
            const bar: any = bars[bars.length - 1]; // 가장 최근 바
            const closePrice = bar.ClosePrice || bar.close || bar.c || 
                             bar.Close;
            
            if (closePrice !== undefined && closePrice !== null) {
              const numPrice = typeof closePrice === 'string' 
                ? parseFloat(closePrice) 
                : closePrice;
              if (!isNaN(numPrice) && numPrice > 0) {
                console.log(`가격 조회 성공 (${symbol}): getBarsV2 = ${numPrice}`);
                return numPrice;
              }
            }
          }
        }
      } catch (barsError: any) {
        console.warn(`Bars 조회 실패 (${symbol}):`, barsError?.message || barsError);
      }
      
      // 5순위: Alpha Vantage API를 대체 방법으로 사용
      try {
        const { alphaVantageClient } = await import('./alphavantage');
        const price = await alphaVantageClient.getCurrentPrice(symbol);
        console.log(`가격 조회 성공 (${symbol}): Alpha Vantage = ${price}`);
        return price;
      } catch (avError: any) {
        console.warn(`Alpha Vantage 가격 조회 실패 (${symbol}):`, avError?.message || avError);
      }
      
      // 모든 방법 실패
      console.error(`모든 가격 조회 방법 실패 (${symbol})`);
      throw new Error('가격 정보를 가져올 수 없습니다');
    } catch (error: any) {
      // 에러 발생 시 기본값이나 재시도 로직 추가 가능
      throw new Error(`가격 조회 실패: ${error.message}`);
    }
  }
}

export const alpacaClient = new AlpacaClient();

