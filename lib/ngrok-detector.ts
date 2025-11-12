import axios from 'axios';

/**
 * ngrok URL 자동 감지
 * ngrok이 실행 중이면 자동으로 URL을 가져옵니다
 */
export async function detectNgrokUrl(): Promise<string | null> {
  try {
    // ngrok API 엔드포인트 (로컬 ngrok)
    const response = await axios.get('http://127.0.0.1:4040/api/tunnels', {
      timeout: 1000,
    });
    
    if (response.data && response.data.tunnels && response.data.tunnels.length > 0) {
      // https 터널 찾기
      const httpsTunnel = response.data.tunnels.find(
        (tunnel: any) => tunnel.proto === 'https'
      );
      
      if (httpsTunnel) {
        return httpsTunnel.public_url;
      }
      
      // https가 없으면 http 사용
      const httpTunnel = response.data.tunnels[0];
      if (httpTunnel) {
        return httpTunnel.public_url.replace('http://', 'https://');
      }
    }
    
    return null;
  } catch (error) {
    // ngrok이 실행되지 않았거나 접근 불가
    return null;
  }
}

/**
 * 현재 환경의 Base URL 자동 감지
 */
export async function getAutoDetectedBaseUrl(): Promise<string> {
  // 1. 환경 변수 확인
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // 2. ngrok 자동 감지 (로컬 개발)
  if (process.env.NODE_ENV === 'development') {
    const ngrokUrl = await detectNgrokUrl();
    if (ngrokUrl) {
      return ngrokUrl;
    }
  }
  
  // 3. 기본값
  return 'http://localhost:3000';
}

