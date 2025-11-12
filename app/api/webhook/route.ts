import { NextRequest, NextResponse } from 'next/server';
import { handleBuySignal, handleSellSignal } from '@/lib/trading';
import { loadConfigServer, getDefaultConfigServer } from '@/lib/config-server';
import { saveNotificationServer } from '@/lib/notifications-server';
import { TradingViewWebhook } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: TradingViewWebhook = await request.json();
    
    // 필수 필드 검증
    if (!body.action || !body.symbol) {
      return NextResponse.json(
        { error: 'action과 symbol은 필수입니다' },
        { status: 400 }
      );
    }

    // 설정 불러오기 (서버 사이드 파일 또는 기본값)
    const savedConfig = loadConfigServer();
    const config = savedConfig || getDefaultConfigServer();
    
    // 요청 본문의 symbol을 사용 (TradingView에서 받은 종목)
    config.symbol = body.symbol;

    let result;

    if (body.action === 'buy') {
      result = await handleBuySignal(body.symbol, config);
    } else if (body.action === 'sell') {
      result = await handleSellSignal(body.symbol);
    } else {
      return NextResponse.json(
        { error: '잘못된 action입니다. buy 또는 sell만 가능합니다' },
        { status: 400 }
      );
    }

    // 알림 저장
    saveNotificationServer(result);

    return NextResponse.json({
      success: true,
      notification: result,
    });
  } catch (error: any) {
    console.error('Webhook 처리 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET 요청으로 상태 확인
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'TradingView Webhook 엔드포인트가 활성화되어 있습니다',
  });
}

