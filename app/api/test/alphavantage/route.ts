import { NextResponse } from 'next/server';
import { alphaVantageClient } from '@/lib/alphavantage';

// Alpha Vantage API 연결 테스트
export async function GET() {
  try {
    // 테스트용으로 NVDA 종목의 뉴스 센티먼트 조회
    const result = await alphaVantageClient.getNewsSentiment('NVDA', 5);
    
    return NextResponse.json({
      success: true,
      message: 'Alpha Vantage API 연결 성공',
      testResult: {
        symbol: 'NVDA',
        sentimentScore: result.score,
        relevance: result.relevance,
        newsCount: result.newsTitles.length,
      },
    });
  } catch (error: any) {
    console.error('Alpha Vantage 테스트 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Alpha Vantage API 연결 실패',
      },
      { status: 500 }
    );
  }
}

