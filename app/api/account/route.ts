import { NextResponse } from 'next/server';
import { alpacaClient } from '@/lib/alpaca';

// 계정 정보 조회
export async function GET() {
  try {
    const account = await alpacaClient.getAccount();
    return NextResponse.json(account);
  } catch (error: any) {
    console.error('계정 정보 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '계정 정보 조회 실패' },
      { status: 500 }
    );
  }
}

