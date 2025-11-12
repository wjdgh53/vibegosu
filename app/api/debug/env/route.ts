import { NextResponse } from 'next/server';

/**
 * 환경 변수 상태 확인 (디버깅용)
 * API 키는 마스킹 처리하여 반환
 */
export async function GET() {
  try {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const baseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    // 마스킹 함수
    const maskKey = (key: string | undefined, showLength: number = 4) => {
      if (!key) return 'NOT_SET';
      if (key.length <= showLength * 2) return '***';
      return `${key.substring(0, showLength)}...${key.substring(key.length - showLength)}`;
    };

    const maskUrl = (url: string | undefined) => {
      if (!url) return 'NOT_SET';
      // URL에서 비밀번호 부분만 마스킹
      try {
        const urlObj = new URL(url);
        if (urlObj.password) {
          urlObj.password = '***';
        }
        return urlObj.toString();
      } catch {
        return 'INVALID_URL';
      }
    };

    const status = {
      alpaca: {
        apiKey: {
          exists: !!apiKey,
          masked: maskKey(apiKey),
          length: apiKey?.length || 0,
          isValid: apiKey ? apiKey.length >= 10 : false,
        },
        secretKey: {
          exists: !!secretKey,
          masked: maskKey(secretKey),
          length: secretKey?.length || 0,
          isValid: secretKey ? secretKey.length >= 10 : false,
        },
        baseUrl: {
          value: baseUrl,
          isPaper: baseUrl.includes('paper-api'),
        },
        allSet: !!(apiKey && secretKey),
      },
      alphaVantage: {
        apiKey: {
          exists: !!alphaVantageKey,
          masked: maskKey(alphaVantageKey),
          length: alphaVantageKey?.length || 0,
        },
      },
      database: {
        url: {
          exists: !!databaseUrl,
          masked: maskUrl(databaseUrl),
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
      },
      issues: [] as string[],
    };

    // 문제점 체크
    if (!apiKey) {
      status.issues.push('ALPACA_API_KEY가 설정되지 않았습니다');
    } else if (apiKey.length < 10) {
      status.issues.push('ALPACA_API_KEY가 너무 짧습니다 (잘못된 형식일 수 있음)');
    }

    if (!secretKey) {
      status.issues.push('ALPACA_SECRET_KEY가 설정되지 않았습니다');
    } else if (secretKey.length < 10) {
      status.issues.push('ALPACA_SECRET_KEY가 너무 짧습니다 (잘못된 형식일 수 있음)');
    }

    if (!baseUrl.includes('paper-api')) {
      status.issues.push('ALPACA_BASE_URL이 Paper Trading URL이 아닙니다');
    }

    if (!alphaVantageKey) {
      status.issues.push('ALPHA_VANTAGE_API_KEY가 설정되지 않았습니다');
    }

    if (!databaseUrl) {
      status.issues.push('DATABASE_URL이 설정되지 않았습니다');
    }

    return NextResponse.json({
      status: status.issues.length === 0 ? 'ok' : 'error',
      ...status,
      message: status.issues.length === 0 
        ? '모든 환경 변수가 정상적으로 설정되어 있습니다'
        : `${status.issues.length}개의 문제가 발견되었습니다`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message || '환경 변수 확인 실패',
      },
      { status: 500 }
    );
  }
}

