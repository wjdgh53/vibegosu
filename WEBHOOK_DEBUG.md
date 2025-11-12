# 웹훅 디버깅 가이드

## 프로덕션에서 웹훅이 작동하지 않는 경우

### 1. Vercel 로그 확인

**Vercel Dashboard → Project → Logs**

웹훅 요청이 도달하는지 확인:
- 요청이 오면: `🔔 TradingView 웹훅 요청 수신!` 로그가 보임
- 요청이 안 오면: TradingView 설정 문제

### 2. 웹훅 URL 확인

프로덕션에서 봇을 생성했는지 확인:

```bash
# 프로덕션 봇 목록 확인
curl https://your-project.vercel.app/api/bots

# 특정 봇의 웹훅 URL 확인
curl https://your-project.vercel.app/api/webhook/[botId]
```

**중요**: 로컬에서 생성한 봇은 로컬 데이터베이스에만 있습니다!
- 프로덕션에서 봇을 새로 생성해야 합니다
- 프로덕션 봇의 웹훅 URL을 TradingView에 사용해야 합니다

### 3. 일반적인 문제

#### 문제 1: 로컬 봇 URL을 프로덕션에 사용
**증상**: 웹훅이 작동하지 않음
**해결**: 
- 프로덕션 대시보드에서 봇을 새로 생성
- 프로덕션 웹훅 URL을 TradingView에 사용

#### 문제 2: 봇을 찾을 수 없음 (404)
**증상**: Vercel 로그에 `❌ 봇을 찾을 수 없습니다` 메시지
**해결**:
- 프로덕션 데이터베이스에 봇이 있는지 확인
- 봇 ID가 정확한지 확인
- 프로덕션에서 봇을 새로 생성

#### 문제 3: 요청이 도달하지 않음
**증상**: Vercel 로그에 아무것도 안 보임
**해결**:
- TradingView Alert 설정 확인
- Webhook URL이 정확한지 확인
- Alert가 실제로 발동되었는지 확인

### 4. 테스트 방법

#### 방법 1: curl로 직접 테스트

```bash
# 프로덕션 웹훅 테스트
curl -X POST "https://your-project.vercel.app/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "ticker": "NVDA",
    "price": 145.20
  }'
```

성공하면:
- Vercel 로그에 요청이 보임
- 응답이 반환됨

#### 방법 2: TradingView Alert 즉시 발동 테스트

1. 현재가 확인 (예: NVDA = $150)
2. Alert 조건을 현재가보다 낮게 설정 (예: Price Crosses Above $100)
3. Create → 즉시 발동!

### 5. 체크리스트

- [ ] 프로덕션에서 봇을 생성했는가?
- [ ] 프로덕션 웹훅 URL을 TradingView에 사용했는가?
- [ ] TradingView Alert가 실제로 발동되었는가?
- [ ] Vercel 로그에서 요청이 확인되는가?
- [ ] curl로 직접 테스트했을 때 작동하는가?

### 6. 로그 확인 포인트

Vercel 로그에서 확인할 내용:

```
🔔 TradingView 웹훅 요청 수신!  ← 요청이 도달했는지
🤖 Bot ID: xxx                  ← 봇 ID 확인
✅ 봇 찾음: NVDA                 ← 봇 조회 성공
📋 Action: buy                   ← 액션 확인
```

에러가 있으면:
```
❌ 봇을 찾을 수 없습니다        ← 봇이 DB에 없음
❌ 매수 거부: ...                ← 센티먼트 체크 실패
```

