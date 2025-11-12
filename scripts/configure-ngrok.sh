#!/bin/bash

# ngrok 인증 토큰 설정 스크립트

echo "🔐 ngrok 인증 토큰 설정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 이미 설정되어 있는지 확인
if ngrok config check 2>&1 | grep -q "valid"; then
    echo "✅ ngrok 인증 토큰이 이미 설정되어 있습니다"
    echo ""
    echo "다음 명령어로 ngrok을 실행하세요:"
    echo "  ngrok http 3000"
    echo ""
    echo "또는 자동 설정 스크립트를 실행하세요:"
    echo "  ./scripts/setup-ngrok.sh"
    exit 0
fi

echo "ngrok을 사용하려면 무료 계정과 인증 토큰이 필요합니다."
echo ""
echo "📋 설정 단계:"
echo ""
echo "1. ngrok 계정 생성 (무료)"
echo "   → https://dashboard.ngrok.com/signup"
echo ""
echo "2. 인증 토큰 받기"
echo "   → https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "3. 아래 명령어로 토큰 설정:"
echo "   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE"
echo ""

# 토큰을 인자로 받은 경우 자동 설정
if [ -n "$1" ]; then
    echo "🔧 인증 토큰 설정 중..."
    ngrok config add-authtoken "$1"
    
    if [ $? -eq 0 ]; then
        echo "✅ 인증 토큰 설정 완료!"
        echo ""
        echo "이제 다음 명령어로 ngrok을 실행할 수 있습니다:"
        echo "  ngrok http 3000"
        echo ""
        echo "또는 자동 설정 스크립트를 실행하세요:"
        echo "  ./scripts/setup-ngrok.sh"
    else
        echo "❌ 인증 토큰 설정 실패"
        exit 1
    fi
else
    echo "💡 빠른 설정:"
    echo "   ./scripts/configure-ngrok.sh YOUR_AUTHTOKEN"
    echo ""
fi

