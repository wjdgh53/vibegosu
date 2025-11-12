import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 봇 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    await db.bot.delete({
      where: { id: resolvedParams.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('봇 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '봇 삭제 실패' },
      { status: 500 }
    );
  }
}

// 봇 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const bot = await db.bot.findUnique({
      where: { id: resolvedParams.id },
      include: {
        positions: {
          orderBy: { entryTime: 'desc' },
        },
        trades: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });
    
    if (!bot) {
      return NextResponse.json(
        { error: '봇을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bot);
  } catch (error: any) {
    console.error('봇 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '봇 조회 실패' },
      { status: 500 }
    );
  }
}

