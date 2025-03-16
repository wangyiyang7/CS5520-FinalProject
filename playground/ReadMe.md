# Local Buzz Firebase Services

This directory contains the Firebase configuration and service utilities for the Local Buzz app.

## Structure

- `firebaseSetup.ts` - Firebase initialization and configuration
- `firestoreHelper.ts` - Core utility functions for Firestore operations
- `/services` - Domain-specific service modules

## Core Utilities

The `firestoreHelper.ts` file provides standardized methods for working with Firestore:

- CRUD operations (Create, Read, Update, Delete)
- Query building with filtering, ordering, and pagination
- Data conversion (especially for timestamps)
- Error handling and logging

## Service Modules

### PostService

Handles all post-related operations:

```typescript
import { fetchPublicPosts, createPost, likePost } from '@/Firebase/services/PostService';

// Fetch public posts
const posts = await fetchPublicPosts(10);

// Create a new post
const postId = await createPost({
  title: 'Traffic Update',
  content: 'Road closed on Main St',
  category: 'Traffic',
  // ...other required fields
});

// Like a post
await likePost(postId);
```

### UserService

Manages user profiles and settings:

```typescript
import { createUserProfile, updateNotificationPreferences } from '@/Firebase/services/UserService';

// Create a user profile after authentication
await createUserProfile(user.uid, user.email);

// Update notification preferences
await updateNotificationPreferences(user.uid, {
  categories: ['Traffic', 'Safety'],
  radius: 10
});
```

### NotificationService

Handles notifications and scheduled alerts:

```typescript
import { scheduleNotification, getUserNotifications } from '@/Firebase/services/NotificationService';

// Schedule a notification
await scheduleNotification(
  user.uid,
  'Traffic Alert',
  'Check for updates tomorrow',
  new Date(Date.now() + 86400000) // Tomorrow
);

// Get user's notifications
const notifications = await getUserNotifications(user.uid);
```

### DatabaseService

Manages database initialization and structure:

```typescript
import { initializeDatabase, getDatabaseStats } from '@/Firebase/services/DatabaseService';

// Initialize database with sample data if needed
await initializeDatabase();

// Get database statistics
const stats = await getDatabaseStats();
```

## Database Structure

The database consists of three main collections:

1. **users** - User profiles and preferences
2. **posts** - Community posts and updates
3. **notifications** - User notifications and scheduled alerts

## Best Practices

1. Always use the service modules rather than direct Firestore access
2. Handle errors appropriately in your UI components
3. Use the firestoreHelper for any custom queries
4. Follow the proper authentication flow before writing to the database