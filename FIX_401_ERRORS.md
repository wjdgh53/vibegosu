# 401 에러 해결 가이드

## 발견된 문제

Vercel 로그에서 두 가지 401 에러가 확인되었습니다:

### 1. 웹훅 401 에러
```
POST /api/webhook/cmhwfe4m10000la04i7hjkqqz → 401
GET /api/webhook/cmhwfe4m10000la04i7hjkqqz → 401
```

**원인**: Vercel Deployment Protection이 활성화되어 있음

**해결**: OPTIONS Allowlist에 `/api/webhook` 추가

### 2. Alpaca API 401 에러
```
계정 정보 조회 오류: Request failed with status code 401
Bars 조회 실패 (TSLA): code: 401
```

**원인**: Alpaca API 키가 잘못되었거나 만료됨

**해결**: Vercel 환경 변수에서 API 키 확인 및 업데이트

## 해결 방법

### 1단계: 웹훅 401 에러 해결

**Vercel Dashboard → Project → Settings → Deployment Protection**

1. **OPTIONS Allowlist** 섹션 찾기
2. **"Add path"** 클릭
3. 경로 추가: `/api/webhook`
4. **Save** 클릭

### 2단계: Alpaca API 401 에러 해결

**Vercel Dashboard → Project → Settings → Environment Variables**

1. 다음 환경 변수 확인:
   - `ALPACA_API_KEY`
   - `ALPACA_SECRET_KEY`
   - `ALPACA_BASE_URL` (기본값: `https://paper-api.alpaca.markets`)

2. **API 키 확인**:
   - Alpaca Dashboard에서 API 키 확인
   - Paper Trading API 키인지 확인 (실전 키 아님)
   - 키가 만료되지 않았는지 확인

3. **환경 변수 업데이트**:
   - 잘못된 키가 있으면 수정
   - 저장 후 재배포

### 3단계: 재배포 및 테스트

1. 환경 변수 저장 후 자동 재배포 대기
2. 또는 수동으로 **Redeploy** 클릭
3. 웹훅 테스트:
   ```bash
   curl -X POST "https://vibegosu-6t2mq40cq-wjdgh53s-projects.vercel.app/api/webhook/cmhwfe4m10000la04i7hjkqqz" \
     -H "Content-Type: application/json" \
     -d '{"action":"buy","ticker":"NVDA","price":145.20}'
   ```

## 체크리스트

- [ ] OPTIONS Allowlist에 `/api/webhook` 추가
- [ ] Alpaca API 키 확인 (Paper Trading)
- [ ] Alpaca Secret Key 확인
- [ ] ALPACA_BASE_URL 확인 (`https://paper-api.alpaca.markets`)
- [ ] 환경 변수 저장
- [ ] 재배포 완료
- [ ] 웹훅 테스트 성공
- [ ] Alpaca API 테스트 성공

## Alpaca API 키 확인 방법

1. **Alpaca Dashboard** 접속: https://app.alpaca.markets
2. **Paper Trading** 계정 확인
3. **API Keys** 섹션에서:
   - API Key ID 확인
   - Secret Key 확인 (한 번만 표시됨)
4. Vercel 환경 변수에 정확히 입력

## 테스트

### 웹훅 테스트
```bash
curl -X POST "https://your-project.vercel.app/api/webhook/[botId]" \
  -H "Content-Type: application/json" \
  -d '{"action":"buy","ticker":"NVDA","price":145.20}'
```

### Alpaca API 테스트
```bash
curl https://your-project.vercel.app/api/account
```

성공하면:
- 웹훅: 200 응답, Vercel 로그에 요청 기록
- Alpaca: 계정 정보 JSON 반환

