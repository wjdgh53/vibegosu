# TradingView 웹훅 요청이 도달하지 않는 경우

## 증상: Vercel 로그에 아무것도 안 보임

### 1. TradingView Alert 설정 확인

#### 웹훅 URL 형식 확인
```
✅ 올바른 형식:
https://your-project.vercel.app/api/webhook/[botId]

❌ 잘못된 형식:
http://your-project.vercel.app/api/webhook/[botId]  (http는 안됨)
https://your-project.vercel.app/api/webhook         (botId 없음)
https://localhost:3000/api/webhook/[botId]          (로컬 URL)
```

#### Message JSON 형식 확인
```json
{
  "action": "buy",
  "ticker": "{{ticker}}",
  "price": "{{close}}"
}
```

**주의사항:**
- JSON 형식이 정확해야 함
- 따옴표는 쌍따옴표(`"`) 사용
- 쉼표 뒤 공백 주의

### 2. Alert가 실제로 발동되었는지 확인

#### 즉시 테스트 방법
1. 현재가 확인 (예: NVDA = $150)
2. Alert 조건을 현재가보다 낮게 설정:
   - `Price Crosses Above $100`
3. Create 클릭 → 즉시 발동!

#### Alert 발동 확인
- TradingView에서 Alert가 "Triggered" 상태인지 확인
- Alert 히스토리에서 발동 기록 확인

### 3. 웹훅 URL 직접 테스트

#### curl로 테스트
```bash
curl -X POST "https://your-project.vercel.app/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "ticker": "NVDA",
    "price": 145.20
  }'
```

**성공하면:**
- Vercel 로그에 요청이 보임
- 응답이 반환됨

**실패하면:**
- 404: 봇 ID가 잘못됨
- 500: 서버 에러 (로그 확인)

### 4. TradingView 웹훅 제한사항 확인

#### TradingView 무료 계정 제한
- 웹훅은 Pro 이상 계정에서만 사용 가능
- 무료 계정은 웹훅 미지원

#### 웹훅 URL 검증
- HTTPS만 지원 (HTTP 불가)
- 공개적으로 접근 가능해야 함 (인증 불가)
- 200 OK 응답 필요

### 5. 일반적인 문제 해결

#### 문제 1: Alert가 발동되지 않음
**해결:**
- 조건을 현재가보다 낮게 설정
- Alert가 "Active" 상태인지 확인
- 차트가 정상적으로 로드되었는지 확인

#### 문제 2: 웹훅 URL이 잘못됨
**해결:**
- 프로덕션에서 봇을 새로 생성
- 웹훅 URL을 다시 복사
- URL에 공백이나 특수문자가 없는지 확인

#### 문제 3: TradingView가 요청을 보내지 않음
**해결:**
- TradingView 계정이 Pro 이상인지 확인
- Alert 설정에서 "Webhook URL"이 활성화되어 있는지 확인
- Message 필드가 비어있지 않은지 확인

### 6. 단계별 체크리스트

- [ ] 프로덕션에서 봇을 생성했는가?
- [ ] 웹훅 URL이 `https://`로 시작하는가?
- [ ] 웹훅 URL에 `botId`가 포함되어 있는가?
- [ ] curl로 직접 테스트했을 때 작동하는가?
- [ ] TradingView Alert가 실제로 발동되었는가?
- [ ] TradingView 계정이 Pro 이상인가?
- [ ] Alert의 Webhook URL 필드가 채워져 있는가?
- [ ] Message JSON이 올바른 형식인가?

### 7. 대안: 수동 테스트

웹훅이 작동하지 않으면 수동으로 테스트:

```bash
# 1. 봇 목록 확인
curl https://your-project.vercel.app/api/bots

# 2. 웹훅 직접 호출
curl -X POST "https://your-project.vercel.app/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{"action":"buy","ticker":"NVDA","price":145.20}'

# 3. Vercel 로그 확인
# Vercel Dashboard → Logs에서 요청 확인
```

### 8. 추가 디버깅

#### Vercel 함수 로그 확인
- Vercel Dashboard → Project → Logs
- 실시간 로그 스트림 확인
- 에러 메시지 확인

#### 네트워크 확인
- TradingView에서 웹훅 요청이 실제로 전송되는지 확인
- 브라우저 개발자 도구 → Network 탭에서 확인 (가능한 경우)

### 9. 여전히 작동하지 않는 경우

1. **프로덕션 봇 재생성**
   - 기존 봇 삭제
   - 새 봇 생성
   - 새 웹훅 URL 사용

2. **TradingView Alert 재생성**
   - 기존 Alert 삭제
   - 새 Alert 생성
   - 웹훅 URL 다시 입력

3. **Vercel 재배포**
   - Vercel Dashboard → Deployments → Redeploy

4. **환경 변수 확인**
   - DATABASE_URL이 설정되어 있는지
   - API 키들이 설정되어 있는지

