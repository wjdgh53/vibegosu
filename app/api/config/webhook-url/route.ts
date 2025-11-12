import { NextRequest, NextResponse } from 'next/server';
import { getAutoDetectedBaseUrl, detectNgrokUrl } from '@/lib/ngrok-detector';
import { generateWebhookUrlSync } from '@/lib/bot-utils';

/**
 * 현재 웹훅 Base URL 조회 및 업데이트
 */
export async function GET(request: NextRequest) {
  try {
    const autoDetected = await getAutoDetectedBaseUrl();
    const ngrokDetected = await detectNgrokUrl();
    
    return NextResponse.json({
      currentBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not-set',
      autoDetected,
      ngrokDetected,
      recommended: autoDetected,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        host: request.headers.get('host'),
        forwardedProto: request.headers.get('x-forwarded-proto'),
        forwardedHost: request.headers.get('x-forwarded-host'),
      },
      message: ngrokDetected 
        ? 'ngrok이 감지되었습니다. 웹훅 URL이 자동으로 업데이트됩니다.'
        : 'ngrok이 감지되지 않았습니다. ngrok을 실행하면 자동으로 감지됩니다.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '조회 실패' },
      { status: 500 }
    );
  }
}

