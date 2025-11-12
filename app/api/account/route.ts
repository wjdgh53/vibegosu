import { NextResponse } from 'next/server';
import { alpacaClient } from '@/lib/alpaca';

// 계정 정보 조회
export async function GET() {
  try {
    const account = await alpacaClient.getAccount();
    return NextResponse.json(account);
  } catch (error: any) {
    console.error('계정 정보 조회 오류:', error);
    
    // 401 에러인 경우 적절한 상태 코드 반환
    const isAuthError = error.message?.includes('401') || 
                       error.message?.includes('인증') ||
                       error.statusCode === 401 ||
                       error.status === 401;
    
    return NextResponse.json(
      { 
        error: error.message || '계정 정보 조회 실패',
        hint: isAuthError ? 'Alpaca API 키를 확인하세요. Vercel 환경 변수에서 ALPACA_API_KEY와 ALPACA_SECRET_KEY를 확인하세요.' : undefined
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

