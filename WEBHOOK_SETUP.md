# TradingView 웹훅 설정 가이드

## 🚀 빠른 시작

### 로컬 개발 환경

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **ngrok 설치 및 실행** (TradingView 연동용)
   ```bash
   # ngrok 설치 (macOS)
   brew install ngrok
   
   # ngrok 실행
   ngrok http 3000
   ```

3. **환경 변수 설정** (`.env.local`)
   ```env
   NEXT_PUBLIC_BASE_URL=https://xxxx-xxxx.ngrok.io
   ```

4. **봇 생성**
   - 대시보드에서 봇 생성
   - 생성된 웹훅 URL이 자동으로 ngrok URL로 설정됨

### 프로덕션 환경 (Vercel)

1. **환경 변수 설정** (Vercel Dashboard)
   ```
   NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
   ```

2. **자동 감지**
   - Vercel 배포 시 자동으로 프로덕션 URL로 설정됨
   - 별도 설정 불필요

## 📋 웹훅 URL 생성 로직

웹훅 URL은 다음 우선순위로 자동 생성됩니다:

1. **환경 변수** (`NEXT_PUBLIC_BASE_URL`) - 최우선
2. **서버 헤더** (`x-forwarded-proto`, `x-forwarded-host`) - Vercel/프로덕션
3. **요청 Host 헤더** - 로컬 개발
4. **기본값** - `http://localhost:3000`

### ngrok 자동 처리

- ngrok URL은 자동으로 `https`로 변환됩니다
- 환경 변수에 ngrok URL을 설정하면 자동 반영됩니다

## 🔧 웹훅 테스트

### 1. 웹훅 정보 조회

```bash
GET /api/webhook/[botId]/test
```

응답 예시:
```json
{
  "botId": "xxx",
  "ticker": "NVDA",
  "webhookUrl": "https://xxxx.ngrok.io/api/webhook/xxx",
  "examplePayload": {
    "buy": {
      "action": "buy",
      "ticker": "NVDA",
      "price": 100.0
    }
  }
}
```

### 2. curl로 테스트

```bash
curl -X POST "https://your-webhook-url/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "ticker": "NVDA",
    "price": 145.20
  }'
```

### 3. TradingView 설정

1. TradingView 차트에서 **"Add Alert"** 클릭
2. **Webhook URL**에 봇의 웹훅 URL 입력
3. **Message**에 다음 JSON 입력:
   ```json
   {
     "action": "buy",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```

## 🔒 CORS 설정

웹훅 엔드포인트는 TradingView 요청을 허용하도록 CORS가 설정되어 있습니다:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`

## 📝 요청 형식

### 매수 신호
```json
{
  "action": "buy",
  "ticker": "NVDA",
  "price": 145.20
}
```

### 매도 신호
```json
{
  "action": "sell",
  "ticker": "NVDA",
  "price": 150.50
}
```

## 🐛 문제 해결

### 웹훅 URL이 localhost로 표시되는 경우

1. **로컬 개발:**
   - `.env.local`에 `NEXT_PUBLIC_BASE_URL` 설정
   - ngrok URL 사용 시 해당 URL 설정

2. **프로덕션:**
   - Vercel 환경 변수에 `NEXT_PUBLIC_BASE_URL` 설정
   - 자동 감지가 안 될 경우 수동 설정

### ngrok URL 변경 시

1. 새로운 ngrok URL로 `.env.local` 업데이트
2. 개발 서버 재시작
3. 봇 목록 조회 시 자동으로 새 URL로 업데이트됨

### CORS 오류 발생 시

- 웹훅 엔드포인트는 자동으로 CORS 헤더를 포함합니다
- TradingView에서 직접 호출 시 문제 없어야 합니다

## 📚 관련 문서

- [TradingView 설정 가이드](./TRADINGVIEW_SETUP.md)
- [README](./README.md)

