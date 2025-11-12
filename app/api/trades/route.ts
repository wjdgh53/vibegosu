import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 거래 내역 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const ticker = searchParams.get('ticker');
    
    const where: any = {};
    if (botId) where.botId = botId;
    if (ticker) where.ticker = ticker.toUpperCase();
    
    const trades = await db.trade.findMany({
      where,
      include: {
        bot: {
          select: {
            ticker: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    
    // newsTitles를 배열로 변환
    const tradesWithParsedNews = trades.map(trade => ({
      ...trade,
      newsTitles: typeof trade.newsTitles === 'string' 
        ? JSON.parse(trade.newsTitles || '[]')
        : trade.newsTitles,
    }));
    
    // 통계 계산
    const completedTrades = tradesWithParsedNews.filter(t => t.status === 'completed' && t.profit !== null);
    const totalTrades = completedTrades.length;
    const winningTrades = completedTrades.filter(t => (t.profit || 0) > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgProfit = totalTrades > 0
      ? completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / totalTrades * 100
      : 0;
    
    return NextResponse.json({
      trades: tradesWithParsedNews,
      stats: {
        totalTrades,
        winRate: winRate.toFixed(1),
        avgProfit: avgProfit.toFixed(1),
      },
    });
  } catch (error: any) {
    console.error('거래 내역 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '거래 내역 조회 실패' },
      { status: 500 }
    );
  }
}

