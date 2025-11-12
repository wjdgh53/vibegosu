# ngrok 설정 가이드

## 1단계: ngrok 계정 생성

1. 브라우저에서 https://dashboard.ngrok.com/signup 접속
2. 이메일로 가입 (무료)
3. 가입 완료 후 대시보드 접속

## 2단계: Authtoken 가져오기

1. ngrok 대시보드 (https://dashboard.ngrok.com) 접속
2. 좌측 메뉴에서 **"Your Authtoken"** 클릭
3. Authtoken 복사

## 3단계: Authtoken 설정

터미널에서 다음 명령어 실행:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

예시:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pqr678stu901vwx234
```

## 4단계: 확인

```bash
ngrok http 3000
```

이제 정상적으로 실행됩니다!

## 참고

- Authtoken은 한 번만 설정하면 됩니다
- 무료 계정으로도 충분히 사용 가능합니다
- Authtoken은 개인정보이므로 공유하지 마세요

