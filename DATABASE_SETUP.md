# 데이터베이스 설정 가이드

## 📊 Vercel 배포를 위한 데이터베이스 설정

프로덕션 환경에서 사용할 수 있는 데이터베이스 옵션과 설정 방법입니다.

## 옵션 1: Vercel Postgres (권장) ⭐

### 장점
- Vercel과 완벽 통합
- 무료 티어 제공 (512MB)
- 자동 백업 및 복구
- 간편한 설정

### 설정 방법

1. **Vercel Dashboard에서 데이터베이스 생성**
   - 프로젝트 페이지 → **Storage** 탭
   - **Create Database** → **Postgres** 선택
   - 데이터베이스 이름 입력
   - **Create** 클릭

2. **환경 변수 자동 설정**
   - Vercel이 자동으로 `DATABASE_URL` 환경 변수를 설정합니다
   - 별도 설정 불필요!

3. **마이그레이션 실행**
   ```bash
   # 로컬에서 실행
   npx prisma migrate deploy
   
   # 또는 Vercel CLI 사용
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### 환경 변수 형식
```
DATABASE_URL=postgres://default:password@host.vercel-storage.com:5432/verceldb
```

## 옵션 2: Supabase (무료 PostgreSQL)

### 장점
- 무료 티어 제공 (500MB)
- 자동 백업
- 실시간 기능 제공
- 쉬운 관리 인터페이스

### 설정 방법

1. **Supabase 프로젝트 생성**
   - [supabase.com](https://supabase.com) 접속
   - **New Project** 클릭
   - 프로젝트 이름, 데이터베이스 비밀번호 입력
   - 리전 선택 (가장 가까운 지역)

2. **연결 정보 확인**
   - 프로젝트 → **Settings** → **Database**
   - **Connection string** → **URI** 복사
   - 형식: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

3. **Vercel 환경 변수 설정**
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
   ⚠️ `[YOUR-PASSWORD]`를 실제 비밀번호로 교체하세요

4. **마이그레이션 실행**
   ```bash
   npx prisma migrate deploy
   ```

### Supabase 연결 문자열 예시
```
postgresql://postgres.xxxxxxxxxxxxx:your_password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

## 옵션 3: PlanetScale (MySQL)

### 장점
- 무료 티어 제공
- 자동 스케일링
- 브랜치 기능 (개발/프로덕션 분리)

### 설정 방법

1. **PlanetScale 데이터베이스 생성**
   - [planetscale.com](https://planetscale.com) 접속
   - **Create database** 클릭
   - 데이터베이스 이름 입력

2. **연결 정보 확인**
   - 데이터베이스 → **Connect** → **Prisma** 선택
   - 연결 문자열 복사

3. **Prisma 스키마 수정 필요**
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

4. **환경 변수 설정**
   ```
   DATABASE_URL=mysql://user:password@host/database?sslaccept=strict
   ```

## 옵션 4: Railway (PostgreSQL)

### 장점
- 무료 티어 제공 ($5 크레딧/월)
- 간단한 설정
- 자동 배포

### 설정 방법

1. **Railway 프로젝트 생성**
   - [railway.app](https://railway.app) 접속
   - **New Project** → **Provision PostgreSQL**

2. **연결 정보 확인**
   - PostgreSQL 서비스 → **Variables** 탭
   - `DATABASE_URL` 복사

3. **Vercel 환경 변수 설정**
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/railway
   ```

## 🔧 마이그레이션 실행

### 프로덕션 마이그레이션

```bash
# 방법 1: 로컬에서 실행 (환경 변수 설정 필요)
npx prisma migrate deploy

# 방법 2: Vercel CLI 사용
vercel env pull .env.local
npx prisma migrate deploy

# 방법 3: Vercel Build Command에 추가
# vercel.json 또는 package.json의 build 스크립트에 추가
"build": "prisma migrate deploy && next build"
```

### Vercel Build Command 설정

`package.json`에 추가:
```json
{
  "scripts": {
    "build": "prisma migrate deploy && next build"
  }
}
```

또는 `vercel.json` 생성:
```json
{
  "buildCommand": "prisma migrate deploy && next build"
}
```

## ✅ 데이터베이스 연결 확인

### Vercel 로그에서 확인

1. Vercel Dashboard → **Deployments** → 최신 배포
2. **Build Logs** 확인
3. Prisma 마이그레이션 성공 메시지 확인

### API로 확인

```bash
# 봇 목록 조회 (데이터베이스 연결 테스트)
curl https://your-project.vercel.app/api/bots
```

## 🔐 보안 주의사항

1. **환경 변수 보호**
   - `DATABASE_URL`은 절대 코드에 하드코딩하지 마세요
   - `.gitignore`에 `.env*` 파일 포함 확인

2. **연결 문자열 보안**
   - 비밀번호가 포함된 연결 문자열은 공유하지 마세요
   - Vercel 환경 변수는 암호화되어 저장됩니다

3. **데이터베이스 접근 제한**
   - IP 화이트리스트 설정 (가능한 경우)
   - SSL 연결 필수

## 📝 체크리스트

- [ ] 데이터베이스 프로바이더 선택
- [ ] 데이터베이스 생성 완료
- [ ] 연결 문자열 확인
- [ ] Vercel 환경 변수 설정 (`DATABASE_URL`)
- [ ] 마이그레이션 실행 (`npx prisma migrate deploy`)
- [ ] 연결 테스트 (API 호출)
- [ ] Vercel 로그 확인

## 🐛 문제 해결

### 마이그레이션 실패

```bash
# Prisma 스키마 확인
npx prisma validate

# 마이그레이션 상태 확인
npx prisma migrate status

# 강제 리셋 (주의: 데이터 삭제됨)
npx prisma migrate reset
```

### 연결 오류

1. **연결 문자열 확인**
   - 비밀번호 특수문자 인코딩 확인
   - SSL 설정 확인

2. **방화벽 확인**
   - Vercel IP가 허용되어 있는지 확인
   - 일부 프로바이더는 IP 화이트리스트 필요

3. **환경 변수 확인**
   ```bash
   # Vercel CLI로 환경 변수 확인
   vercel env ls
   ```

## 📚 참고 자료

- [Prisma 마이그레이션 가이드](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel Postgres 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase 문서](https://supabase.com/docs)
- [PlanetScale 문서](https://planetscale.com/docs)

