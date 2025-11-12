import { NextRequest } from 'next/server';
import { detectNgrokUrl, getAutoDetectedBaseUrl } from './ngrok-detector';

// Base URL 캐시 (1분간 유효)
let cachedBaseUrl: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1분

/**
 * Base URL 자동 감지 (캐시 포함)
 */
async function getBaseUrl(request?: NextRequest): Promise<string> {
  const now = Date.now();
  
  // 캐시가 유효하면 사용
  if (cachedBaseUrl && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedBaseUrl;
  }
  
  // 1. 환경 변수 우선
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    cachedBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    cacheTimestamp = now;
    return cachedBaseUrl;
  }
  
  // 2. 서버 사이드에서 요청이 있으면 Host 헤더 사용
  if (request) {
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host');
    
    // Vercel/프로덕션 환경 감지
    if (forwardedHost || forwardedProto) {
      const finalHost = forwardedHost || host;
      const protocol = forwardedProto || 'https';
      if (finalHost) {
        cachedBaseUrl = `${protocol}://${finalHost}`;
        cacheTimestamp = now;
        return cachedBaseUrl;
      }
    } else if (host) {
      // ngrok 감지 (로컬 개발)
      if (host.includes('ngrok.io') || host.includes('ngrok-free.app')) {
        const protocol = forwardedProto || 'https';
        cachedBaseUrl = `${protocol}://${host}`;
        cacheTimestamp = now;
        return cachedBaseUrl;
      }
      
      // 일반 로컬 개발 환경
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') 
        ? 'http' 
        : 'https';
      cachedBaseUrl = `${protocol}://${host}`;
      cacheTimestamp = now;
      return cachedBaseUrl;
    }
  }
  
  // 3. ngrok 자동 감지 (비동기, 개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    try {
      const ngrokUrl = await detectNgrokUrl();
      if (ngrokUrl) {
        cachedBaseUrl = ngrokUrl;
        cacheTimestamp = now;
        return cachedBaseUrl;
      }
    } catch (error) {
      // ngrok 감지 실패 시 무시
    }
  }
  
  // 4. 기본값
  cachedBaseUrl = 'http://localhost:3000';
  cacheTimestamp = now;
  return cachedBaseUrl;
}

/**
 * 봇 ID로 Webhook URL 생성 (서버 사이드)
 * 로컬/프로덕션 환경 자동 감지 및 ngrok 지원
 */
export async function generateWebhookUrl(botId: string, request?: NextRequest): Promise<string> {
  const baseUrl = await getBaseUrl(request);
  return `${baseUrl}/api/webhook/${botId}`;
}

/**
 * 동기 버전 (캐시 사용)
 */
export function generateWebhookUrlSync(botId: string, request?: NextRequest): string {
  // 캐시가 있으면 사용
  if (cachedBaseUrl) {
    return `${cachedBaseUrl}/api/webhook/${botId}`;
  }
  
  // 캐시가 없으면 동기적으로 감지
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/${botId}`;
  }
  
  if (request) {
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host');
    
    if (forwardedHost || forwardedProto) {
      const finalHost = forwardedHost || host;
      const protocol = forwardedProto || 'https';
      if (finalHost) {
        return `${protocol}://${finalHost}/api/webhook/${botId}`;
      }
    } else if (host) {
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') 
        ? 'http' 
        : 'https';
      return `${protocol}://${host}/api/webhook/${botId}`;
    }
  }
  
  return `http://localhost:3000/api/webhook/${botId}`;
}

/**
 * 클라이언트 사이드에서 Webhook URL 생성
 */
export function generateWebhookUrlClient(botId: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  return `${baseUrl}/api/webhook/${botId}`;
}

