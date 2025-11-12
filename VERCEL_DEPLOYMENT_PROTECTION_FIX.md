# Vercel Deployment Protection 해결 방법

## 문제
Vercel Deployment Protection이 활성화되어 있어 TradingView 웹훅 요청이 차단됩니다.

## 해결 방법 (3가지 옵션)

### 방법 1: OPTIONS Allowlist 설정 (권장) ⭐

**가장 간단하고 안전한 방법**

1. **OPTIONS Allowlist** 섹션 찾기
2. **"Add path"** 클릭
3. 다음 경로 추가:
   ```
   /api/webhook
   ```
4. **Save** 클릭

**효과:**
- CORS preflight 요청 (OPTIONS)이 통과됩니다
- TradingView 웹훅이 정상 작동합니다
- 다른 경로는 여전히 보호됩니다

### 방법 2: Protection Bypass for Automation 설정

**자동화 서비스용 시크릿 생성**

1. **Protection Bypass for Automation** 섹션 찾기
2. **"Add a secret"** 클릭
3. 시크릿 이름 입력 (예: `webhook-bypass`)
4. 시크릿 값 생성 (랜덤 문자열)
5. **Save** 클릭

**사용 방법:**
TradingView Alert의 Webhook URL에 쿼리 파라미터 추가:
```
https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app/api/webhook/[botId]?x-vercel-protection-bypass=생성한_시크릿_값
```

⚠️ **주의**: 시크릿이 URL에 노출되므로 보안상 권장하지 않습니다.

### 방법 3: Deployment Protection 비활성화

**가장 간단하지만 보안 위험**

1. **Vercel Authentication** 비활성화
2. 또는 **Production Deployments**에서 보호 비활성화

⚠️ **주의**: 모든 배포가 공개 접근 가능해집니다.

## 권장 설정

### 최적 설정 (방법 1 사용)

1. **OPTIONS Allowlist**에 `/api/webhook` 추가
2. 다른 보호 기능은 유지
3. 웹훅만 공개 접근 가능, 나머지는 보호됨

### 설정 후 테스트

```bash
# OPTIONS 요청 테스트 (CORS preflight)
curl -X OPTIONS "https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app/api/webhook/[botId]" \
  -H "Origin: https://www.tradingview.com" \
  -H "Access-Control-Request-Method: POST"

# POST 요청 테스트
curl -X POST "https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{"action":"buy","ticker":"NVDA","price":145.20}'
```

## 체크리스트

- [ ] OPTIONS Allowlist에 `/api/webhook` 추가
- [ ] 설정 저장
- [ ] TradingView Alert 재설정
- [ ] 웹훅 테스트
- [ ] Vercel 로그에서 요청 확인

