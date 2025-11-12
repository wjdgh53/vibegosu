'use client';

import { Notification } from '@/types';

interface NotificationCardProps {
  notification: Notification;
  onDelete?: (id: string) => void;
}

export default function NotificationCard({ notification, onDelete }: NotificationCardProps) {
  const getTypeColor = () => {
    switch (notification.type) {
      case 'buy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'sell':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      case 'reject':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeColor()}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{notification.symbol}</span>
            <span className="text-xs opacity-75">
              {formatTime(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm">{notification.message}</p>
          {notification.sentimentScore !== undefined && (
            <p className="text-xs mt-1 opacity-75">
              센티먼트: {notification.sentimentScore.toFixed(2)}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(notification.id)}
            className="ml-2 text-xs opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

