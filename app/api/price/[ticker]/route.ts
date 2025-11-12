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
    
    // 401 에러인 경우 적절한 상태 코드 반환
    const isAuthError = error.message?.includes('401') || 
                       error.message?.includes('인증') ||
                       error.statusCode === 401 ||
                       error.status === 401;
    
    return NextResponse.json(
      { 
        error: error.message || '가격 조회 실패',
        hint: isAuthError ? 'Alpaca API 키를 확인하세요. Vercel 환경 변수에서 ALPACA_API_KEY와 ALPACA_SECRET_KEY를 확인하세요.' : undefined
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

