/**
 * Provides database initialization and management utilities.
 * Handles initial setup, sample data generation, and collection structure.
 */

import { createSamplePosts } from './PostService';
import { COLLECTIONS, queryDocuments } from '@/Firebase/firestoreHelper';

// Database structure information for documentation
export const DATABASE_STRUCTURE = {
  users: {
    fields: [
      'username',
      'email',
      'photoURL',
      'createdAt',
      'lastLogin',
      'notificationPreferences',
    ],
    description: 'Stores user profile information and settings',
  },
  posts: {
    fields: [
      'title',
      'content',
      'category',
      'locationName',
      'location',
      'authorId',
      'authorName',
      'photoURL',
      'isPublic',
      'likes',
      'verified',
      'createdAt',
    ],
    description: 'Contains all posts shared in the app',
  },
  notifications: {
    fields: [
      'userId',
      'type',
      'title',
      'content',
      'relatedPostId',
      'location',
      'scheduledFor',
      'createdAt',
      'isRead',
      'category',
    ],
    description: 'Stores notifications for users',
  },
};

// Get the database structure
export const getDatabaseStructure = () => {
  return DATABASE_STRUCTURE;
};

// Check if a collection exists and has data
export const checkCollectionHasData = async (
  collectionName: string
): Promise<boolean> => {
  try {
    const results = await queryDocuments(collectionName, [], null, 'desc', 1);
    return results.length > 0;
  } catch (error) {
    console.error(`Error checking if ${collectionName} has data:`, error);
    return false;
  }
};

// Initialize database with sample data if needed
export const initializeDatabase = async (
  forceInitialize = false
): Promise<boolean> => {
  try {
    console.log('Checking database initialization status...');

    // If forcing initialization, skip the check
    if (forceInitialize) {
      console.log('Force initializing database with sample data...');
      const postsCreated = await createSamplePosts();
      console.log('Sample posts created successfully:', postsCreated);
      return postsCreated;
    }

    // Check if posts collection has data
    const hasData = await checkCollectionHasData(COLLECTIONS.POSTS);

    if (!hasData) {
      console.log('No existing posts found, creating sample data...');
      const postsCreated = await createSamplePosts();
      console.log('Sample posts created successfully:', postsCreated);
      return postsCreated;
    }

    console.log('Database already contains data, skipping initialization');
    return false;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Reset database (for development/testing purposes)
export const resetDatabase = async (): Promise<boolean> => {
  try {
    console.log('This would reset the database in a real implementation');
    // In a real implementation, you might:
    // 1. Delete all documents from collections
    // 2. Re-initialize with sample data

    // For now, just reinitialize with sample data
    return await initializeDatabase(true);
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};

// Get database statistics
export const getDatabaseStats = async (): Promise<any> => {
  try {
    // Get counts from each collection
    const postsCount = (await queryDocuments(COLLECTIONS.POSTS)).length;
    const usersCount = (await queryDocuments(COLLECTIONS.USERS)).length;
    const notificationsCount = (await queryDocuments(COLLECTIONS.NOTIFICATIONS))
      .length;

    return {
      collections: {
        [COLLECTIONS.POSTS]: postsCount,
        [COLLECTIONS.USERS]: usersCount,
        [COLLECTIONS.NOTIFICATIONS]: notificationsCount,
      },
      totalDocuments: postsCount + usersCount + notificationsCount,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      error: 'Failed to get database statistics',
      timestamp: new Date(),
    };
  }
};

// Export collection names for backward compatibility
export { COLLECTIONS };
