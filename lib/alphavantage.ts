import axios from 'axios';
import { NewsSentiment } from '@/types';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export interface NewsSentimentResult {
  score: number;
  relevance: number;
  newsTitles: string[];
}

export class AlphaVantageClient {
  /**
   * 실시간 주가 조회
   * @param symbol 종목 심볼 (예: AAPL)
   * @returns 현재 가격
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: API_KEY,
        },
      });

      if (response.data.Information) {
        throw new Error('API 호출 제한에 도달했습니다');
      }

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error('가격 정보를 찾을 수 없습니다');
      }

      const price = parseFloat(quote['05. price']);
      if (isNaN(price) || price <= 0) {
        throw new Error('유효하지 않은 가격입니다');
      }

      return price;
    } catch (error: any) {
      console.error('Alpha Vantage 가격 조회 오류:', error);
      throw new Error(`가격 조회 실패: ${error.message}`);
    }
  }

  /**
   * 뉴스 센티먼트 조회
   * @param symbol 종목 심볼 (예: AAPL)
   * @param limit 뉴스 개수 제한 (기본값: 20)
   * @returns 센티먼트 점수 및 뉴스 제목 목록
   */
  async getNewsSentiment(symbol: string, limit: number = 20): Promise<NewsSentimentResult> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: symbol,
          apikey: API_KEY,
        },
      });

      if (response.data.Information) {
        throw new Error('API 호출 제한에 도달했습니다');
      }

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      const feed = response.data.feed;
      if (!feed || feed.length === 0) {
        // 뉴스가 없으면 중립 점수 반환
        return { score: 0, relevance: 0, newsTitles: [] };
      }

      // 가장 최근 뉴스들의 센티먼트 점수 평균 계산
      let totalScore = 0;
      let totalRelevance = 0;
      let count = 0;
      const newsTitles: string[] = [];

      // 최근 뉴스 사용
      const recentNews = feed.slice(0, limit);
      
      for (const news of recentNews) {
        const tickerSentiment = news.ticker_sentiment?.find(
          (ts: any) => ts.ticker === symbol
        );
        
        if (tickerSentiment) {
          const relevanceScore = parseFloat(tickerSentiment.relevance_score);
          
          // 관련성 점수가 0.3 이상인 뉴스만 사용 (테슬라와 직접 관련된 뉴스만)
          if (relevanceScore >= 0.3) {
            const score = relevanceScore * 
                         parseFloat(tickerSentiment.ticker_sentiment_score);
            totalScore += score;
            totalRelevance += relevanceScore;
            count++;
            
            // 뉴스 제목 저장 (최대 5개)
            if (newsTitles.length < 5 && news.title) {
              newsTitles.push(news.title);
            }
          }
        }
      }

      if (count === 0) {
        return { score: 0, relevance: 0, newsTitles: [] };
      }

      return {
        score: totalScore / count,
        relevance: totalRelevance / count,
        newsTitles,
      };
    } catch (error: any) {
      console.error('Alpha Vantage API 오류:', error);
      // API 오류 시 중립 점수 반환
      return { score: 0, relevance: 0, newsTitles: [] };
    }
  }
}

export const alphaVantageClient = new AlphaVantageClient();

