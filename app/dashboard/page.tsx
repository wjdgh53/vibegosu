'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import BotCard from '@/components/BotCard';

interface Bot {
  id: string;
  ticker: string;
  amount: number;
  stopLoss: number;
  takeProfit: number;
  sentimentThreshold: number;
  webhookUrl?: string;
  positions?: Array<{
    entryPrice: number;
    quantity: number;
    entryTime: string;
    status: string;
  }>;
  trades?: Array<{
    id: string;
    ticker: string;
    entryPrice: number;
    sentimentScore: number | null;
    status: string;
    rejectionReason: string | null;
    timestamp: string;
  }>;
}

interface Notification {
  id: string;
  type: string;
  ticker: string;
  message: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sentimentScores, setSentimentScores] = useState<Record<string, number>>({});
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 봇 목록 조회
      const botsRes = await fetch('/api/bots');
      const botsData = await botsRes.json();
      setBots(botsData);
      
      // 계정 정보 조회
      try {
        const accountData = await fetch('/api/account').then(res => res.json());
        setAccount(accountData);
      } catch (error) {
        console.error('계정 정보 조회 실패:', error);
      }
      
      // 알림 조회
      try {
        const notifsRes = await fetch('/api/notifications');
        const notifsData = await notifsRes.json();
        setNotifications(notifsData.slice(0, 10)); // 최근 10개만
      } catch (error) {
        console.error('알림 조회 실패:', error);
      }
      
      // 각 봇의 현재 가격 및 센티먼트 조회 (API를 통해)
      const prices: Record<string, number> = {};
      const sentiments: Record<string, number> = {};
      
      // 각 봇에 대해 병렬로 가격 및 센티먼트 조회
      const pricePromises = botsData.map(async (bot: Bot) => {
        try {
          // 현재 가격 조회
          const priceRes = await fetch(`/api/price/${bot.ticker}`);
          if (priceRes.ok) {
            const priceData = await priceRes.json();
            if (priceData.price && !isNaN(priceData.price)) {
              prices[bot.ticker] = priceData.price;
            }
          } else {
            console.warn(`${bot.ticker} 가격 조회 실패:`, await priceRes.text());
          }
          
          // 센티먼트 조회
          const sentimentRes = await fetch(`/api/sentiment/${bot.ticker}`);
          if (sentimentRes.ok) {
            const sentimentData = await sentimentRes.json();
            if (sentimentData.score !== undefined) {
              sentiments[bot.ticker] = sentimentData.score;
            }
          }
        } catch (error) {
          console.error(`${bot.ticker} 데이터 조회 오류:`, error);
        }
      });
      
      await Promise.all(pricePromises);
      
      setCurrentPrices(prices);
      setSentimentScores(sentiments);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return '✅';
      case 'sell':
        return '💰';
      case 'reject':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const totalValue = account
    ? parseFloat(account.portfolio_value || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              MoneyGoku
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadData()}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="새로고침"
              >
                {loading ? '🔄' : '↻'} 새로고침
              </button>
              <Link
                href="/trades"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                거래 내역
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                설정
              </Link>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">총 자산</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 활성 봇 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              활성 봇 ({bots.length})
            </h2>
            <Link
              href="/bots/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 새 봇 만들기
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              로딩 중...
            </div>
          ) : bots.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                활성 봇이 없습니다
              </p>
              <Link
                href="/bots/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 새 봇 만들기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  currentPrice={currentPrices[bot.ticker]}
                  sentimentScore={sentimentScores[bot.ticker]}
                  onClose={() => loadData()}
                />
              ))}
            </div>
          )}
        </div>

        {/* 최근 알림 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            최근 알림
          </h2>
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">알림이 없습니다</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatTime(notif.timestamp)}
                      </span>{' '}
                      <span>{notif.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

