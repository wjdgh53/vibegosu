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
  
  // 2. 프로덕션 환경에서 프로덕션 도메인 우선 사용
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    // Vercel 프로덕션 도메인 추출 (프로젝트 이름 기반)
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl && !vercelUrl.includes('-') && !vercelUrl.includes('--')) {
      // 프로덕션 도메인 형식: vibegosu.vercel.app
      cachedBaseUrl = `https://${vercelUrl}`;
      cacheTimestamp = now;
      return cachedBaseUrl;
    }
    
    // VERCEL_URL이 없으면 프로젝트 이름 기반으로 추정
    // Vercel은 보통 프로젝트 이름을 도메인으로 사용
    const projectName = process.env.VERCEL_PROJECT_NAME || 'vibegosu';
    cachedBaseUrl = `https://${projectName}.vercel.app`;
    cacheTimestamp = now;
    console.log(`✅ 프로덕션 도메인 사용: ${cachedBaseUrl}`);
    return cachedBaseUrl;
  }
  
  // 3. 서버 사이드에서 요청이 있으면 Host 헤더 사용
  if (request) {
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host');
    
    // 프로덕션 도메인 감지 (해시 없는 깔끔한 도메인)
    if (host && !host.includes('-') && !host.includes('--') && host.includes('vercel.app')) {
      const protocol = forwardedProto || 'https';
      cachedBaseUrl = `${protocol}://${host}`;
      cacheTimestamp = now;
      console.log(`✅ 프로덕션 도메인 감지: ${cachedBaseUrl}`);
      return cachedBaseUrl;
    }
    
    // Vercel/프로덕션 환경 감지
    if (forwardedHost || forwardedProto) {
      const finalHost = forwardedHost || host;
      const protocol = forwardedProto || 'https';
      if (finalHost) {
        // 프리뷰 URL이면 프로덕션 도메인으로 변환 시도
        if (finalHost.includes('projects.vercel.app')) {
          const projectName = process.env.VERCEL_PROJECT_NAME || 'vibegosu';
          cachedBaseUrl = `https://${projectName}.vercel.app`;
          cacheTimestamp = now;
          console.log(`✅ 프리뷰 URL 감지, 프로덕션 도메인으로 변환: ${cachedBaseUrl}`);
          return cachedBaseUrl;
        }
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
  
  // 프로덕션 환경에서 프로덕션 도메인 우선 사용
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    const projectName = process.env.VERCEL_PROJECT_NAME || 'vibegosu';
    const baseUrl = `https://${projectName}.vercel.app`;
    console.log(`✅ 프로덕션 도메인 사용 (동기): ${baseUrl}`);
    return `${baseUrl}/api/webhook/${botId}`;
  }
  
  if (request) {
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host');
    
    // 프로덕션 도메인 감지 (해시 없는 깔끔한 도메인)
    if (host && !host.includes('-') && !host.includes('--') && host.includes('vercel.app')) {
      const protocol = forwardedProto || 'https';
      return `${protocol}://${host}/api/webhook/${botId}`;
    }
    
    if (forwardedHost || forwardedProto) {
      const finalHost = forwardedHost || host;
      const protocol = forwardedProto || 'https';
      if (finalHost) {
        // 프리뷰 URL이면 프로덕션 도메인으로 변환
        if (finalHost.includes('projects.vercel.app')) {
          const projectName = process.env.VERCEL_PROJECT_NAME || 'vibegosu';
          return `https://${projectName}.vercel.app/api/webhook/${botId}`;
        }
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

