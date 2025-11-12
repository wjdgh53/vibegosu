# 프로덕션 웹훅 연결 가이드

## 🚀 프로덕션 웹훅 연결 방법

프로덕션 환경(Vercel)에서 TradingView 웹훅을 연결하는 방법입니다.

## 1단계: Vercel 배포 확인

1. **Vercel에 프로젝트 배포 완료 확인**
   - GitHub 저장소가 연결되어 있어야 합니다
   - 배포가 성공적으로 완료되어야 합니다
   - 프로덕션 URL 확인: `https://your-project.vercel.app`

2. **환경 변수 설정 확인** (Vercel Dashboard)
   ```
   DATABASE_URL=your_database_url
   ALPACA_API_KEY=your_alpaca_api_key
   ALPACA_SECRET_KEY=your_alpaca_secret_key
   ALPACA_BASE_URL=https://paper-api.alpaca.markets
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   ```
   
   ⚠️ **중요**: `NEXT_PUBLIC_BASE_URL`은 **설정하지 않아도 됩니다!**
   - Vercel 배포 시 자동으로 프로덕션 URL로 감지됩니다
   - 수동 설정 시 오히려 문제가 될 수 있습니다

## 2단계: 봇 생성 및 웹훅 URL 확인

### 방법 1: 대시보드를 통한 봇 생성 (권장)

1. **프로덕션 대시보드 접속**
   ```
   https://your-project.vercel.app/dashboard
   ```

2. **봇 생성**
   - "+ 새 봇 만들기" 클릭
   - 종목, 투자금, 손절/익절, 센티먼트 임계값 입력
   - "봇 생성" 클릭

3. **웹훅 URL 확인**
   - 봇 생성 완료 후 자동으로 표시되는 웹훅 URL 복사
   - 형식: `https://your-project.vercel.app/api/webhook/[botId]`
   - 예시: `https://vibegosu.vercel.app/api/webhook/cmhtmbp3c00008ogihzki7s1e`

### 방법 2: API를 통한 웹훅 URL 확인

기존 봇의 웹훅 URL을 확인하려면:

```bash
# 봇 목록 조회
curl https://your-project.vercel.app/api/bots

# 특정 봇의 웹훅 정보 확인
curl https://your-project.vercel.app/api/webhook/[botId]
```

응답 예시:
```json
{
  "status": "ok",
  "botId": "cmhtmbp3c00008ogihzki7s1e",
  "ticker": "NVDA",
  "webhookUrl": "https://vibegosu.vercel.app/api/webhook/cmhtmbp3c00008ogihzki7s1e",
  "environment": "production",
  "baseUrl": "auto-detected"
}
```

## 3단계: TradingView Alert 설정

### 1. TradingView 차트 열기

1. TradingView 웹사이트 접속
2. 원하는 종목 차트 열기 (예: NVDA, TSLA, AAPL)
3. 원하는 시간봉 선택 (1분, 5분, 15분 등)

### 2. Alert 생성

1. **차트에서 우클릭** → **"Add Alert"** 클릭
   또는 상단 메뉴: **"Alerts"** → **"Create Alert"**

2. **조건 설정**
   - 예시 1: RSI(14) < 30 (과매도 구간)
   - 예시 2: Price Crosses Above Moving Average
   - 예시 3: Custom Pine Script 조건

3. **Webhook URL 설정**
   ```
   Webhook URL: https://your-project.vercel.app/api/webhook/[botId]
   ```
   - 2단계에서 복사한 웹훅 URL을 붙여넣기

4. **Message 설정** (JSON 형식)
   ```json
   {
     "action": "buy",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```
   
   **매도 신호의 경우:**
   ```json
   {
     "action": "sell",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```

5. **"Create" 클릭**

### 3. Alert 테스트 (선택사항)

즉시 테스트하려면:
- 조건을 현재가보다 낮게 설정 (예: Price Crosses Above $100, 현재가가 $150인 경우)
- Create 클릭 시 즉시 Alert 발동

## 4단계: 웹훅 동작 확인

### 대시보드에서 확인

1. **프로덕션 대시보드 접속**
   ```
   https://your-project.vercel.app/dashboard
   ```

2. **최근 알림 확인**
   - 웹훅이 수신되면 알림이 표시됩니다
   - 매수/매도 실행 결과 확인

### Vercel 로그에서 확인

1. **Vercel Dashboard** → **Project** → **Logs**
2. 실시간 요청 로그 확인
3. 웹훅 요청이 오면 다음과 같은 로그가 표시됩니다:
   ```
   🔔 TradingView 웹훅 요청 수신!
   📋 Action: buy
   🤖 Bot ID: cmhtmbp3c00008ogihzki7s1e
   📈 Ticker: NVDA
   💰 Price: 145.20
   ```

### API로 확인

```bash
# 최근 알림 확인
curl https://your-project.vercel.app/api/notifications

# 거래 내역 확인
curl https://your-project.vercel.app/api/trades
```

## 🔧 웹훅 URL 자동 감지 원리

프로덕션 환경에서 웹훅 URL은 다음 순서로 자동 감지됩니다:

1. **Vercel 헤더 사용** (최우선)
   - `x-forwarded-proto`: `https`
   - `x-forwarded-host`: `your-project.vercel.app`
   - 자동으로 `https://your-project.vercel.app` 생성

2. **환경 변수** (`NEXT_PUBLIC_BASE_URL`)
   - 설정되어 있으면 사용 (일반적으로 불필요)

3. **요청 Host 헤더**
   - 로컬 개발 환경에서 사용

4. **기본값**
   - `http://localhost:3000` (개발 환경)

## ✅ 체크리스트

프로덕션 웹훅 연결 전 확인사항:

- [ ] Vercel 배포 완료
- [ ] 환경 변수 설정 완료 (DATABASE_URL, API 키 등)
- [ ] 프로덕션 대시보드 접속 가능
- [ ] 봇 생성 완료
- [ ] 웹훅 URL 복사 완료
- [ ] TradingView Alert 생성 완료
- [ ] Webhook URL 입력 완료
- [ ] Message JSON 입력 완료
- [ ] Alert 발동 테스트 완료
- [ ] 대시보드에서 알림 확인 완료

## 🐛 문제 해결

### 웹훅이 오지 않는 경우

1. **웹훅 URL 확인**
   ```bash
   curl https://your-project.vercel.app/api/webhook/[botId]
   ```
   - 정상 응답이 오는지 확인

2. **CORS 확인**
   - 웹훅 엔드포인트는 CORS가 설정되어 있어야 합니다
   - 이미 설정되어 있으므로 문제 없어야 합니다

3. **Vercel 로그 확인**
   - Vercel Dashboard → Logs에서 에러 확인
   - 404 에러: 봇 ID가 잘못되었을 수 있음
   - 500 에러: 서버 오류 (환경 변수, DB 연결 확인)

### 봇을 찾을 수 없다는 에러

- 봇 ID가 정확한지 확인
- 데이터베이스 연결 확인
- Prisma 마이그레이션 완료 확인

### 센티먼트 체크 실패

- Alpha Vantage API 키 확인
- API 호출 제한 확인 (무료 플랜: 5 calls/minute)
- 뉴스 개수 부족 시 매수 거부 (최소 5개 필요)

## 📚 추가 리소스

- [TradingView Alert 설정 가이드](./TRADINGVIEW_SETUP.md)
- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT.md)
- [웹훅 설정 가이드](./WEBHOOK_SETUP.md)

