/**
 * Service for notification-related operations.
 * Handles both push notifications and scheduled local notifications.
 */

import {
  COLLECTIONS,
  addDocument,
  queryDocuments,
  updateDocument,
  deleteDocument,
  processDocumentData,
  QueryParams,
} from '@/Firebase/firestoreHelper';

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  type: 'local' | 'alert' | 'post' | 'system';
  title: string;
  content: string;
  relatedPostId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  scheduledFor?: Date;
  createdAt: Date;
  isRead: boolean;
  category?: string;
}

// Create a new notification
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<string | null> => {
  try {
    const notificationData = {
      ...notification,
      createdAt: new Date(),
      isRead: false,
    };

    return await addDocument(COLLECTIONS.NOTIFICATIONS, notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Get all notifications for a user
export const getUserNotifications = async (
  userId: string
): Promise<Notification[]> => {
  try {
    const whereConditions: QueryParams[] = [
      { fieldPath: 'userId', operator: '==', value: userId },
    ];

    const results = await queryDocuments(
      COLLECTIONS.NOTIFICATIONS,
      whereConditions,
      'createdAt',
      'desc'
    );

    return results.map((doc) => {
      const processedData = processDocumentData(doc);

      return {
        id: doc.id,
        userId: processedData.userId,
        type: processedData.type,
        title: processedData.title,
        content: processedData.content,
        relatedPostId: processedData.relatedPostId,
        location: processedData.location,
        scheduledFor: processedData.scheduledFor,
        createdAt: processedData.createdAt,
        isRead: processedData.isRead || false,
        category: processedData.category,
      };
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

// Get unread notifications count for a user
export const getUnreadNotificationsCount = async (
  userId: string
): Promise<number> => {
  try {
    const whereConditions: QueryParams[] = [
      { fieldPath: 'userId', operator: '==', value: userId },
      { fieldPath: 'isRead', operator: '==', value: false },
    ];

    const results = await queryDocuments(
      COLLECTIONS.NOTIFICATIONS,
      whereConditions
    );

    return results.length;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<boolean> => {
  try {
    return await updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<boolean> => {
  try {
    const notifications = await getUserNotifications(userId);

    const updatePromises = notifications
      .filter((notification) => !notification.isRead)
      .map((notification) =>
        updateDocument(COLLECTIONS.NOTIFICATIONS, notification.id, {
          isRead: true,
        })
      );

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);

    // Return true if all updates were successful
    return results.every((result) => result === true);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Delete a notification
export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    return await deleteDocument(COLLECTIONS.NOTIFICATIONS, notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

// Create a scheduled notification
export const scheduleNotification = async (
  userId: string,
  title: string,
  content: string,
  scheduledFor: Date,
  category?: string,
  location?: { latitude: number; longitude: number }
): Promise<string | null> => {
  try {
    const notification = {
      userId,
      type: 'local' as const,
      title,
      content,
      scheduledFor,
      category,
      location,
    };

    return await createNotification(notification);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Get scheduled notifications for a user
export const getScheduledNotifications = async (
  userId: string
): Promise<Notification[]> => {
  try {
    const whereConditions: QueryParams[] = [
      { fieldPath: 'userId', operator: '==', value: userId },
      { fieldPath: 'type', operator: '==', value: 'local' },
      { fieldPath: 'scheduledFor', operator: '>=', value: new Date() },
    ];

    const results = await queryDocuments(
      COLLECTIONS.NOTIFICATIONS,
      whereConditions,
      'scheduledFor',
      'asc'
    );

    return results.map((doc) => {
      const processedData = processDocumentData(doc);

      return {
        id: doc.id,
        userId: processedData.userId,
        type: processedData.type,
        title: processedData.title,
        content: processedData.content,
        relatedPostId: processedData.relatedPostId,
        location: processedData.location,
        scheduledFor: processedData.scheduledFor,
        createdAt: processedData.createdAt,
        isRead: processedData.isRead || false,
        category: processedData.category,
      };
    });
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};
