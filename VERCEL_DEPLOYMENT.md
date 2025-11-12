# Vercel 배포 가이드

## 📋 전체 아키텍처

```
[TradingView Alert]
    ↓ POST
[Vercel: /api/webhook/[botId]]
    ↓
[검증 & 센티먼트 체크]
    ↓
[Alpaca API 매매 실행]
    ↓
[DB 로그 저장]
```

## 🗺️ 단계별 로드맵

### Phase 1: 로컬 개발 & 테스트 ✅ (완료)

현재 프로젝트는 이미 다음이 구현되어 있습니다:
- ✅ Next.js API Route (`/app/api/webhook/[botId]/route.ts`)
- ✅ Alpaca API 클라이언트 (`lib/alpaca.ts`)
- ✅ Alpha Vantage 센티먼트 (`lib/alphavantage.ts`)
- ✅ Prisma DB 연결
- ✅ ngrok 스크립트 (`scripts/dev-with-ngrok.js`)

### Phase 2: Vercel 배포 (30분)

#### Step 1: GitHub에 코드 푸시

```bash
git init
git add .
git commit -m "Initial MoneyGoku setup"
git remote add origin https://github.com/your-name/moneygoku.git
git push -u origin main
```

#### Step 2: Vercel 연결

1. [vercel.com](https://vercel.com) 접속
2. "Import Project" 클릭
3. GitHub 저장소 선택
4. 자동 배포 시작

#### Step 3: Vercel 환경 변수 설정

**Settings → Environment Variables**에 다음 변수 추가:

```env
# Database
DATABASE_URL=your_database_url

# Alpaca API
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Alpha Vantage API
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Base URL (자동 감지되지만 명시적으로 설정 가능)
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app

# 보안 (선택사항)
WEBHOOK_SECRET=your_checksum_secret
```

#### Step 4: 프로덕션 URL 확인

배포 완료 후:
```
https://your-project.vercel.app/api/webhook/[botId]
```

### Phase 3: TradingView 프로덕션 연결 (10분)

#### Step 1: 봇 생성 및 웹훅 URL 확인

1. 대시보드에서 봇 생성
2. 생성된 웹훅 URL 확인 (자동으로 Vercel URL로 설정됨)

#### Step 2: TradingView Alert 설정

1. TradingView 차트에서 "Add Alert" 클릭
2. **Webhook URL**에 봇의 웹훅 URL 입력
3. **Message**에 다음 JSON 입력:

```json
{
  "action": "buy",
  "ticker": "{{ticker}}",
  "price": "{{close}}"
}
```

#### Step 3: 실전 Alert 예시

**차트**: NVDA 15분봉  
**조건**: RSI(14) < 30  
**Webhook URL**: `https://your-project.vercel.app/api/webhook/[botId]`  
**Message**: 
```json
{
  "action": "buy",
  "ticker": "{{ticker}}",
  "price": "{{close}}"
}
```

### Phase 4: 모니터링 & 로그 (선택)

#### Vercel 로그 확인

**Vercel Dashboard → Project → Logs**
- 실시간 요청 확인
- 에러 추적
- 성능 모니터링

#### DB 연결

현재 프로젝트는 Prisma를 사용합니다. Vercel 배포 시:

**옵션 1: Vercel Postgres (권장)**
- Vercel Dashboard에서 직접 연결
- 무료 티어 제공
- 자동으로 `DATABASE_URL` 환경 변수 설정됨

**옵션 2: Supabase**
- 무료 PostgreSQL 제공
- `DATABASE_URL` 환경 변수에 연결 문자열 입력

**옵션 3: PlanetScale**
- 무료 MySQL 제공
- Prisma 스키마 수정 필요 (`provider = "mysql"`)

**자세한 설정 방법**: [DATABASE_SETUP.md](./DATABASE_SETUP.md) 참고

#### 웹훅 시크릿 (선택사항)

보안을 강화하려면 `WEBHOOK_SECRET` 환경 변수를 설정하세요:

1. **시크릿 생성**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Vercel 환경 변수에 추가**
   ```
   WEBHOOK_SECRET=생성된_시크릿_값
   ```

3. **코드에 검증 로직 추가 필요**
   - 현재는 환경 변수만 정의되어 있고 검증 로직은 구현되지 않음
   - 보안 강화가 필요하면 [WEBHOOK_SECRET_SETUP.md](./WEBHOOK_SECRET_SETUP.md) 참고

## 📁 핵심 파일 구조

### `/app/api/webhook/[botId]/route.ts`
- TradingView POST 받기
- 봇 조회 및 검증
- 센티먼트 체크 (0.25~0.65 범위)
- Alpaca API 호출
- 200 응답 반환

### `/lib/alpaca.ts`
- Alpaca API 클라이언트
- 매수/매도 주문 실행
- 포지션 확인
- 계좌 정보 조회

### `/lib/alphavantage.ts`
- Alpha Vantage News Sentiment API 호출
- 점수 계산 (0.25~0.65 체크)
- 뉴스 개수 확인 (최소 5개)

## 🔐 보안 체크리스트

- ✅ CORS 설정 (TradingView 허용)
- ✅ 환경 변수로 API 키 관리
- ⚠️ Checksum 검증 (선택사항, 구현 가능)
- ⚠️ Rate limiting (선택사항, 구현 가능)
- ✅ HTTPS only (Vercel 자동)
- ✅ 에러 로그 (민감 정보 제외)

## 📊 테스트 플랜

### 로컬 테스트

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run ngrok
```

**테스트 항목:**
- ✅ ngrok + curl로 POST 테스트
- ✅ 센티먼트 0.3일 때 → 매수 실행
- ✅ 센티먼트 0.1일 때 → 매수 거부
- ✅ Alpaca Paper Trading 확인

### Vercel 테스트

**테스트 항목:**
- ✅ 실제 TradingView Alert 발동
- ✅ Vercel 로그에서 요청 확인
- ✅ Alpaca에서 주문 확인
- ✅ 에러 처리 확인

## 💰 예상 비용

### Vercel Free 플랜 (충분함)

**월 사용량 예상:**
- Alert: 1,500회/월
- API 호출: 4,500회/월
  - Alert당 센티먼트 체크 1회 + Alpaca 2회
- 대역폭: 5MB/월
- 실행 시간: 총 50분/월

**무료 한도:**
- 100 실행/일 = 3,000회/월 ✅
- 100 GB 대역폭 ✅
- 10초/실행 ✅

→ **무료로 충분!** ✅

### 추가 서비스 (선택)

- Vercel Postgres: $0 (무료 티어)
- Sentry 에러 추적: $0 (무료 5k 이벤트)
- Uptime monitoring: $0 (UptimeRobot 무료)

## 🚨 주의사항

### 1. 10초 타임아웃

Vercel 무료 플랜은 10초 타임아웃이 있습니다.

```typescript
// ✅ 빠르게 처리 (권장)
const sentiment = await getSentiment(symbol); // 1초
if (sentiment > 0.25) {
  await alpaca.createOrder(...); // 2초
}
// 총 3초 → OK

// ❌ 이렇게 하면 타임아웃
await sleep(15000);
```

### 2. Cold Start 고려

**첫 요청**: 1-2초 지연 가능

**해결책:**
- Vercel Pro ($20/월) → 0초
- 또는 무시 (실전 영향 적음)

### 3. Rate Limiting

현재는 구현되지 않았지만, 필요시 추가 가능합니다.

## 🎯 최종 타임라인

**Day 1:**
- ✅ 오전: Next.js API Route 코딩 (완료)
- ✅ 오후: 로컬 ngrok 테스트 (완료)
- ✅ 저녁: Alpaca Paper Trading 연동 (완료)

**Day 2:**
- ⏳ 오전: GitHub 푸시 + Vercel 배포
- ⏳ 오후: TradingView 실전 Alert 설정
- ⏳ 저녁: 모니터링 & 로그 확인

**Day 3~:**
- ⏳ 실전 운영 & 최적화

## ✅ 완성 체크리스트

**Phase 1 (로컬):** ✅ 완료
- ✅ Next.js 프로젝트 생성
- ✅ API Route 구현
- ✅ ngrok 테스트 성공
- ✅ Alpaca Paper Trading 확인

**Phase 2 (배포):** ⏳ 진행 필요
- ⏳ GitHub 푸시
- ⏳ Vercel 연결
- ⏳ 환경 변수 설정
- ⏳ 프로덕션 URL 확인

**Phase 3 (실전):** ⏳ 진행 필요
- ⏳ TradingView Alert 연결
- ⏳ 실전 매매 성공
- ⏳ 로그 확인 시스템
- ⏳ 에러 모니터링

**Phase 4 (최적화):** ⏳ 선택사항
- ✅ DB 연결 (완료)
- ✅ 대시보드 UI (완료)
- ✅ 알림 시스템 (완료)
- ✅ 성과 추적 (완료)

## 🔗 유용한 링크

- [Vercel Docs](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Alpaca API](https://alpaca.markets/docs/api-references)
- [Alpha Vantage](https://www.alphavantage.co/documentation)
- [ngrok](https://ngrok.com/download)
- [Prisma Docs](https://www.prisma.io/docs)

