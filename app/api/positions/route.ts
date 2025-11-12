import { NextResponse } from 'next/server';
import { alpacaClient } from '@/lib/alpaca';

// 포지션 조회
export async function GET() {
  try {
    const positions = await alpacaClient.getAllPositions();
    return NextResponse.json(positions);
  } catch (error: any) {
    console.error('포지션 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '포지션 조회 실패' },
      { status: 500 }
    );
  }
}

