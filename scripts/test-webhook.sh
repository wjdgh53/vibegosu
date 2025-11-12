#!/bin/bash

# 웹훅 테스트 스크립트
# 사용법: ./scripts/test-webhook.sh [botId] [action] [ticker] [price]

BOT_ID=${1:-""}
ACTION=${2:-"buy"}
TICKER=${3:-"NVDA"}
PRICE=${4:-"100.0"}

BASE_URL="http://localhost:3000"

echo "🧪 웹훅 테스트 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 봇 ID가 없으면 봇 목록 조회
if [ -z "$BOT_ID" ]; then
  echo "📋 봇 목록 조회 중..."
  BOTS=$(curl -s "${BASE_URL}/api/bots")
  
  if [ $? -ne 0 ]; then
    echo "❌ 서버에 연결할 수 없습니다. 개발 서버가 실행 중인지 확인하세요."
    echo "   실행: npm run dev"
    exit 1
  fi
  
  BOT_COUNT=$(echo "$BOTS" | grep -o '"id"' | wc -l | tr -d ' ')
  
  if [ "$BOT_COUNT" -eq 0 ]; then
    echo "❌ 봇이 없습니다. 먼저 봇을 생성하세요."
    echo "   브라우저에서 http://localhost:3000/bots/new 접속"
    exit 1
  fi
  
  echo "✅ 봇 ${BOT_COUNT}개 발견"
  echo ""
  echo "사용 가능한 봇:"
  echo "$BOTS" | grep -o '"id":"[^"]*"' | sed 's/"id":"\([^"]*\)"/  - \1/' | head -5
  echo ""
  echo "사용법: ./scripts/test-webhook.sh [botId] [action] [ticker] [price]"
  echo "예시: ./scripts/test-webhook.sh clxxx123 buy NVDA 145.20"
  exit 0
fi

# 웹훅 URL 확인
echo "🔍 봇 정보 확인 중..."
WEBHOOK_INFO=$(curl -s "${BASE_URL}/api/webhook/${BOT_ID}/test")

if echo "$WEBHOOK_INFO" | grep -q "error"; then
  echo "❌ 봇을 찾을 수 없습니다: $BOT_ID"
  exit 1
fi

WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | grep -o '"webhookUrl":"[^"]*"' | sed 's/"webhookUrl":"\([^"]*\)"/\1/')
TICKER_FROM_BOT=$(echo "$WEBHOOK_INFO" | grep -o '"ticker":"[^"]*"' | sed 's/"ticker":"\([^"]*\)"/\1/')

echo "✅ 봇 정보:"
echo "   봇 ID: $BOT_ID"
echo "   종목: $TICKER_FROM_BOT"
echo "   웹훅 URL: $WEBHOOK_URL"
echo ""

# 테스트 요청 생성
PAYLOAD=$(cat <<EOF
{
  "action": "${ACTION}",
  "ticker": "${TICKER}",
  "price": ${PRICE}
}
EOF
)

echo "📤 웹훅 요청 전송 중..."
echo "   Action: $ACTION"
echo "   Ticker: $TICKER"
echo "   Price: $PRICE"
echo ""

# 실제 웹훅 엔드포인트로 요청
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/webhook/${BOT_ID}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 응답 (HTTP $HTTP_CODE):"
echo ""

# JSON 포맷팅 (jq가 있으면 사용)
if command -v jq &> /dev/null; then
  echo "$BODY" | jq .
else
  echo "$BODY"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ 웹훅 테스트 성공!"
  
  # 센티먼트 점수 확인
  if echo "$BODY" | grep -q "sentimentScore"; then
    SENTIMENT=$(echo "$BODY" | grep -o '"sentimentScore":[0-9.]*' | cut -d: -f2)
    echo "   센티먼트 점수: $SENTIMENT"
  fi
  
  # 거부 사유 확인
  if echo "$BODY" | grep -q "rejected"; then
    REASON=$(echo "$BODY" | grep -o '"reason":"[^"]*"' | sed 's/"reason":"\([^"]*\)"/\1/')
    echo "   ⚠️  거부 사유: $REASON"
  fi
else
  echo "❌ 웹훅 테스트 실패 (HTTP $HTTP_CODE)"
fi

echo ""

