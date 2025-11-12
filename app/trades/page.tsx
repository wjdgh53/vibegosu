'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Trade {
  id: string;
  ticker: string;
  entryPrice: number;
  exitPrice: number | null;
  profit: number | null;
  sentimentScore: number | null;
  newsTitles: string | string[]; // JSON 문자열 또는 배열
  status: string;
  rejectionReason: string | null;
  timestamp: string;
}

interface TradeStats {
  totalTrades: number;
  winRate: string;
  avgProfit: string;
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    winRate: '0',
    avgProfit: '0',
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trades');
      const data = await response.json();
      setTrades(data.trades || []);
      setStats(data.stats || { totalTrades: 0, winRate: '0', avgProfit: '0' });
    } catch (error) {
      console.error('거래 내역 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatProfit = (profit: number | null) => {
    if (profit === null) return '-';
    const percent = profit * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getProfitColor = (profit: number | null) => {
    if (profit === null) return 'text-gray-500';
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← 대시보드로 돌아가기
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          거래 내역
        </h1>

        {/* 통계 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">총 거래</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTrades}회
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">승률</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.winRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">평균 수익</p>
              <p className={`text-2xl font-bold ${parseFloat(stats.avgProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(stats.avgProfit) >= 0 ? '+' : ''}{stats.avgProfit}%
              </p>
            </div>
          </div>
        </div>

        {/* 거래 테이블 */}
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            로딩 중...
          </div>
        ) : trades.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">거래 내역이 없습니다</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      종목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      진입가
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      청산가
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      수익
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      뉴스점수
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {trades.map((trade) => (
                    <tr
                      key={trade.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(trade.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {trade.ticker}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : trade.status === 'rejected' ? '거부됨' : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getProfitColor(trade.profit)}`}>
                        {formatProfit(trade.profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trade.sentimentScore !== null ? trade.sentimentScore.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 상세 모달 */}
        {selectedTrade && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTrade(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    거래 상세
                  </h2>
                  <button
                    onClick={() => setSelectedTrade(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">종목</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedTrade.ticker}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">진입가</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        ${selectedTrade.entryPrice.toFixed(2)}
                      </p>
                    </div>
                    {selectedTrade.exitPrice && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">청산가</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          ${selectedTrade.exitPrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedTrade.sentimentScore !== null && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">센티먼트 점수</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedTrade.sentimentScore.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const titles = typeof selectedTrade.newsTitles === 'string' 
                      ? JSON.parse(selectedTrade.newsTitles || '[]')
                      : selectedTrade.newsTitles;
                    return titles && titles.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          진입 당시 뉴스 제목
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {titles.map((title: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                              {title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}

                  {selectedTrade.rejectionReason && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">거부 사유</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {selectedTrade.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

