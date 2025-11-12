# TradingView 연동 가이드

## 📋 준비사항

1. **봇 생성 완료**: 대시보드에서 봇을 생성하고 Webhook URL을 복사해두세요
2. **TradingView 계정**: TradingView Pro+ 이상의 계정이 필요합니다
3. **로컬 테스트**: ngrok 또는 직접 API 호출로 테스트 가능

---

## 🚀 단계별 연동 방법

### 1단계: Webhook URL 확인

1. 대시보드(`http://localhost:3000/dashboard`) 접속
2. 생성한 봇의 Webhook URL 확인
   - 예: `http://localhost:3000/api/webhook/cmhtmbp3c00008ogihzki7s1e`

### 2단계: 로컬 테스트 (선택사항)

#### 방법 A: 직접 API 호출 테스트
```bash
# 터미널에서 실행
curl -X POST "http://localhost:3000/api/webhook/[봇ID]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "ticker": "NVDA",
    "price": 145.20
  }'
```

#### 방법 B: ngrok 사용 (TradingView 연동 테스트)

1. **ngrok 설치**
   ```bash
   # macOS
   brew install ngrok
   
   # 또는 https://ngrok.com/download 에서 다운로드
   ```

2. **ngrok 실행**
   ```bash
   ngrok http 3000
   ```

3. **생성된 URL 확인**
   ```
   Forwarding: https://xxxx-xxxx.ngrok.io -> http://localhost:3000
   ```

4. **환경 변수 업데이트**
   `.env.local` 파일에 추가:
   ```env
   NEXT_PUBLIC_BASE_URL=https://xxxx-xxxx.ngrok.io
   ```

5. **서버 재시작**
   ```bash
   # 개발 서버 재시작
   npm run dev
   ```

6. **봇 재생성** (ngrok URL로 Webhook URL 업데이트)
   - 기존 봇 삭제 후 새로 생성하거나
   - 데이터베이스에서 직접 Webhook URL 업데이트

### 3단계: TradingView 설정

#### 3-1. TradingView 전략 편집기 열기

1. TradingView 웹사이트 접속
2. 상단 메뉴에서 **"Pine Script"** 클릭
3. **"Strategy Tester"** 또는 **"Chart"** 선택
4. 하단의 **"Pine Editor"** 열기

#### 3-2. Webhook 알림 추가

1. 차트에서 우클릭 → **"Add Alert"** 클릭
2. **"Webhook URL"** 섹션에서:
   - **Webhook URL**: 봇 생성 시 받은 URL 입력
     - 로컬: `https://xxxx-xxxx.ngrok.io/api/webhook/[봇ID]`
     - 프로덕션: `https://your-domain.com/api/webhook/[봇ID]`
   
3. **"Message"** 섹션에 다음 JSON 입력:
   ```json
   {
     "action": "buy",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```

4. **"Condition"** 설정:
   - 매수 신호: 원하는 조건 선택 (예: RSI < 30, MACD 크로스 등)
   - 매도 신호: 별도 알림 생성 (action: "sell")

5. **"Expiration"** 설정:
   - "Once Per Bar Close" 선택 (같은 바에서 여러 번 알림 방지)

6. **"Save"** 클릭

#### 3-3. 매도 알림 추가 (선택사항)

매도 신호를 위한 별도 알림 생성:

1. 동일한 차트에서 **"Add Alert"** 다시 클릭
2. **Webhook URL**: 동일한 봇의 Webhook URL 사용
3. **Message**:
   ```json
   {
     "action": "sell",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```
4. **Condition**: 매도 조건 설정
5. **Save**

### 4단계: 프로덕션 배포 (Vercel)

#### 4-1. GitHub에 푸시
```bash
git add .
git commit -m "TradingView webhook integration"
git push origin main
```

#### 4-2. Vercel 배포

1. [Vercel](https://vercel.com) 접속
2. **"New Project"** 클릭
3. GitHub 저장소 선택
4. **Environment Variables** 설정:
   ```
   DATABASE_URL=your_production_database_url
   ALPACA_API_KEY=your_alpaca_key
   ALPACA_SECRET_KEY=your_alpaca_secret
   ALPACA_BASE_URL=https://paper-api.alpaca.markets
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
   ```
5. **"Deploy"** 클릭

#### 4-3. 프로덕션 Webhook URL 업데이트

1. 배포 완료 후 대시보드 접속
2. 봇의 Webhook URL이 자동으로 프로덕션 URL로 업데이트됨
3. TradingView 알림 설정에서 Webhook URL 업데이트

---

## 📝 Webhook 요청 형식

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
  "price": 150.00
}
```

### TradingView 변수 사용
- `{{ticker}}`: 종목 심볼 (예: NVDA, TSLA)
- `{{close}}`: 종가
- `{{open}}`: 시가
- `{{high}}`: 고가
- `{{low}}`: 저가

---

## ✅ 테스트 체크리스트

- [ ] 봇 생성 완료
- [ ] Webhook URL 복사
- [ ] 로컬 테스트 (curl 또는 ngrok)
- [ ] TradingView 알림 생성
- [ ] 매수 신호 테스트
- [ ] 매도 신호 테스트
- [ ] 대시보드에서 알림 확인
- [ ] 거래 내역 확인

---

## 🔧 문제 해결

### Webhook이 작동하지 않는 경우

1. **Webhook URL 확인**
   - 로컬: ngrok URL이 올바른지 확인
   - 프로덕션: 도메인이 올바른지 확인

2. **서버 로그 확인**
   ```bash
   # 개발 서버 로그 확인
   npm run dev
   ```

3. **TradingView 알림 로그 확인**
   - TradingView → Settings → Notifications → Webhook Logs

4. **수동 테스트**
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"action":"buy","ticker":"NVDA","price":145.20}'
   ```

### 센티먼트 점수가 낮아 매수가 거부되는 경우

- 봇 설정에서 **"뉴스 센티먼트 최소값"** 조정
- 기본값: 0.7
- 낮추면: 더 많은 매수 신호 허용 (위험 증가)
- 높이면: 더 엄격한 필터링 (안전하지만 기회 감소)

---

## 📞 추가 도움말

- TradingView Webhook 문서: https://www.tradingview.com/support/solutions/43000529348-webhooks/
- ngrok 문서: https://ngrok.com/docs
- Vercel 배포 가이드: https://vercel.com/docs

