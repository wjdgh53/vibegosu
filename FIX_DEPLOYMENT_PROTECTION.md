# Vercel Deployment Protection 해제 가이드

## 문제: 인증 페이지가 나타남

프로덕션 배포인데도 "Authentication Required" 페이지가 나타나는 경우, Vercel의 **Deployment Protection**이 활성화되어 있을 수 있습니다.

## 해결 방법

### 방법 1: Deployment Protection 비활성화 (권장)

1. **Vercel Dashboard** 접속
2. **Project** 선택
3. **Settings** → **Deployment Protection** 클릭
4. **Production Deployments** 섹션 확인
5. **"Disable"** 또는 **"Allow public access"** 활성화

### 방법 2: 프로덕션 도메인 확인

프로덕션 배포의 실제 URL 확인:

1. **Vercel Dashboard** → **Project** → **Deployments**
2. **Production** 태그가 있는 배포 찾기
3. 해당 배포의 URL 확인

**프로덕션 URL 형식:**
- `https://vibegosu.vercel.app` (기본 프로덕션 도메인)
- 또는 커스텀 도메인

**프리뷰 URL 형식:**
- `https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app` (해시 포함)

### 방법 3: 프로덕션 배포 확인

현재 배포가 프로덕션인지 확인:

1. **Vercel Dashboard** → **Deployments**
2. 최신 배포 확인
3. **"Production"** 태그가 있는지 확인
4. 없으면 **"Promote to Production"** 클릭

## 웹훅 URL 확인

프로덕션 대시보드에서 봇을 생성하면 자동으로 올바른 URL이 생성됩니다:

1. `https://vibegosu.vercel.app/dashboard` 접속
2. 봇 생성
3. 생성된 웹훅 URL 확인
4. URL이 프로덕션 도메인인지 확인

## 테스트

프로덕션 URL로 직접 테스트:

```bash
# 프로덕션 URL 사용 (해시 없는 도메인)
curl -X POST "https://vibegosu.vercel.app/api/webhook/cmhwfe4m10000la04i7hjkqqz" \
  -H "Content-Type: application/json" \
  -d '{"action":"buy","ticker":"NVDA","price":145.20}'
```

성공하면:
- JSON 응답 반환
- Vercel 로그에 요청 기록

실패하면:
- 인증 페이지: Deployment Protection 활성화됨
- 404: 봇 ID가 잘못됨
- 500: 서버 에러

