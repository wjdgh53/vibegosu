import { NextRequest, NextResponse } from 'next/server';
import { alphaVantageClient } from '@/lib/alphavantage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> | { ticker: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const result = await alphaVantageClient.getNewsSentiment(resolvedParams.ticker, 20);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('센티먼트 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '센티먼트 조회 실패' },
      { status: 500 }
    );
  }
}

