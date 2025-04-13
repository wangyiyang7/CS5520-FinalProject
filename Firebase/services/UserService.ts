/**
 * Service for user-related operations.
 * Handles user profile management and user settings.
 */

import {
  COLLECTIONS,
  addDocument,
  getDocument,
  updateDocument,
  setDocument,
  processDocumentData,
} from '@/Firebase/firestoreHelper';
import { Timestamp } from 'firebase/firestore';
// User profile interface
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp[];
  notificationPreferences: {
    categories: string[];
    radius: number;
  };
}

// Create a new user profile
export const createUserProfile = async (
  userId: string,
  email: string,
  username?: string
): Promise<boolean> => {
  try {
    const now = Timestamp.now();

    const userData = {
      username: username || email.split('@')[0], // Default username from email if not provided
      email,
      createdAt: now,
      lastLogin: [now, now],
      notificationPreferences: {
        categories: [],
        radius: 0,
      },
    };

    // Use setDocument to create with a specific ID (the auth user ID)
    return await setDocument(COLLECTIONS.USERS, userId, userData, false);
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

// Get a user profile by ID
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const doc = await getDocument(COLLECTIONS.USERS, userId);
    if (!doc) return null;

    const processedData = processDocumentData(doc);
    console.log(processedData.lastLogin);
    return {
      id: doc.id,
      username: processedData.username || '',
      email: processedData.email || '',
      photoURL: processedData.photoURL,
      createdAt: doc.createdAt,
      lastLogin: doc.lastLogin,
      notificationPreferences: processedData.notificationPreferences || {
        categories: [],
        radius: 0,
      },
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> => {
  try {
    // only allow update username,and lastLogin
    const { ...validUpdates } = updates;

    return await updateDocument(COLLECTIONS.USERS, userId, validUpdates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Update user's notification preferences
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<UserProfile['notificationPreferences']>
): Promise<boolean> => {
  try {
    // Get the current user profile
    const user = await getUserProfile(userId);
    if (!user) return false;

    // Merge the current preferences with the updates
    const updatedPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    // Update just the notification preferences field
    return await updateDocument(COLLECTIONS.USERS, userId, {
      notificationPreferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
};

// Update last login time
export const updateLastLogin = async (userId: string): Promise<boolean> => {
  try {
    return await updateDocument(COLLECTIONS.USERS, userId, {
      lastLogin: new Date(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
};

// Check if user exists
export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const user = await getDocument(COLLECTIONS.USERS, userId);
    return !!user;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

// Create or update user profile (useful after authentication)
export const createOrUpdateUser = async (
  userId: string,
  email: string,
  username?: string
): Promise<boolean> => {
  try {
    const userExists = await checkUserExists(userId);

    if (userExists) {
      // Just update the last login time
      return await updateLastLogin(userId);
    } else {
      // Create a new user profile
      return await createUserProfile(userId, email, username);
    }
  } catch (error) {
    console.error('Error creating or updating user:', error);
    return false;
  }
};

// Store a user's push notification token
export const updateUserPushToken = async (
  userId: string,
  pushToken: string
): Promise<boolean> => {
  try {
    return await updateDocument(COLLECTIONS.USERS, userId, {
      pushToken: pushToken,
    });
  } catch (error) {
    console.error('Error updating push token:', error);
    return false;
  }
};
