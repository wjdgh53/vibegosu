import { NextResponse } from 'next/server';

/**
 * Alpaca API 직접 HTTP 요청 테스트 (SDK 없이)
 * 인증 헤더를 직접 확인하기 위한 테스트
 */
export async function GET() {
  try {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const baseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
    
    // /v2 경로 추가
    const apiBaseUrl = baseUrl.endsWith('/v2') || baseUrl.endsWith('/v2/') 
      ? baseUrl 
      : `${baseUrl}/v2`;

    if (!apiKey || !secretKey) {
      return NextResponse.json({
        status: 'error',
        error: '환경 변수가 설정되지 않았습니다',
      }, { status: 500 });
    }

    const results: any = {
      config: {
        apiKeyPrefix: apiKey.substring(0, 8),
        apiKeySuffix: apiKey.substring(apiKey.length - 4),
        secretKeyPrefix: secretKey.substring(0, 4),
        secretKeySuffix: secretKey.substring(secretKey.length - 4),
        baseUrl: apiBaseUrl,
        keyLength: apiKey.length,
        secretLength: secretKey.length,
      },
      tests: [],
    };

    // 직접 HTTP 요청으로 테스트
    try {
      const response = await fetch(`${apiBaseUrl}/account`, {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      results.tests.push({
        name: 'Direct HTTP GET /account',
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        statusText: response.statusText,
        headers: {
          'content-type': response.headers.get('content-type'),
        },
        response: response.ok ? {
          account_number: responseData.account_number,
          status: responseData.status,
        } : responseData,
        rawResponse: responseText.substring(0, 500), // 처음 500자만
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Direct HTTP GET /account',
        status: 'error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }

    // 요약
    const successCount = results.tests.filter((t: any) => t.status === 'success').length;
    const errorCount = results.tests.filter((t: any) => t.status === 'error').length;
    const has401Error = results.tests.some((t: any) => t.statusCode === 401);

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
          'Secret Key가 잘못되었거나 만료됨',
          'Paper Trading 계정이 아닌 실전 계정 키 사용',
          'API 키가 비활성화됨',
          'Alpaca Dashboard에서 키 재생성 필요',
        ],
        action: 'Alpaca Dashboard (https://app.alpaca.markets)에서 Paper Trading API 키를 확인하고 재생성하세요',
        checkHeaders: {
          expected: 'APCA-API-KEY-ID: [your-api-key]',
          expectedSecret: 'APCA-API-SECRET-KEY: [your-secret-key]',
        },
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

