# Alpaca API 401 에러 해결 가이드

## 현재 상황
- ✅ 환경 변수는 모두 설정되어 있음
- ✅ API 키 형식은 정상 (19자, 40자)
- ❌ 모든 API 호출이 401 "unauthorized" 에러 발생

## 원인
API 키가 만료되었거나 비활성화되었을 가능성이 높습니다.

## 해결 방법

### 1단계: Alpaca Dashboard에서 API 키 확인 및 재생성

1. **Alpaca Dashboard 접속**
   - https://app.alpaca.markets
   - Paper Trading 계정으로 로그인

2. **API Keys 섹션 확인**
   - 좌측 메뉴에서 **"API Keys"** 클릭
   - 현재 활성화된 키 확인

3. **새 API 키 생성 (권장)**
   - **"Generate New Key"** 클릭
   - 키 이름 입력 (예: "Vibegosu Production")
   - **Paper Trading** 선택 확인 (Live Trading 아님!)
   - 생성된 키 복사:
     - **API Key ID** (예: `KK5UNQV7...QHQS`)
     - **Secret Key** (예: `fMI2...wCyn`)

### 2단계: Vercel 환경 변수 업데이트

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables**

3. **기존 키 업데이트**
   - `ALPACA_API_KEY` → 새로 생성한 API Key ID로 변경
   - `ALPACA_SECRET_KEY` → 새로 생성한 Secret Key로 변경
   - `ALPACA_BASE_URL` → `https://paper-api.alpaca.markets` (변경 없음)

4. **저장 후 재배포**
   - 환경 변수 저장
   - 자동 재배포 대기 또는 수동 **Redeploy**

### 3단계: 테스트

재배포 완료 후:

```bash
# 환경 변수 확인
curl https://vibegosu.vercel.app/api/debug/env

# Alpaca API 테스트
curl https://vibegosu.vercel.app/api/debug/alpaca-test

# 계정 정보 조회
curl https://vibegosu.vercel.app/api/account
```

## 체크리스트

- [ ] Alpaca Dashboard에서 Paper Trading 계정 확인
- [ ] 새 API 키 생성 (Paper Trading 선택)
- [ ] API Key ID 복사
- [ ] Secret Key 복사
- [ ] Vercel 환경 변수 업데이트
- [ ] 환경 변수 저장
- [ ] 재배포 완료
- [ ] `/api/debug/alpaca-test` 테스트 성공
- [ ] `/api/account` 테스트 성공

## 주의사항

⚠️ **Paper Trading 키인지 확인**
- Live Trading 키를 사용하면 401 에러 발생
- 반드시 **Paper Trading** 계정의 키 사용

⚠️ **Secret Key는 한 번만 표시됨**
- 생성 후 즉시 복사
- 잃어버리면 재생성 필요

## 문제가 계속되면

1. Alpaca Dashboard에서 키가 활성화되어 있는지 확인
2. Paper Trading 계정이 활성화되어 있는지 확인
3. Alpaca 지원팀에 문의: https://alpaca.markets/support

