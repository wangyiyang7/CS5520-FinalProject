/**
 * Service for handling post-related data operations.
 * Contains functions for fetching, creating, updating, and deleting posts.
 */

import { addDoc, collection } from 'firebase/firestore';
import { database } from '@/Firebase/firebaseSetup';
import {
  COLLECTIONS,
  queryDocuments,
  addDocument,
  processDocumentData,
  QueryParams,
  getDocument,
  updateDocument,
  deleteDocument,
} from '@/Firebase/firestoreHelper';
import {
  calculateDistance,
  getCurrentLocation,
} from '@/utils/calculateDistance';

import { notifyUsersAboutPost } from './NotificationService';

// Updated interface to match the full structure of a post
export interface PublicPost {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  locationName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  authorId: string;
  authorName: string;
  photoURL?: string;
  isPublic: boolean;
  likes: number;
  verified: number;
}

// Interface for creating a new post
export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  locationName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  authorId: string;
  authorName: string;
  photoURL?: string;
  isPublic: boolean;
}

// Updated function to filter by radius condition
export const fetchPublicPosts = async (
  limitCount = 10,
  radiusKm = 5 // Add the radius parameter with default 5km
): Promise<PublicPost[]> => {
  try {
    const myLocation = await getCurrentLocation();
    const { latitude, longitude } = myLocation?.coords || {
      latitude: 38.8977,
      longitude: -77.0365,
    };
    console.log(latitude, longitude);

    console.log('Fetching public posts...');

    // Define query parameters
    const whereConditions: QueryParams[] = [
      { fieldPath: 'isPublic', operator: '==', value: true },
    ];

    console.log('Querying documents from posts in fetchPublicPosts');

    // Query the posts
    const results = await queryDocuments(
      COLLECTIONS.POSTS,
      whereConditions,
      'createdAt',
      'desc',
      limitCount
    );

    // Safety check for empty results
    if (results.length === 0) {
      console.log('No posts found in database');
      return [];
    }

    console.log(`Fetched ${results.length} posts`);

    // Filter using the provided radius parameter instead of hardcoded 5km
    const results_refined = results.filter((post) => {
      // Skip posts with invalid location data
      if (
        !post.location ||
        typeof post.location.latitude !== 'number' ||
        typeof post.location.longitude !== 'number'
      ) {
        console.log('Skipping post with invalid location data:', post.id);
        return false;
      }

      const postLat = post.location.latitude;
      const postLon = post.location.longitude;
      const distance = calculateDistance(latitude, longitude, postLat, postLon);
      return distance <= radiusKm; // Use the parameter instead of hardcoded value
    });

    // Map the results to the PublicPost interface
    const posts: PublicPost[] = results_refined.map((doc) => {
      const processedData = processDocumentData(doc);

      return {
        id: doc.id,
        title: processedData.title || 'Untitled Post',
        content: processedData.content || '',
        category: processedData.category || 'General',
        createdAt: processedData.createdAt,
        locationName: processedData.locationName || 'Unknown location',
        location: processedData.location || {
          latitude: 0,
          longitude: 0,
        },
        authorId: processedData.authorId || '',
        authorName: processedData.authorName || 'Anonymous',
        photoURL: processedData.photoURL,
        isPublic: processedData.isPublic || true,
        likes: processedData.likes || 0,
        verified: processedData.verified || 0,
      };
    });

    return posts;
  } catch (error) {
    console.error('Error fetching public posts:', error);
    return [];
  }
};

// Create a new post
export const createPost = async (
  postData: CreatePostData
): Promise<string | null> => {
  try {
    console.log('Creating new post:', postData);

    // Add post creation date
    const postWithDate = {
      ...postData,
      createdAt: new Date(),
      likes: 0,
      verified: 0,
    };

    // Use the helper to add the document
    const postId = await addDocument(COLLECTIONS.POSTS, postWithDate);

    // const postId = await addDocument(COLLECTIONS.POSTS, postWithDate);

    // New code to notify users
    if (postId) {
      // Get the complete post data with ID
      const newPost = await getPostById(postId);
      if (newPost) {
        // Notify users in background, don't wait for completion
        notifyUsersAboutPost(newPost)
          .then((count) =>
            console.log(`Notified ${count} users about new post`)
          )
          .catch((err) => console.error('Error sending notifications:', err));
      }
    }

    return postId;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

// Function to create sample posts for testing
export const createSamplePosts = async (): Promise<boolean> => {
  try {
    // Sample post data
    const samplePosts = [
      {
        title: 'Traffic Alert: Accident on Main Street',
        content:
          'Accident at the intersection of Main St and Broadway. Traffic backed up. Seek alternate routes.',
        category: 'Traffic',
        locationName: 'Main St & Broadway',
        location: {
          latitude: 47.6205,
          longitude: -122.3493,
        },
        authorId: 'sample-author-1',
        authorName: 'Traffic Monitor',
        photoURL: 'https://picsum.photos/seed/traffic/400/300',
        isPublic: true,
        likes: 5,
        verified: 3,
        createdAt: new Date(),
      },
      {
        title: 'Community Event: Farmers Market Today',
        content:
          'The weekly farmers market is open today from 9am-2pm. Fresh produce and local crafts available!',
        category: 'Event',
        locationName: 'City Center Plaza',
        location: {
          latitude: 47.6219,
          longitude: -122.3517,
        },
        authorId: 'sample-author-2',
        authorName: 'Event Coordinator',
        photoURL: 'https://picsum.photos/seed/farmers/400/300',
        isPublic: true,
        likes: 12,
        verified: 8,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        title: 'Construction Update: Road Closure',
        content:
          'Pine Street will be closed between 5th and 6th Ave for the next 2 days due to utility work.',
        category: 'Infrastructure',
        locationName: 'Pine St between 5th-6th Ave',
        location: {
          latitude: 47.615,
          longitude: -122.335,
        },
        authorId: 'sample-author-3',
        authorName: 'City Works',
        photoURL: 'https://picsum.photos/seed/construction/400/300',
        isPublic: true,
        likes: 3,
        verified: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        title: 'Safety Alert: Suspicious Activity',
        content:
          'Residents reported suspicious person checking car doors in the Oak Hill neighborhood around midnight.',
        category: 'Safety',
        locationName: 'Oak Hill Neighborhood',
        location: {
          latitude: 47.625,
          longitude: -122.342,
        },
        authorId: 'sample-author-4',
        authorName: 'Neighborhood Watch',
        photoURL: 'https://picsum.photos/seed/safety/400/300',
        isPublic: true,
        likes: 18,
        verified: 6,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
    ];

    console.log(`Creating ${samplePosts.length} sample posts...`);

    // Add each post to the database using the helper
    for (const post of samplePosts) {
      await addDocument(COLLECTIONS.POSTS, post);
    }

    console.log('Sample posts created successfully');
    return true;
  } catch (error) {
    console.error('Error creating sample posts:', error);
    return false;
  }
};

// Get a specific post by ID
export const getPostById = async (
  postId: string
): Promise<PublicPost | null> => {
  try {
    const doc = await getDocument(COLLECTIONS.POSTS, postId);
    if (!doc) return null;

    const processedData = processDocumentData(doc);

    return {
      id: doc.id,
      title: processedData.title || 'Untitled Post',
      content: processedData.content || '',
      category: processedData.category || 'General',
      createdAt: processedData.createdAt,
      locationName: processedData.locationName || 'Unknown location',
      location: processedData.location || {
        latitude: 0,
        longitude: 0,
      },
      authorId: processedData.authorId || '',
      authorName: processedData.authorName || 'Anonymous',
      photoURL: processedData.photoURL,
      isPublic: processedData.isPublic || true,
      likes: processedData.likes || 0,
      verified: processedData.verified || 0,
    };
  } catch (error) {
    console.error('Error getting post by ID:', error);
    return null;
  }
};

// Update a post
export const updatePost = async (
  postId: string,
  updates: Partial<CreatePostData>
): Promise<boolean> => {
  try {
    console.log(`Updating post ${postId} with:`, updates);

    // Use the helper to update the document
    return await updateDocument(COLLECTIONS.POSTS, postId, updates);
  } catch (error) {
    console.error('Error updating post:', error);
    return false;
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    console.log(`Deleting post ${postId}`);

    // Use the helper to delete the document
    return await deleteDocument(COLLECTIONS.POSTS, postId);
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// Like a post (increment likes count)
export const likePost = async (postId: string): Promise<boolean> => {
  try {
    const post = await getPostById(postId);
    if (!post) return false;

    const newLikes = (post.likes || 0) + 1;
    return await updateDocument(COLLECTIONS.POSTS, postId, { likes: newLikes });
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
};

// Verify a post (increment verification count)
export const verifyPost = async (postId: string): Promise<boolean> => {
  try {
    const post = await getPostById(postId);
    if (!post) return false;

    const newVerified = (post.verified || 0) + 1;
    return await updateDocument(COLLECTIONS.POSTS, postId, {
      verified: newVerified,
    });
  } catch (error) {
    console.error('Error verifying post:', error);
    return false;
  }
};

// Fetch posts by author ID
export const fetchPostsByAuthor = async (
  authorId: string,
  limitCount = 20
): Promise<PublicPost[]> => {
  try {
    console.log(`Fetching posts by author ${authorId}...`);

    const whereConditions: QueryParams[] = [
      { fieldPath: 'authorId', operator: '==', value: authorId },
    ];

    console.log('Querying documents from posts in fetchPostsByAuthor');

    const results = await queryDocuments(
      COLLECTIONS.POSTS,
      whereConditions,
      'createdAt',
      'desc',
      limitCount
    );

    console.log(`Fetched ${results.length} posts by author ${authorId}`);

    const posts: PublicPost[] = results.map((doc) => {
      const processedData = processDocumentData(doc);

      return {
        id: doc.id,
        title: processedData.title || 'Untitled Post',
        content: processedData.content || '',
        category: processedData.category || 'General',
        createdAt: processedData.createdAt,
        locationName: processedData.locationName || 'Unknown location',
        location: processedData.location || {
          latitude: 0,
          longitude: 0,
        },
        authorId: processedData.authorId || '',
        authorName: processedData.authorName || 'Anonymous',
        photoURL: processedData.photoURL,
        isPublic: processedData.isPublic || true,
        likes: processedData.likes || 0,
        verified: processedData.verified || 0,
      };
    });

    return posts;
  } catch (error) {
    console.error(`Error fetching posts by author ${authorId}:`, error);
    return [];
  }
};
