import { NextRequest, NextResponse } from 'next/server';
import { alpacaClient } from '@/lib/alpaca';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> | { ticker: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const ticker = resolvedParams.ticker.toUpperCase();
    
    const price = await alpacaClient.getCurrentPrice(ticker);
    
    return NextResponse.json({
      ticker,
      price,
    });
  } catch (error: any) {
    console.error('가격 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '가격 조회 실패' },
      { status: 500 }
    );
  }
}

