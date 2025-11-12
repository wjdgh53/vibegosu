import { Notification } from '@/types';
import fs from 'fs';
import path from 'path';

const NOTIFICATIONS_FILE_PATH = path.join(process.cwd(), 'notifications.json');
const MAX_NOTIFICATIONS = 100;

/**
 * 서버 사이드 알림 저장
 */
export function saveNotificationServer(notification: Notification): void {
  try {
    let notifications: Notification[] = [];
    
    if (fs.existsSync(NOTIFICATIONS_FILE_PATH)) {
      const content = fs.readFileSync(NOTIFICATIONS_FILE_PATH, 'utf-8');
      notifications = JSON.parse(content);
    }
    
    notifications.unshift(notification);
    
    // 최대 개수 제한
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications = notifications.slice(0, MAX_NOTIFICATIONS);
    }
    
    fs.writeFileSync(
      NOTIFICATIONS_FILE_PATH,
      JSON.stringify(notifications, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('알림 저장 오류:', error);
  }
}

/**
 * 서버 사이드 알림 불러오기
 */
export function loadNotificationsServer(): Notification[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE_PATH)) {
      const content = fs.readFileSync(NOTIFICATIONS_FILE_PATH, 'utf-8');
      const notifications = JSON.parse(content) as Notification[];
      return notifications.map(n => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    }
  } catch (error) {
    console.error('알림 불러오기 오류:', error);
  }
  return [];
}

