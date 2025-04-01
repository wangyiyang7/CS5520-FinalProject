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
  getDocument,
} from '@/Firebase/firestoreHelper';
import { calculateDistance } from '@/utils/calculateDistance';
import { PublicPost } from './PostService';

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

// Function to notify users about a new post based on their preferences
export const notifyUsersAboutPost = async (
  post: PublicPost
): Promise<number> => {
  try {
    // Get all users with notification preferences
    const usersWithPreferences = await queryDocuments(COLLECTIONS.USERS, [
      {
        fieldPath: 'notificationPreferences.categories',
        operator: 'array-contains',
        value: post.category,
      },
    ]);

    let notificationCount = 0;

    // For each user, check if post is within their preferred radius
    for (const user of usersWithPreferences) {
      const preferences = user.notificationPreferences;

      // Skip users with no radius preference
      if (!preferences || !preferences.radius) continue;

      // Get the user's last known location (you might need to adapt this based on how you store location)
      // If you don't store user locations, you could use their last post location or default location
      const userLocation = await getUserLastLocation(user.id);
      if (!userLocation) continue;

      // Calculate distance between post and user
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        post.location.latitude,
        post.location.longitude
      );

      // If post is within radius, create a notification

      if (distance <= preferences.radius) {
        // Create in-app notification
        await createNotification({
          userId: user.id,
          type: 'post',
          title: `New ${post.category} post nearby`,
          content: `${post.title} - ${post.locationName}`,
          relatedPostId: post.id,
          location: post.location,
          category: post.category,
        });

        console.log(`Notified user ${user.id}  about post ${post.id}`);

        // Add push notification if user has a push token
        if (user.pushToken) {
          await sendPushNotification(
            user.pushToken,
            `New ${post.category} post nearby`,
            `${post.title} - ${post.locationName}`,
            { postId: post.id }
          );
        }

        notificationCount++;
      }

      // if (distance <= preferences.radius) {
      //   await createNotification({
      //     userId: user.id,
      //     type: 'post',
      //     title: `New ${post.category} post nearby`,
      //     content: `${post.title} - ${post.locationName}`,
      //     relatedPostId: post.id,
      //     location: post.location,
      //     category: post.category
      //   });
      //   notificationCount++;
      // }
    }

    return notificationCount;
  } catch (error) {
    console.error('Error notifying users about post:', error);
    return 0;
  }
};

// Helper function to get a user's last known location
// We'll need to implement this based on how you track user location
const getUserLastLocation = async (
  userId: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Option 1: If you store location in user profile
    const userProfile = await getDocument(COLLECTIONS.USERS, userId);
    if (userProfile && userProfile.lastKnownLocation) {
      return userProfile.lastKnownLocation;
    }

    // Option 2: Use their most recent post location
    const userPosts = await queryDocuments(
      COLLECTIONS.POSTS,
      [{ fieldPath: 'authorId', operator: '==', value: userId }],
      'createdAt',
      'desc',
      1
    );

    if (userPosts.length > 0 && userPosts[0].location) {
      return userPosts[0].location;
    }

    return null;
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

// Send a push notification to a user
export const sendPushNotification__ = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    console.log('Push Notification Response:', responseData);
    return responseData.data && responseData.data.status === 'ok';
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    console.log('Push Notification Response:', responseData);

    if (!responseData.data || !responseData.data.id) {
      console.error('Failed to get a push ticket ID.');
      return false;
    }

    // Step 2: Fetch Receipt After a Short Delay (Expo Needs Time to Process)
    const receiptId = responseData.data.id;
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds

    const receiptResponse = await fetch(
      'https://exp.host/--/api/v2/push/getReceipts',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [receiptId] }),
      }
    );

    // const receiptData = await receiptResponse.json();
    // console.log('Push Receipt Response:', receiptData);

    // if (receiptData.data && receiptData.data[receiptId]) {
    //   const status = receiptData.data[receiptId].status;
    //   if (status === 'ok') {
    //     console.log('Notification delivered successfully!');
    //     return true;
    //   } else {
    //     console.error('Push notification error:', receiptData.data[receiptId]);
    //   }
    // }

    const receiptData = await receiptResponse.json();
    console.log('Push Receipt Response:', JSON.stringify(receiptData, null, 2)); // More detailed logging

    if (receiptData.data && receiptData.data[receiptId]) {
      const status = receiptData.data[receiptId].status;
      console.log('Push notification receipt status:', status);
      if (status === 'ok') {
        console.log('Notification delivered successfully!');
        return true;
      } else {
        console.error(
          'Push notification error details:',
          receiptData.data[receiptId]
        );
      }
    } else {
      console.error('No receipt data found for ticket ID:', receiptId);
    }

    return false;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
