import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 알림 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const notifications = await db.notification.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('알림 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '알림 조회 실패' },
      { status: 500 }
    );
  }
}

