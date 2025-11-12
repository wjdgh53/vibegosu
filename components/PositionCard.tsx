'use client';

import { Position } from '@/types';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const profitColor = position.unrealizedPl >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {position.symbol}
        </h3>
        <span className={`text-lg font-semibold ${profitColor}`}>
          {position.unrealizedPl >= 0 ? '+' : ''}
          {position.unrealizedPl.toFixed(2)} ({position.unrealizedPlpc >= 0 ? '+' : ''}
          {(position.unrealizedPlpc * 100).toFixed(2)}%)
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">보유 수량</p>
          <p className="text-gray-900 dark:text-white font-medium">{position.qty}주</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">평균 매수가</p>
          <p className="text-gray-900 dark:text-white font-medium">
            ${position.avgEntryPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">현재 가격</p>
          <p className="text-gray-900 dark:text-white font-medium">
            ${position.currentPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">평가 금액</p>
          <p className="text-gray-900 dark:text-white font-medium">
            ${position.marketValue.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

