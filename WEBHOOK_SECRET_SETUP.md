# 웹훅 시크릿 설정 가이드

## 🔐 웹훅 보안 강화

TradingView 웹훅 요청의 진위를 검증하기 위한 시크릿 설정 방법입니다.

## 현재 상태

⚠️ **현재 웹훅 시크릿 검증은 구현되지 않았습니다.**

- 웹훅 엔드포인트는 모든 요청을 받아들입니다
- `WEBHOOK_SECRET` 환경 변수는 정의되어 있지만 사용되지 않습니다
- 보안을 강화하려면 아래 가이드를 따라 구현하세요

## 옵션 1: TradingView Checksum 검증 (권장)

TradingView는 웹훅 요청에 `tv-checksum` 헤더를 포함할 수 있습니다.

### 구현 방법

1. **TradingView에서 시크릿 설정**
   - Alert 설정에서 **"Webhook Secret"** 입력
   - 예: `my-secret-key-12345`

2. **환경 변수 설정**
   ```
   WEBHOOK_SECRET=my-secret-key-12345
   ```

3. **코드에 검증 로직 추가**

`app/api/webhook/[botId]/route.ts`에 추가:

```typescript
import crypto from 'crypto';

// 웹훅 시크릿 검증 함수
function verifyWebhookSecret(
  body: string,
  checksum: string | null,
  secret: string
): boolean {
  if (!checksum || !secret) {
    return false; // 시크릿이 설정되지 않았으면 검증 실패
  }
  
  // TradingView checksum 생성 방식
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return hash === checksum;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> | { botId: string } }
) {
  try {
    // 요청 본문을 문자열로 가져오기
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    
    // 웹훅 시크릿 검증
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const checksum = request.headers.get('tv-checksum');
    
    if (webhookSecret && !verifyWebhookSecret(bodyText, checksum, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook secret' },
        { status: 401, headers: getCorsHeaders() }
      );
    }
    
    // 기존 로직 계속...
    const { action, ticker, price } = body;
    // ...
  } catch (error) {
    // ...
  }
}
```

## 옵션 2: 커스텀 헤더 검증

간단한 API 키 방식으로 검증할 수 있습니다.

### 구현 방법

1. **환경 변수 설정**
   ```
   WEBHOOK_SECRET=your-api-key-here
   ```

2. **코드에 검증 로직 추가**

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> | { botId: string } }
) {
  try {
    // 웹훅 시크릿 검증
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret) {
      if (!providedSecret || providedSecret !== webhookSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401, headers: getCorsHeaders() }
        );
      }
    }
    
    // 기존 로직 계속...
    const body = await request.json();
    // ...
  } catch (error) {
    // ...
  }
}
```

3. **TradingView Alert 설정**
   - Alert Message에 헤더를 직접 추가할 수 없으므로
   - 대신 URL에 쿼리 파라미터로 추가:
   ```
   https://your-project.vercel.app/api/webhook/[botId]?secret=your-api-key-here
   ```

   코드 수정:
   ```typescript
   const providedSecret = request.nextUrl.searchParams.get('secret');
   ```

## 옵션 3: Bot ID 기반 검증 (현재 방식)

현재는 Bot ID를 URL에 포함시켜 검증합니다.

- 장점: 간단하고 구현되어 있음
- 단점: Bot ID가 노출되면 누구나 사용 가능

### 보안 강화 방법

Bot ID를 더 복잡하게 만들거나, 추가 검증을 추가할 수 있습니다:

```typescript
// 봇 생성 시 랜덤 토큰 추가
const bot = await db.bot.create({
  data: {
    // ...
    webhookToken: crypto.randomBytes(32).toString('hex'), // 추가
  },
});

// 웹훅 검증 시 토큰 확인
const token = request.nextUrl.searchParams.get('token');
if (bot.webhookToken !== token) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
```

## 🔧 Vercel 환경 변수 설정

### 방법 1: Vercel Dashboard

1. **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. **Add New** 클릭
3. 다음 입력:
   - **Key**: `WEBHOOK_SECRET`
   - **Value**: `your-secret-key-here` (강력한 랜덤 문자열)
   - **Environment**: `Production`, `Preview`, `Development` 선택
4. **Save** 클릭

### 방법 2: Vercel CLI

```bash
vercel env add WEBHOOK_SECRET production
# 프롬프트에 시크릿 값 입력
```

### 시크릿 생성 방법

```bash
# Node.js로 랜덤 시크릿 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 32
```

## ✅ 보안 체크리스트

- [ ] `WEBHOOK_SECRET` 환경 변수 설정
- [ ] 웹훅 검증 로직 구현
- [ ] TradingView Alert에 시크릿 설정 (옵션 1 사용 시)
- [ ] 테스트: 올바른 시크릿으로 요청 성공 확인
- [ ] 테스트: 잘못된 시크릿으로 요청 거부 확인
- [ ] Vercel 로그에서 401 에러 확인 (잘못된 요청)

## 🐛 문제 해결

### 웹훅이 거부되는 경우

1. **시크릿 확인**
   ```bash
   # Vercel 환경 변수 확인
   vercel env ls
   ```

2. **TradingView 설정 확인**
   - Webhook Secret이 정확히 입력되었는지 확인
   - 대소문자 구분 확인

3. **로그 확인**
   - Vercel Dashboard → Logs에서 에러 메시지 확인
   - 401 Unauthorized 에러가 발생하는지 확인

### 시크릿 없이 테스트하고 싶은 경우

환경 변수를 비워두면 검증이 비활성화됩니다:

```typescript
if (webhookSecret && !verifyWebhookSecret(...)) {
  // 검증 실패
}
// webhookSecret이 없으면 검증 건너뜀
```

## 📚 참고 자료

- [TradingView Webhook Documentation](https://www.tradingview.com/support/solutions/43000529348-webhooks/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js crypto module](https://nodejs.org/api/crypto.html)

## ⚠️ 중요 사항

1. **시크릿 보안**
   - 시크릿은 절대 코드에 하드코딩하지 마세요
   - GitHub에 커밋하지 마세요
   - `.gitignore`에 `.env*` 파일 포함 확인

2. **프로덕션 vs 개발**
   - 개발 환경에서는 시크릿 검증을 비활성화할 수 있습니다
   - 프로덕션에서는 반드시 활성화하세요

3. **시크릿 변경**
   - 시크릿을 변경하면 TradingView Alert 설정도 함께 변경해야 합니다
   - 기존 Alert가 작동하지 않을 수 있습니다

