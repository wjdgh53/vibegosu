'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const POPULAR_TICKERS = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD'];

export default function NewBotPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ticker: '',
    amount: '5000',
    stopLoss: '0.03',
    takeProfit: '0.07',
    sentimentThreshold: '0.25',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBot, setCreatedBot] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: formData.ticker.toUpperCase(),
          amount: parseFloat(formData.amount),
          stopLoss: parseFloat(formData.stopLoss),
          takeProfit: parseFloat(formData.takeProfit),
          sentimentThreshold: parseFloat(formData.sentimentThreshold),
        }),
      });

      if (response.ok) {
        const bot = await response.json();
        setCreatedBot(bot);
      } else {
        const error = await response.json();
        alert(error.error || '봇 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('봇 생성 오류:', error);
      alert('봇 생성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const copyWebhookUrl = () => {
    if (createdBot?.webhookUrl) {
      navigator.clipboard.writeText(createdBot.webhookUrl);
      alert('Webhook URL이 클립보드에 복사되었습니다!');
    }
  };

  if (createdBot) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              봇 생성 완료!
            </h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  TradingView Webhook URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createdBot.webhookUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    복사
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  이 URL을 TradingView 알림 설정에 붙여넣으세요
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  TradingView Webhook 포맷 예시
                </h3>
                <pre className="text-sm bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
{`{
  "action": "buy",
  "ticker": "{{ticker}}",
  "price": "{{close}}"
}`}
                </pre>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  💡 사용 팁
                </h3>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• <strong>로컬 개발:</strong> ngrok 사용 시 <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_BASE_URL</code> 환경 변수에 ngrok URL 설정</li>
                  <li>• <strong>프로덕션:</strong> Vercel 배포 시 자동으로 프로덕션 URL로 업데이트됨</li>
                  <li>• <strong>웹훅 테스트:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">GET /api/webhook/[botId]/test</code> 엔드포인트로 테스트 가능</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  대시보드로 이동
                </button>
                <button
                  onClick={() => {
                    setCreatedBot(null);
                    setFormData({
                      ticker: '',
                      amount: '5000',
                      stopLoss: '0.03',
                      takeProfit: '0.07',
                      sentimentThreshold: '0.25',
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  새 봇 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← 대시보드로 돌아가기
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            새 봇 만들기
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 종목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                종목
              </label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
                placeholder="NVDA, TSLA 등"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {POPULAR_TICKERS.map((ticker) => (
                  <button
                    key={ticker}
                    type="button"
                    onClick={() => handleChange('ticker', ticker)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>

            {/* 투자금 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                투자금 (USD)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                min="1"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* 손절 / 익절 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  손절
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.stopLoss}
                    onChange={(e) => handleChange('stopLoss', e.target.value)}
                    min="0"
                    max="1"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    ({(parseFloat(formData.stopLoss) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  익절
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.takeProfit}
                    onChange={(e) => handleChange('takeProfit', e.target.value)}
                    min="0"
                    max="1"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    ({(parseFloat(formData.takeProfit) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* 뉴스 센티먼트 최소값 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                뉴스 센티먼트 최소값
              </label>
              <input
                type="number"
                value={formData.sentimentThreshold}
                onChange={(e) => handleChange('sentimentThreshold', e.target.value)}
                min="-1"
                max="1"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  📊 센티먼트 점수 가이드라인
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>✅ <strong>0.25 ~ 0.35</strong>: 적정 긍정 (스위트 스팟, 기본값)</li>
                  <li>✅ <strong>0.35 ~ 0.50</strong>: 강한 긍정 (비중 확대)</li>
                  <li>⚠️ <strong>0.50 ~ 0.65</strong>: 매우 긍정적 (과열 주의, 비중 축소)</li>
                  <li>🚫 <strong>0.70 이상</strong>: 과도한 낙관 (매수 금지, 고점 가능성)</li>
                  <li>🚫 <strong>-0.15 이하</strong>: 부정적 (매수 금지)</li>
                </ul>
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                  💡 실제 매매는 <strong>0.25 ~ 0.65</strong> 범위에서만 실행되며, 뉴스 최소 5개 필요
                </p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? '생성 중...' : '봇 생성'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

