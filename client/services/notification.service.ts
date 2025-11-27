import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unreadCount: number;
}

class NotificationService {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(options?: { limit?: number; skip?: number; unreadOnly?: boolean }): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<NotificationResponse>(`${API_ENDPOINTS.notifications.getAll}${queryString}`);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; data: Notification }> {
    return apiClient.put<{ success: boolean; data: Notification }>(API_ENDPOINTS.notifications.markAsRead(notificationId), {});
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string; modifiedCount: number }> {
    return apiClient.put<{ success: boolean; message: string; modifiedCount: number }>(API_ENDPOINTS.notifications.markAllAsRead, {});
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(API_ENDPOINTS.notifications.delete(notificationId));
  }
}

export const notificationService = new NotificationService();

