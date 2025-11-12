import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { alpacaClient } from '@/lib/alpaca';
import { alphaVantageClient } from '@/lib/alphavantage';

// CORS 헤더 설정 (TradingView 웹훅 허용)
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function OPTIONS() {
  console.log('🔵 OPTIONS 요청 수신 (CORS preflight)');
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> | { botId: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const botId = resolvedParams.botId;
  
  // 요청 정보 로깅 (프로덕션 디버깅용)
  const requestUrl = request.url;
  const requestHeaders = {
    host: request.headers.get('host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'user-agent': request.headers.get('user-agent'),
  };
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔔 TradingView 웹훅 요청 수신!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Request URL: ${requestUrl}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Headers:`, JSON.stringify(requestHeaders, null, 2));
  console.log(`🤖 Bot ID: ${botId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const body = await request.json();
    const { action, ticker, price } = body;
    
    console.log(`📋 Action: ${action}`);
    console.log(`📈 Ticker: ${ticker || 'N/A'}`);
    console.log(`💰 Price: ${price || 'N/A'}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`📦 Full Body:`, JSON.stringify(body, null, 2));
    
    if (!botId) {
      console.error('❌ Bot ID가 없습니다');
      return NextResponse.json(
        { error: 'botId가 필요합니다' },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // 봇 조회
    console.log(`🔍 봇 조회 시도: ${botId}`);
    const bot = await db.bot.findUnique({
      where: { id: botId },
    });
    
    if (!bot) {
      console.error(`❌ 봇을 찾을 수 없습니다: ${botId}`);
      console.log(`💡 데이터베이스에 존재하는 봇 ID 확인 필요`);
      return NextResponse.json(
        { 
          error: '봇을 찾을 수 없습니다',
          botId: botId,
          hint: '프로덕션 데이터베이스에 봇이 생성되어 있는지 확인하세요'
        },
        { status: 404, headers: getCorsHeaders() }
      );
    }
    
    console.log(`✅ 봇 찾음: ${bot.ticker} (${bot.id})`);
    
    const symbol = (ticker || bot.ticker).toUpperCase();
    
    if (action === 'buy') {
      // 1. 뉴스 센티먼트 조회
      const sentimentResult = await alphaVantageClient.getNewsSentiment(symbol, 20);
      
      // 2. 센티먼트 점수 범위 및 뉴스 개수 체크
      const MIN_SENTIMENT = 0.25;  // 최소 긍정 점수
      const MAX_SENTIMENT = 0.65;  // 과열 방지 상한
      const MIN_NEWS_COUNT = 5;     // 최소 뉴스 개수
      
      let rejectionReason = '';
      
      // 뉴스 개수 체크
      if (sentimentResult.newsTitles.length < MIN_NEWS_COUNT) {
        rejectionReason = `뉴스 개수 부족 (${sentimentResult.newsTitles.length}개 < ${MIN_NEWS_COUNT}개)`;
      }
      // 부정적 뉴스 체크
      else if (sentimentResult.score < -0.15) {
        rejectionReason = `부정적 뉴스 감지 (센티먼트: ${sentimentResult.score.toFixed(2)})`;
      }
      // 최소 긍정 점수 미달
      else if (sentimentResult.score < MIN_SENTIMENT) {
        rejectionReason = `센티먼트 점수 부족 (${sentimentResult.score.toFixed(2)} < ${MIN_SENTIMENT})`;
      }
      // 과열 체크 (0.70 이상은 고점 가능성)
      else if (sentimentResult.score >= 0.70) {
        rejectionReason = `과열 경고 - 매수 금지 (센티먼트: ${sentimentResult.score.toFixed(2)} >= 0.70)`;
      }
      // 사용자 설정 최소값 체크 (하위 호환성)
      else if (sentimentResult.score < bot.sentimentThreshold) {
        rejectionReason = `뉴스 점수 ${sentimentResult.score.toFixed(2)} < 설정값 ${bot.sentimentThreshold}`;
      }
      
      // 거부 조건에 해당하면 거부
      if (rejectionReason) {
        // 거부 - 거래 내역에 저장
        await db.trade.create({
          data: {
            botId: bot.id,
            ticker: symbol,
            entryPrice: parseFloat(price || '0'),
            sentimentScore: sentimentResult.score,
            newsTitles: JSON.stringify(sentimentResult.newsTitles),
            status: 'rejected',
            rejectionReason,
          },
        });
        
        // 알림 저장
        await db.notification.create({
          data: {
            type: 'reject',
            ticker: symbol,
            message: `${symbol} 매수 거부: ${rejectionReason}`,
          },
        });
        
        console.log(`❌ 매수 거부: ${rejectionReason}`);
        console.log(`   센티먼트: ${sentimentResult.score.toFixed(3)}, 뉴스: ${sentimentResult.newsTitles.length}개\n`);
        
        return NextResponse.json({
          status: 'rejected',
          reason: rejectionReason,
          sentimentScore: sentimentResult.score,
          newsCount: sentimentResult.newsTitles.length,
        }, { headers: getCorsHeaders() });
      }
      
      // 3. 센티먼트 강도별 포지션 크기 조절
      let positionMultiplier = 1.0;
      if (sentimentResult.score >= 0.50) {
        // 과열 조짐 - 비중 축소 (80%)
        positionMultiplier = 0.8;
      } else if (sentimentResult.score >= 0.35) {
        // 강한 긍정 - 비중 확대 (120%)
        positionMultiplier = 1.2;
      }
      // 0.25 ~ 0.35: 적정 수준 - 기본 비중 (100%)
      
      // 4. Alpaca API로 매수
      const currentPrice = parseFloat(price) || await alpacaClient.getCurrentPrice(symbol);
      const adjustedAmount = bot.amount * positionMultiplier;
      const qty = Math.floor((adjustedAmount / currentPrice) * 100) / 100;
      
      if (qty <= 0) {
        return NextResponse.json(
          { error: '투자금이 부족합니다' },
          { status: 400 }
        );
      }
      
      const order = await alpacaClient.buyStock(symbol, qty);
      
      console.log(`✅ 매수 성공!`);
      console.log(`   수량: ${qty}주, 가격: $${currentPrice.toFixed(2)}`);
      console.log(`   센티먼트: ${sentimentResult.score.toFixed(3)}, 비중: ${(positionMultiplier * 100).toFixed(0)}%\n`);
      
      // 4. 포지션 저장
      await db.position.create({
        data: {
          botId: bot.id,
          ticker: symbol,
          entryPrice: currentPrice,
          quantity: qty,
        },
      });
      
      // 5. 거래 내역 저장
      await db.trade.create({
        data: {
          botId: bot.id,
          ticker: symbol,
          entryPrice: currentPrice,
          sentimentScore: sentimentResult.score,
          newsTitles: JSON.stringify(sentimentResult.newsTitles),
          status: 'completed',
        },
      });
      
      // 알림 저장
      const positionSizeNote = positionMultiplier !== 1.0 
        ? ` (비중: ${(positionMultiplier * 100).toFixed(0)}%)`
        : '';
      await db.notification.create({
        data: {
          type: 'buy',
          ticker: symbol,
          message: `${symbol} 매수 실행 $${currentPrice.toFixed(2)} (센티먼트: ${sentimentResult.score.toFixed(2)}${positionSizeNote})`,
        },
      });
      
      return NextResponse.json({
        status: 'success',
        order,
        sentimentScore: sentimentResult.score,
      }, { headers: getCorsHeaders() });
    }
    
    if (action === 'sell') {
      // 포지션 찾기
      const position = await db.position.findFirst({
        where: {
          botId: bot.id,
          ticker: symbol,
          status: 'open',
        },
      });
      
      if (!position) {
        return NextResponse.json(
          { error: `${symbol} 포지션이 없습니다` },
          { status: 404 }
        );
      }
      
      // Alpaca API로 매도
      const exitPrice = parseFloat(price) || await alpacaClient.getCurrentPrice(symbol);
      await alpacaClient.sellStock(symbol, position.quantity);
      
      // 수익률 계산
      const profit = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;
      
      console.log(`✅ 매도 성공!`);
      console.log(`   진입가: $${position.entryPrice.toFixed(2)}, 청산가: $${exitPrice.toFixed(2)}`);
      console.log(`   수익률: ${profit >= 0 ? '+' : ''}${profit.toFixed(2)}%\n`);
      
      // 포지션 업데이트
      await db.position.update({
        where: { id: position.id },
        data: {
          status: 'closed',
          exitPrice,
          exitTime: new Date(),
        },
      });
      
      // 거래 내역 업데이트
      const trade = await db.trade.findFirst({
        where: {
          botId: bot.id,
          ticker: symbol,
          status: 'completed',
          exitPrice: null,
        },
        orderBy: { timestamp: 'desc' },
      });
      
      if (trade) {
        await db.trade.update({
          where: { id: trade.id },
          data: {
            exitPrice,
            profit: profit / 100, // 백분율을 소수로 변환
          },
        });
      }
      
      // 알림 저장
      await db.notification.create({
        data: {
          type: 'sell',
          ticker: symbol,
          message: `${symbol} 매도 완료 $${exitPrice.toFixed(2)} (수익: ${profit >= 0 ? '+' : ''}${profit.toFixed(2)}%)`,
        },
      });
      
      return NextResponse.json({
        status: 'success',
        exitPrice,
        profit,
      }, { headers: getCorsHeaders() });
    }
    
    return NextResponse.json(
      { error: '잘못된 action입니다. buy 또는 sell만 가능합니다' },
      { status: 400, headers: getCorsHeaders() }
    );
  } catch (error: any) {
    console.error('Webhook 처리 오류:', error);
    
    // 알림 저장
    try {
      await db.notification.create({
        data: {
          type: 'error',
          ticker: 'UNKNOWN',
          message: `Webhook 처리 오류: ${error.message}`,
        },
      });
    } catch (notifError) {
      console.error('알림 저장 실패:', notifError);
    }
    
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

// GET 요청으로 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> | { botId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const botId = resolvedParams.botId;
    
    if (!botId) {
      return NextResponse.json(
        { error: 'botId가 필요합니다' },
        { status: 400 }
      );
    }
    
    const bot = await db.bot.findUnique({
      where: { id: botId },
    });
    
    if (!bot) {
      return NextResponse.json(
        { error: '봇을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 동적 웹훅 URL 생성
    const { generateWebhookUrlSync } = await import('@/lib/bot-utils');
    const currentWebhookUrl = generateWebhookUrlSync(bot.id, request);
    
    return NextResponse.json({
      status: 'ok',
      botId: bot.id,
      ticker: bot.ticker,
      webhookUrl: currentWebhookUrl,
      storedWebhookUrl: bot.webhookUrl,
      message: 'Webhook 엔드포인트가 활성화되어 있습니다',
      environment: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'auto-detected',
      note: '웹훅 URL은 자동으로 현재 환경에 맞게 생성됩니다.',
    }, { headers: getCorsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}

