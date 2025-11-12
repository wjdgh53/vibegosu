# Vercel 프로덕션 URL 사용 가이드

## 문제: 프리뷰 배포 URL은 인증이 필요합니다

프리뷰 배포 URL (예: `https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app`)은 **Vercel Deployment Protection**이 활성화되어 있어 TradingView 웹훅 요청이 차단됩니다.

## 해결 방법: 프로덕션 URL 사용

### 방법 1: 프로덕션 도메인 사용 (권장)

Vercel Dashboard에서 프로덕션 URL 확인:

1. **Vercel Dashboard** → **Project** → **Settings** → **Domains**
2. 프로덕션 도메인 확인:
   - `https://vibegosu.vercel.app` (기본 프로덕션 도메인)
   - 또는 커스텀 도메인

3. **프로덕션 URL 형식:**
   ```
   https://vibegosu.vercel.app/api/webhook/[botId]
   ```

### 방법 2: Deployment Protection 비활성화 (프리뷰 배포)

프리뷰 배포를 사용해야 하는 경우:

1. **Vercel Dashboard** → **Project** → **Settings** → **Deployment Protection**
2. **Preview Deployments** 섹션에서 **"Disable"** 클릭
3. 또는 **"Allow public access"** 활성화

⚠️ **주의**: 보안상 프로덕션 URL 사용을 권장합니다.

## 프로덕션 URL 확인 방법

### Vercel Dashboard에서 확인

1. **Vercel Dashboard** → **Project** → **Deployments**
2. **Production** 배포 찾기 (프리뷰가 아닌)
3. URL 클릭하여 복사

### 프로덕션 봇 생성 시 자동 감지

프로덕션 대시보드에서 봇을 생성하면:
- 자동으로 프로덕션 URL로 웹훅 URL이 생성됩니다
- 프리뷰 URL이 아닌 프로덕션 URL을 사용합니다

## 체크리스트

- [ ] 프로덕션 URL 확인 (`https://vibegosu.vercel.app`)
- [ ] 프리뷰 URL이 아닌 프로덕션 URL 사용
- [ ] 프로덕션 대시보드에서 봇 생성
- [ ] 생성된 웹훅 URL이 프로덕션 도메인인지 확인
- [ ] TradingView Alert에 프로덕션 URL 사용

## URL 형식 비교

### ❌ 프리뷰 배포 URL (인증 필요)
```
https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app/api/webhook/[botId]
```
- 인증 보호 활성화
- TradingView 웹훅 차단됨

### ✅ 프로덕션 URL (공개 접근 가능)
```
https://vibegosu.vercel.app/api/webhook/[botId]
```
- 공개 접근 가능
- TradingView 웹훅 정상 작동

