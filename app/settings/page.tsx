'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [alpacaApiKey, setAlpacaApiKey] = useState('');
  const [alpacaSecretKey, setAlpacaSecretKey] = useState('');
  const [alphaVantageApiKey, setAlphaVantageApiKey] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const testConnection = async (service: string) => {
    setTesting((prev) => ({ ...prev, [service]: true }));
    setTestResults((prev) => ({ ...prev, [service]: '' }));

    try {
      let response;
      if (service === 'alpaca') {
        response = await fetch('/api/account');
      } else if (service === 'alphavantage') {
        // Alpha Vantage 테스트는 간단히 API 호출
        response = await fetch('/api/test/alphavantage');
      } else {
        return;
      }

      if (response.ok) {
        setTestResults((prev) => ({ ...prev, [service]: '연결 성공!' }));
      } else {
        setTestResults((prev) => ({ ...prev, [service]: '연결 실패' }));
      }
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [service]: '연결 오류' }));
    } finally {
      setTesting((prev) => ({ ...prev, [service]: false }));
    }
  };

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
            설정
          </h1>

          <div className="space-y-8">
            {/* Alpaca API */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Alpaca API
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={alpacaApiKey}
                    onChange={(e) => setAlpacaApiKey(e.target.value)}
                    placeholder="API Key 입력"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={alpacaSecretKey}
                    onChange={(e) => setAlpacaSecretKey(e.target.value)}
                    placeholder="Secret Key 입력"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => testConnection('alpaca')}
                  disabled={testing.alpaca}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {testing.alpaca ? '테스트 중...' : '연결 테스트'}
                </button>
                {testResults.alpaca && (
                  <p className={`text-sm ${testResults.alpaca.includes('성공') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.alpaca}
                  </p>
                )}
              </div>
            </div>

            {/* Alpha Vantage API */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Alpha Vantage API
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={alphaVantageApiKey}
                    onChange={(e) => setAlphaVantageApiKey(e.target.value)}
                    placeholder="API Key 입력"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  플랜: Premium ($50/월)
                </div>
                <button
                  onClick={() => testConnection('alphavantage')}
                  disabled={testing.alphavantage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {testing.alphavantage ? '테스트 중...' : '연결 테스트'}
                </button>
                {testResults.alphavantage && (
                  <p className={`text-sm ${testResults.alphavantage.includes('성공') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.alphavantage}
                  </p>
                )}
              </div>
            </div>

            {/* Telegram 알림 (선택) */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Telegram 알림 (선택)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bot Token
                  </label>
                  <input
                    type="password"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="Bot Token 입력"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chat ID
                  </label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Chat ID 입력"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ⚠️ API 키는 환경 변수(.env.local)에서 관리하는 것을 권장합니다.
                이 페이지는 테스트 목적으로만 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
