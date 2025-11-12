import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateWebhookUrlSync } from '@/lib/bot-utils';

// 웹훅 테스트 엔드포인트
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> | { botId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const botId = resolvedParams.botId;
    
    const bot = await db.bot.findUnique({
      where: { id: botId },
    });
    
    if (!bot) {
      return NextResponse.json(
        { error: '봇을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 테스트 요청 본문
    const body = await request.json();
    const testAction = body.action || 'buy';
    const testTicker = body.ticker || bot.ticker;
    const testPrice = body.price || 100.0;
    
    // 실제 웹훅 엔드포인트로 리다이렉트 (테스트용)
    const webhookUrl = generateWebhookUrlSync(botId, request);
    
    return NextResponse.json({
      success: true,
      message: '웹훅 테스트 준비 완료',
      webhookUrl,
      testPayload: {
        action: testAction,
        ticker: testTicker,
        price: testPrice,
      },
      instructions: {
        curl: `curl -X POST "${webhookUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"action":"${testAction}","ticker":"${testTicker}","price":${testPrice}}'`,
        tradingview: `{
  "action": "${testAction}",
  "ticker": "{{ticker}}",
  "price": "{{close}}"
}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '테스트 실패' },
      { status: 500 }
    );
  }
}

// GET 요청으로 웹훅 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> | { botId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const botId = resolvedParams.botId;
    
    const bot = await db.bot.findUnique({
      where: { id: botId },
    });
    
    if (!bot) {
      return NextResponse.json(
        { error: '봇을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    const webhookUrl = generateWebhookUrlSync(botId, request);
    
    return NextResponse.json({
      botId: bot.id,
      ticker: bot.ticker,
      webhookUrl,
      currentUrl: bot.webhookUrl,
      needsUpdate: webhookUrl !== bot.webhookUrl,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'auto-detected',
        host: request.headers.get('host'),
        protocol: request.headers.get('x-forwarded-proto') || 'http',
      },
      examplePayload: {
        buy: {
          action: 'buy',
          ticker: bot.ticker,
          price: 100.0,
        },
        sell: {
          action: 'sell',
          ticker: bot.ticker,
          price: 105.0,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '조회 실패' },
      { status: 500 }
    );
  }
}

