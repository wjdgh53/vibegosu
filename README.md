# MoneyGoku - TradingView 자동 매매 봇

TradingView 웹훅을 통해 매수/매도 신호를 받아 Alpha Vantage의 뉴스 센티먼트를 분석하고, Alpaca API를 통해 자동으로 매매를 실행하는 Next.js 기반 트레이딩 봇입니다.

## 주요 기능

- **봇 관리**: 여러 종목에 대한 봇을 생성하고 관리
- **TradingView 웹훅 연동**: 봇별 고유 Webhook URL 생성
- **뉴스 센티먼트 분석**: Alpha Vantage API를 통한 실시간 뉴스 센티먼트 조회
- **자동 매매 실행**: Alpaca API를 통한 자동 매수/매도
- **스마트 필터링**: 
  - 센티먼트 점수가 설정값 이상일 때만 매수
  - 부정 뉴스 감지 시 매수 거부 및 알림
- **실시간 대시보드**: 봇 상태, 포지션, 알림 내역 실시간 조회
- **거래 내역**: 모든 거래 기록 및 통계 조회

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vibegosu?schema=public"

# Alpaca API 설정
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Alpha Vantage API 설정
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Base URL (배포 시 설정)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 대시보드를 확인하세요.

## 사용 방법

### 1. 봇 생성

1. 대시보드에서 "+ 새 봇 만들기" 클릭
2. 다음 정보 입력:
   - **종목**: TradingView에서 신호를 받을 종목 (예: NVDA, TSLA)
   - **투자금**: 매수 신호 시 투자할 금액 (USD)
   - **손절 비율**: 손절 비율 (예: 0.03 = 3%)
   - **익절 비율**: 익절 비율 (예: 0.07 = 7%)
   - **뉴스 센티먼트 최소값**: 매수 허용 최소 센티먼트 점수 (기본값: 0.7)
3. "봇 생성" 클릭
4. 생성된 Webhook URL을 복사

### 2. TradingView 웹훅 설정

1. TradingView에서 웹훅 알림 설정
2. 웹훅 URL에 복사한 URL 붙여넣기
3. 요청 형식:
   ```json
   {
     "action": "buy",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```

### 3. 매매 로직

#### 매수 신호 처리:
1. TradingView에서 매수 신호 수신
2. Alpha Vantage로 해당 종목의 뉴스 센티먼트 조회 (최근 20개)
3. 센티먼트 점수 확인:
   - **설정값 이상**: Alpaca API로 자동 매수 실행
   - **설정값 미만**: 매수 거부, 알림 전송
4. 거래 내역 저장

#### 매도 신호 처리:
1. TradingView에서 매도 신호 수신
2. 해당 종목의 포지션 확인
3. 포지션이 있으면 즉시 전량 청산
4. 거래 내역 업데이트

## 프로젝트 구조

```
vibegosu/
├── app/
│   ├── api/
│   │   ├── webhook/[botId]/  # 동적 Webhook 엔드포인트
│   │   ├── bots/             # 봇 관리 API
│   │   ├── trades/           # 거래 내역 API
│   │   └── notifications/    # 알림 API
│   ├── dashboard/            # 대시보드 페이지
│   ├── bots/new/             # 봇 생성 페이지
│   ├── trades/               # 거래 내역 페이지
│   └── settings/             # 설정 페이지
├── components/
│   ├── BotCard.tsx           # 봇 카드 컴포넌트
│   ├── PositionCard.tsx     # 포지션 카드 컴포넌트
│   └── NotificationCard.tsx # 알림 카드 컴포넌트
├── lib/
│   ├── db.ts                 # Prisma 클라이언트
│   ├── alpaca.ts             # Alpaca API 클라이언트
│   ├── alphavantage.ts       # Alpha Vantage API 클라이언트
│   ├── trading.ts            # 매매 로직
│   └── bot-utils.ts          # 봇 유틸리티
└── prisma/
    └── schema.prisma         # 데이터베이스 스키마
```

## 데이터베이스 스키마

- **Bot**: 봇 설정 (종목, 투자금, 손절/익절, 센티먼트 임계값)
- **Position**: 현재 포지션 (진입가, 수량, 상태)
- **Trade**: 거래 내역 (진입가, 청산가, 수익률, 센티먼트 점수, 뉴스 제목)
- **Notification**: 알림 내역

## API 엔드포인트

### POST /api/webhook/[botId]
TradingView 웹훅을 받아 매매를 실행합니다.

**요청 본문:**
```json
{
  "action": "buy" | "sell",
  "ticker": "NVDA",
  "price": 145.20
}
```

### GET /api/bots
모든 봇 목록을 조회합니다.

### POST /api/bots
새 봇을 생성합니다.

### DELETE /api/bots/[id]
봇을 삭제합니다.

### GET /api/trades
거래 내역을 조회합니다.

## 배포

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 데이터베이스 연결 (Vercel Postgres 또는 Supabase)

### 데이터베이스 마이그레이션

```bash
# 프로덕션 마이그레이션
npx prisma migrate deploy
```

## 주의사항

1. **Paper Trading**: 기본적으로 Alpaca Paper Trading을 사용합니다.
2. **API 제한**: Alpha Vantage API는 무료 플랜에서 호출 제한이 있습니다.
3. **보안**: Webhook 엔드포인트에 인증을 추가하는 것을 권장합니다.
4. **손절/익절**: 현재 손절/익절은 정보 표시용입니다. 실제 손절/익절은 TradingView 전략에서 처리해야 합니다.

## 라이선스

MIT
