import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateWebhookUrlSync } from '@/lib/bot-utils';

// 봇 목록 조회
export async function GET(request: NextRequest) {
  try {
    const bots = await db.bot.findMany({
      include: {
        positions: {
          where: { status: 'open' },
          orderBy: { entryTime: 'desc' },
          take: 1,
        },
        trades: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // 웹훅 URL 동적 업데이트 (환경 변경 시 자동 반영)
    // 동기 버전 사용 (비동기는 API 응답 지연)
    const botsWithUpdatedUrls = bots.map((bot: any) => ({
      ...bot,
      webhookUrl: generateWebhookUrlSync(bot.id, request),
    }));
    
    return NextResponse.json(botsWithUpdatedUrls);
  } catch (error: any) {
    console.error('봇 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '봇 조회 실패' },
      { status: 500 }
    );
  }
}

// 봇 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker, amount, stopLoss, takeProfit, sentimentThreshold } = body;
    
    // 유효성 검사
    if (!ticker || !amount || amount <= 0) {
      return NextResponse.json(
        { error: '종목과 투자금은 필수입니다' },
        { status: 400 }
      );
    }
    
    // 봇 생성 (웹훅 URL은 동적으로 생성되므로 임시값 사용)
    const tempBot = await db.bot.create({
      data: {
        ticker: ticker.toUpperCase(),
        amount: parseFloat(amount),
        stopLoss: parseFloat(stopLoss || 0.03),
        takeProfit: parseFloat(takeProfit || 0.07),
        sentimentThreshold: parseFloat(sentimentThreshold || 0.25),
        webhookUrl: `temp-${Date.now()}`, // 임시값, 아래에서 업데이트
      },
    });
    
    // Webhook URL 업데이트 (실제 URL로)
    const actualWebhookUrl = generateWebhookUrlSync(tempBot.id, request);
    const updatedBot = await db.bot.update({
      where: { id: tempBot.id },
      data: {
        webhookUrl: actualWebhookUrl,
      },
    });
    
    return NextResponse.json(updatedBot);
  } catch (error: any) {
    console.error('봇 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '봇 생성 실패' },
      { status: 500 }
    );
  }
}

