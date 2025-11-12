#!/bin/bash

# ngrok 설정 스크립트

echo "🚀 ngrok 설정 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ngrok이 실행 중인지 확인
if curl -s http://127.0.0.1:4040/api/tunnels > /dev/null 2>&1; then
    echo "✅ ngrok이 이미 실행 중입니다"
else
    echo "📡 ngrok 시작 중..."
    # ngrok을 백그라운드로 실행
    ngrok http 3000 > /tmp/ngrok.log 2>&1 &
    NGROK_PID=$!
    echo "   PID: $NGROK_PID"
    
    # ngrok이 시작될 때까지 대기
    echo "⏳ ngrok 시작 대기 중..."
    for i in {1..30}; do
        if curl -s http://127.0.0.1:4040/api/tunnels > /dev/null 2>&1; then
            echo "✅ ngrok 시작 완료"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
fi

# ngrok URL 가져오기
echo "🔍 ngrok URL 감지 중..."
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    if tunnels:
        https_tunnel = next((t for t in tunnels if t.get('proto') == 'https'), None)
        tunnel = https_tunnel or tunnels[0]
        if tunnel:
            print(tunnel['public_url'])
except:
    pass
" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "❌ ngrok URL을 가져올 수 없습니다"
    echo "💡 수동으로 ngrok을 실행하세요: ngrok http 3000"
    echo "💡 그 다음 ngrok 웹 인터페이스(http://127.0.0.1:4040)에서 URL을 확인하세요"
    exit 1
fi

echo "✅ ngrok URL: $NGROK_URL"
echo ""

# .env.local 파일 업데이트
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env.local 파일이 없습니다. 생성합니다..."
    touch "$ENV_FILE"
fi

# NEXT_PUBLIC_BASE_URL 업데이트
if grep -q "NEXT_PUBLIC_BASE_URL=" "$ENV_FILE"; then
    # 기존 값 교체
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$NGROK_URL|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$NGROK_URL|" "$ENV_FILE"
    fi
    echo "📝 .env.local 파일 업데이트 완료"
else
    # 새로 추가
    echo "" >> "$ENV_FILE"
    echo "# Base URL (ngrok)" >> "$ENV_FILE"
    echo "NEXT_PUBLIC_BASE_URL=$NGROK_URL" >> "$ENV_FILE"
    echo "📝 .env.local 파일에 추가 완료"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 설정 완료!"
echo ""
echo "📋 설정된 값:"
echo "   NEXT_PUBLIC_BASE_URL=$NGROK_URL"
echo ""
echo "💡 다음 단계:"
echo "   1. 개발 서버가 실행 중인지 확인하세요"
echo "   2. 브라우저에서 http://localhost:3000 접속"
echo "   3. 봇의 웹훅 URL이 자동으로 ngrok URL로 설정됩니다"
echo ""
echo "🔗 웹훅 URL 예시:"
echo "   $NGROK_URL/api/webhook/[botId]"
echo ""

