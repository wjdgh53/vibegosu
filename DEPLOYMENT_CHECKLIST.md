# 배포 완료 체크리스트 ✅

## ✅ 완료된 작업

### 1. 코드 준비
- [x] GitHub에 코드 푸시 완료
- [x] TypeScript 타입 에러 수정 완료
- [x] Prisma 스키마 PostgreSQL로 변경 완료
- [x] 빌드 스크립트에 마이그레이션 추가 완료

### 2. Vercel 배포
- [x] Vercel 프로젝트 연결 완료
- [x] 빌드 성공 확인

### 3. 데이터베이스 설정
- [x] 데이터베이스 생성 완료 (Vercel Postgres 또는 Supabase)
- [x] DATABASE_URL 환경 변수 설정 완료
- [x] Prisma 마이그레이션 실행 완료

### 4. 환경 변수 설정
- [x] DATABASE_URL 설정 완료
- [x] ALPACA_API_KEY 설정 완료
- [x] ALPACA_SECRET_KEY 설정 완료
- [x] ALPACA_BASE_URL 설정 완료 (또는 기본값 사용)
- [x] ALPHA_VANTAGE_API_KEY 설정 완료

## 🧪 테스트 체크리스트

### 1. 프로덕션 URL 접속 확인
```
https://your-project.vercel.app
```
- [ ] 페이지가 정상적으로 로드되는가?
- [ ] 대시보드로 리다이렉트되는가?

### 2. 대시보드 기능 확인
- [ ] 대시보드 페이지가 정상적으로 표시되는가?
- [ ] 봇 목록이 표시되는가? (없어도 정상)
- [ ] 알림 섹션이 표시되는가?

### 3. 봇 생성 테스트
- [ ] "+ 새 봇 만들기" 버튼 클릭
- [ ] 봇 생성 폼이 표시되는가?
- [ ] 봇 생성이 성공하는가?
- [ ] 웹훅 URL이 표시되는가?

### 4. API 엔드포인트 테스트
```bash
# 봇 목록 조회
curl https://your-project.vercel.app/api/bots

# 웹훅 상태 확인
curl https://your-project.vercel.app/api/webhook/[botId]
```

- [ ] API가 정상적으로 응답하는가?
- [ ] 에러 없이 JSON이 반환되는가?

### 5. 웹훅 테스트
```bash
curl -X POST "https://your-project.vercel.app/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "ticker": "NVDA",
    "price": 145.20
  }'
```

- [ ] 웹훅이 정상적으로 수신되는가?
- [ ] Vercel 로그에서 요청이 확인되는가?

## 🚀 다음 단계: TradingView 연동

### 1. 봇 생성
1. 대시보드에서 봇 생성
2. 웹훅 URL 복사

### 2. TradingView Alert 설정
1. TradingView 차트에서 "Add Alert" 클릭
2. Webhook URL에 복사한 URL 입력
3. Message에 다음 JSON 입력:
   ```json
   {
     "action": "buy",
     "ticker": "{{ticker}}",
     "price": "{{close}}"
   }
   ```

### 3. 모니터링
- Vercel Dashboard → Logs에서 실시간 요청 확인
- 대시보드에서 알림 및 거래 내역 확인

## 🐛 문제 해결

### 페이지가 로드되지 않는 경우
1. Vercel Dashboard → Deployments에서 빌드 상태 확인
2. 빌드 로그에서 에러 확인
3. 환경 변수 설정 확인

### 데이터베이스 연결 실패
1. DATABASE_URL 환경 변수 확인
2. Prisma 마이그레이션 실행 확인
3. Vercel 로그에서 Prisma 에러 확인

### API 에러 발생
1. Vercel Dashboard → Logs에서 에러 확인
2. 환경 변수 (API 키) 확인
3. API 키 유효성 확인

## 📚 참고 문서

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 데이터베이스 설정 가이드
- [PRODUCTION_WEBHOOK_SETUP.md](./PRODUCTION_WEBHOOK_SETUP.md) - 웹훅 연결 가이드
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 전체 배포 가이드

## 🎉 완료!

모든 설정이 완료되었다면 이제 TradingView와 연동하여 자동 매매를 시작할 수 있습니다!

