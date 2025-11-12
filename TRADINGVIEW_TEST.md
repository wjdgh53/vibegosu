# TradingView 웹훅 테스트 가이드

## 🧪 빠른 테스트 방법

### 1. 간단한 테스트 Alert 생성

**TradingView에서:**

1. **차트 열기**
   - 아무 종목이나 선택 (예: NVDA, AAPL, TSLA)
   - 시간봉 아무거나 (1분, 5분, 15분 등)

2. **Alert 생성**
   - 차트에서 우클릭 → "Add Alert"
   - 또는 상단 메뉴: "Alerts" → "Create Alert"

3. **조건 설정 (가장 간단한 방법)**
   ```
   Condition: Price
   Operator: Crosses Above
   Value: 현재가보다 낮은 값 (예: 현재가가 100이면 50)
   ```
   → 이렇게 하면 즉시 알림이 발동됩니다!

4. **Webhook URL 설정**
   ```
   Webhook URL: [봇의 웹훅 URL]
   ```
   예시: `https://kira-depositional-scrumptiously.ngrok-free.dev/api/webhook/cmhtmbp3c00008ogihzki7s1e`

5. **Message 설정**
   ```json
   {
     "action": "buy",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```

6. **"Create" 클릭**

### 2. 즉시 테스트하는 방법 (가장 빠름)

**조건을 현재가보다 낮게 설정하면 즉시 발동됩니다:**

1. 현재가 확인 (예: NVDA = $145.20)
2. Alert 조건: `Price Crosses Above $100`
3. Create → 즉시 알림 발동! ✅

## 📊 웹훅 요청 확인 방법

### 방법 1: 대시보드에서 확인

1. **대시보드 접속**: `http://localhost:3000`
2. **최근 알림** 섹션 확인
3. 웹훅이 오면 알림이 표시됩니다

### 방법 2: 터미널 로그 확인

개발 서버 터미널에서:
```
[Webhook] buy signal received for bot: { botId: '...', ticker: 'NVDA', ... }
```

### 방법 3: API로 확인

```bash
# 최근 알림 확인
curl http://localhost:3000/api/notifications

# 특정 봇의 웹훅 상태 확인
curl http://localhost:3000/api/webhook/[botId]
```

## ✅ 테스트 체크리스트

- [ ] Alert 생성 완료
- [ ] Webhook URL 입력 완료
- [ ] Message JSON 입력 완료
- [ ] Alert 발동 확인
- [ ] 대시보드에서 알림 확인
- [ ] 터미널에서 로그 확인

## 🐛 문제 해결

### Alert가 발동되지 않는 경우
- 조건이 너무 높게 설정되었는지 확인
- 현재가보다 낮은 값으로 설정하면 즉시 발동됩니다

### 웹훅이 오지 않는 경우
- ngrok이 실행 중인지 확인: `http://127.0.0.1:4040`
- 개발 서버가 실행 중인지 확인: `http://localhost:3000`
- Webhook URL이 정확한지 확인

### CORS 오류가 발생하는 경우
- 웹훅 엔드포인트는 CORS가 설정되어 있어야 합니다
- 이미 설정되어 있으므로 문제 없어야 합니다

