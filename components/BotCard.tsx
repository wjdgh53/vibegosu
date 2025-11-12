'use client';

import { useState, useEffect } from 'react';

interface BotCardProps {
  bot: {
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
  };
  currentPrice?: number;
  sentimentScore?: number;
  onClose?: (botId: string) => void;
}

export default function BotCard({ bot, currentPrice, sentimentScore, onClose }: BotCardProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  
  // 웹훅 URL 생성 (클라이언트 사이드)
  const getWebhookUrl = async () => {
    // 저장된 webhookUrl이 있고 localhost가 아니면 사용
    if (bot.webhookUrl && !bot.webhookUrl.includes('localhost')) {
      return bot.webhookUrl;
    }
    
    // API에서 최신 URL 가져오기
    try {
      const response = await fetch(`/api/webhook/${bot.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.webhookUrl) {
          return data.webhookUrl;
        }
      }
    } catch (error) {
      console.error('웹훅 URL 조회 실패:', error);
    }
    
    // 폴백: 현재 origin 사용
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    return `${baseUrl}/api/webhook/${bot.id}`;
  };
  
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  
  // 컴포넌트 마운트 시 웹훅 URL 가져오기
  useEffect(() => {
    getWebhookUrl().then(url => setWebhookUrl(url));
  }, [bot.id]);
  
  const handleCopyWebhook = async () => {
    const urlToCopy = webhookUrl || await getWebhookUrl();
    navigator.clipboard.writeText(urlToCopy);
    alert('웹훅 URL이 클립보드에 복사되었습니다!');
  };
  
  const position = bot.positions?.[0];
  const hasPosition = position && (position as any).status !== 'closed';
  
  const handleClose = async () => {
    if (!confirm('정말 이 포지션을 청산하시겠습니까?')) return;
    
    setIsClosing(true);
    try {
      const response = await fetch(`/api/webhook/${bot.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sell',
          ticker: bot.ticker,
        }),
      });
      
      if (response.ok) {
        if (onClose) onClose(bot.id);
      }
    } catch (error) {
      console.error('청산 실패:', error);
      alert('청산에 실패했습니다');
    } finally {
      setIsClosing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 봇을 삭제하시겠습니까? 모든 포지션과 거래 내역이 함께 삭제됩니다.')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bots/${bot.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        if (onClose) onClose(bot.id);
      } else {
        const error = await response.json();
        alert(error.error || '봇 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('봇 삭제 실패:', error);
      alert('봇 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  // 마지막 웹훅 신호 정보
  const lastTrade = bot.trades?.[0];
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  const getStatusBadge = (status: string, reason: string | null) => {
    if (status === 'completed') {
      return <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">✅ 성공</span>;
    }
    if (status === 'rejected') {
      return <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">❌ 거부</span>;
    }
    return <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">⏳ 처리중</span>;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  if (hasPosition && currentPrice) {
    const profit = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
    const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {bot.ticker} Bot
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              현재: ${currentPrice.toFixed(2)} ({profit >= 0 ? '+' : ''}{profit.toFixed(1)}%)
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
            title="봇 삭제"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            진입: ${position.entryPrice.toFixed(2)} ({formatDate(position.entryTime)})
          </p>
          
          {/* 웹훅 URL */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowWebhook(!showWebhook)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showWebhook ? '▼' : '▶'} 웹훅 URL {showWebhook ? '숨기기' : '보기'}
            </button>
            {showWebhook && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={webhookUrl || '로딩 중...'}
                    readOnly
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopyWebhook}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="복사"
                  >
                    복사
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  TradingView Alert에 이 URL을 사용하세요
                </p>
              </div>
            )}
          </div>
          
          {/* 마지막 웹훅 신호 정보 */}
          {lastTrade && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                마지막 신호
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDateTime(lastTrade.timestamp)}
                  </span>
                  {getStatusBadge(lastTrade.status, lastTrade.rejectionReason)}
                </div>
                {lastTrade.status === 'rejected' && lastTrade.rejectionReason && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {lastTrade.rejectionReason}
                  </p>
                )}
                {lastTrade.sentimentScore !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    센티먼트: {lastTrade.sentimentScore.toFixed(3)}
                  </p>
                )}
                {lastTrade.status === 'completed' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    진입가: ${lastTrade.entryPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            disabled={isClosing}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isClosing ? '청산 중...' : '청산하기'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {bot.ticker} Bot
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            대기 중... 신호 없음
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          title="봇 삭제"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentPrice 
            ? `현재가: $${currentPrice.toFixed(2)}`
            : '가격 조회 중...'}
        </p>
        
        {/* 웹훅 URL */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowWebhook(!showWebhook)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showWebhook ? '▼' : '▶'} 웹훅 URL {showWebhook ? '숨기기' : '보기'}
          </button>
          {showWebhook && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookUrl || '로딩 중...'}
                  readOnly
                  className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  title="복사"
                >
                  복사
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                TradingView Alert에 이 URL을 사용하세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 마지막 웹훅 신호 정보 */}
      {lastTrade && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            마지막 신호
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatDateTime(lastTrade.timestamp)}
              </span>
              {getStatusBadge(lastTrade.status, lastTrade.rejectionReason)}
            </div>
            {lastTrade.status === 'rejected' && lastTrade.rejectionReason && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {lastTrade.rejectionReason}
              </p>
            )}
            {lastTrade.sentimentScore !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                센티먼트: {lastTrade.sentimentScore.toFixed(3)}
              </p>
            )}
            {lastTrade.status === 'completed' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                진입가: ${lastTrade.entryPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

