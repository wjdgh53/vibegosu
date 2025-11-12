import { NextResponse } from 'next/server';
import Alpaca from '@alpacahq/alpaca-trade-api';

/**
 * Alpaca API 직접 테스트 (디버깅용)
 */
export async function GET() {
  try {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const baseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';

    if (!apiKey || !secretKey) {
      return NextResponse.json({
        status: 'error',
        error: '환경 변수가 설정되지 않았습니다',
      }, { status: 500 });
    }

    // Alpaca 클라이언트 생성
    const alpaca = new Alpaca({
      keyId: apiKey,
      secretKey: secretKey,
      baseUrl: baseUrl,
      paper: true,
    });

    const results: any = {
      config: {
        apiKeyPrefix: apiKey.substring(0, 8),
        apiKeySuffix: apiKey.substring(apiKey.length - 4),
        secretKeyPrefix: secretKey.substring(0, 4),
        secretKeySuffix: secretKey.substring(secretKey.length - 4),
        baseUrl: baseUrl,
        keyLength: apiKey.length,
        secretLength: secretKey.length,
      },
      tests: [],
    };

    // 테스트 1: 계정 정보 조회
    try {
      const account = await alpaca.getAccount();
      results.tests.push({
        name: 'getAccount',
        status: 'success',
        data: {
          account_number: account.account_number,
          status: account.status,
          buying_power: account.buying_power,
          cash: account.cash,
        },
      });
    } catch (error: any) {
      results.tests.push({
        name: 'getAccount',
        status: 'error',
        error: error.message,
        statusCode: error.statusCode || error.status,
        response: error.response?.data || error.response,
      });
    }

    // 테스트 2: 포지션 조회
    try {
      const positions = await alpaca.getPositions();
      results.tests.push({
        name: 'getPositions',
        status: 'success',
        count: positions.length,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'getPositions',
        status: 'error',
        error: error.message,
        statusCode: error.statusCode || error.status,
        response: error.response?.data || error.response,
      });
    }

    // 테스트 3: 최신 바 조회 (TSLA)
    try {
      const latestBar = await alpaca.getLatestBar('TSLA');
      results.tests.push({
        name: 'getLatestBar(TSLA)',
        status: 'success',
        data: latestBar,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'getLatestBar(TSLA)',
        status: 'error',
        error: error.message,
        statusCode: error.statusCode || error.status,
        response: error.response?.data || error.response,
      });
    }

    // 전체 결과 요약
    const successCount = results.tests.filter((t: any) => t.status === 'success').length;
    const errorCount = results.tests.filter((t: any) => t.status === 'error').length;
    const has401Error = results.tests.some((t: any) => t.statusCode === 401 || t.status === 401);

    results.summary = {
      total: results.tests.length,
      success: successCount,
      errors: errorCount,
      has401Error: has401Error,
      overallStatus: has401Error ? 'auth_failed' : (errorCount === 0 ? 'ok' : 'partial_failure'),
    };

    if (has401Error) {
      results.recommendation = {
        issue: 'Alpaca API 인증 실패 (401)',
        possibleCauses: [
          'API 키가 잘못되었거나 만료됨',
          'Paper Trading 계정이 아닌 실전 계정 키 사용',
          'API 키가 비활성화됨',
          'Alpaca Dashboard에서 키 재생성 필요',
        ],
        action: 'Alpaca Dashboard (https://app.alpaca.markets)에서 Paper Trading API 키를 확인하고 재생성하세요',
      };
    }

    return NextResponse.json(results, {
      status: has401Error ? 401 : (errorCount === 0 ? 200 : 500),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

