import { NextRequest, NextResponse } from 'next/server';
import { saveConfigServer, loadConfigServer, getDefaultConfigServer } from '@/lib/config-server';
import { TradingConfig } from '@/types';

// 설정 조회
export async function GET() {
  try {
    const config = loadConfigServer() || getDefaultConfigServer();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '설정 조회 실패' },
      { status: 500 }
    );
  }
}

// 설정 저장
export async function POST(request: NextRequest) {
  try {
    const config: TradingConfig = await request.json();
    
    // 유효성 검사
    if (!config.symbol || !config.investmentAmount || config.investmentAmount <= 0) {
      return NextResponse.json(
        { error: '유효하지 않은 설정입니다' },
        { status: 400 }
      );
    }

    saveConfigServer(config);
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '설정 저장 실패' },
      { status: 500 }
    );
  }
}

