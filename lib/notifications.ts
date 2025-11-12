import { Notification } from '@/types';

const NOTIFICATIONS_STORAGE_KEY = 'trading_notifications';
const MAX_NOTIFICATIONS = 100;

/**
 * 알림 저장
 */
export function saveNotification(notification: Notification): void {
  if (typeof window !== 'undefined') {
    const notifications = loadNotifications();
    notifications.unshift(notification);
    
    // 최대 개수 제한
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications.splice(MAX_NOTIFICATIONS);
    }
    
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }
}

/**
 * 알림 불러오기
 */
export function loadNotifications(): Notification[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      try {
        const notifications = JSON.parse(stored) as Notification[];
        // timestamp를 Date 객체로 변환
        return notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      } catch (error) {
        console.error('알림 파싱 오류:', error);
        return [];
      }
    }
  }
  return [];
}

/**
 * 알림 삭제
 */
export function deleteNotification(id: string): void {
  if (typeof window !== 'undefined') {
    const notifications = loadNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
  }
}

/**
 * 모든 알림 삭제
 */
export function clearNotifications(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  }
}

