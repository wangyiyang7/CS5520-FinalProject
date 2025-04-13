/**
 * Firestore Helper Utility
 * Provides standardized methods for CRUD operations on Firestore collections.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit as firebaseLimit,
  Timestamp,
  WhereFilterOp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { database } from './firebaseSetup';

// Collection names as constants for consistency
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  NOTIFICATIONS: 'notifications',
};

// Helper to convert Firestore timestamp to Date
export const convertTimestampToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }

  // Handle Firestore Timestamp objects
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }

  // Handle date objects already
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Handle server timestamps that might come as objects with seconds and nanoseconds
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }

  // Default fallback
  return new Date();
};

// Add a document to a collection
export async function addDocument(
  collectionName: string,
  data: any
): Promise<string | null> {
  try {
    console.log(`Adding document to ${collectionName}:`, data);
    const docRef = await addDoc(collection(database, collectionName), data);
    console.log(`Document added with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return null;
  }
}

// Set a document with a specific ID
export async function setDocument(
  collectionName: string,
  docId: string,
  data: any,
  merge: boolean = true
): Promise<boolean> {
  try {
    console.log(
      `Setting document in ${collectionName} with ID ${docId}:`,
      data
    );
    await setDoc(doc(database, collectionName, docId), data, { merge });
    return true;
  } catch (error) {
    console.error(
      `Error setting document in ${collectionName} with ID ${docId}:`,
      error
    );
    return false;
  }
}

// Update specific fields in a document
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: any
): Promise<boolean> {
  try {
    console.log(
      `Updating document in ${collectionName} with ID ${docId}:`,
      data
    );
    await updateDoc(doc(database, collectionName, docId), data);
    return true;
  } catch (error) {
    console.error(
      `Error updating document in ${collectionName} with ID ${docId}:`,
      error
    );
    return false;
  }
}

// Delete a document from a collection
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    console.log(`Deleting document from ${collectionName} with ID ${docId}`);
    await deleteDoc(doc(database, collectionName, docId));
    return true;
  } catch (error) {
    console.error(
      `Error deleting document from ${collectionName} with ID ${docId}:`,
      error
    );
    return false;
  }
}

// Get a document by ID
export async function getDocument(
  collectionName: string,
  docId: string
): Promise<any | null> {
  try {
    console.log(`Getting document from ${collectionName} with ID ${docId}`);
    const docSnapshot = await getDoc(doc(database, collectionName, docId));

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
      };
    } else {
      console.log(`Document not found in ${collectionName} with ID ${docId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error getting document from ${collectionName} with ID ${docId}:`,
      error
    );
    return null;
  }
}

// Interface for query parameters
export interface QueryParams {
  fieldPath: string;
  operator: WhereFilterOp;
  value: any;
}

// Query documents from a collection with optional filtering, ordering, and limiting
export async function queryDocuments(
  collectionName: string,
  whereConditions: QueryParams[] = [],
  orderByField: string | null = null,
  orderDirection: 'asc' | 'desc' = 'desc',
  limit: number | null = null
): Promise<any[]> {
  try {
    console.log(`Querying documents from ${collectionName}`);

    // First get a reference to the collection
    const collectionRef = collection(database, collectionName);
    let q;

    // Check if we have specific conditions that might require an index
    const hasWhereAndOrder =
      whereConditions.length > 0 && orderByField !== null;

    if (hasWhereAndOrder) {
      // More flexible approach that may not require an index
      // First, get all documents that match the where conditions
      const constraints: QueryConstraint[] = [];

      //  where conditions
      whereConditions.forEach((condition) => {
        constraints.push(
          where(condition.fieldPath, condition.operator, condition.value)
        );
      });

      // Execute the query with just the where conditions
      q = query(collectionRef, ...constraints);
    } else {
      // No risk of missing index, use all constraints
      const constraints: QueryConstraint[] = [];

      //  where conditions
      whereConditions.forEach((condition) => {
        constraints.push(
          where(condition.fieldPath, condition.operator, condition.value)
        );
      });

      //  orderBy if specified
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      //  limit if specified
      if (limit !== null && limit > 0) {
        constraints.push(firebaseLimit(limit));
      }

      // Build query
      q = query(collectionRef, ...constraints);
    }

    // Execute the query
    const querySnapshot = await getDocs(q);

    console.log(
      `Retrieved ${querySnapshot.size} documents from ${collectionName}`
    );

    // Process results
    let results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // If we need to order or limit the results and we used the workaround
    if (hasWhereAndOrder) {
      // Sort results in memory
      if (orderByField) {
        results.sort((a, b) => {
          if (orderDirection === 'desc') {
            // Handle dates correctly
            if (
              a[orderByField] instanceof Date &&
              b[orderByField] instanceof Date
            ) {
              return b[orderByField].getTime() - a[orderByField].getTime();
            }
            if (a[orderByField] > b[orderByField]) return -1;
            if (a[orderByField] < b[orderByField]) return 1;
            return 0;
          } else {
            // Handle dates correctly
            if (
              a[orderByField] instanceof Date &&
              b[orderByField] instanceof Date
            ) {
              return a[orderByField].getTime() - b[orderByField].getTime();
            }
            if (a[orderByField] < b[orderByField]) return -1;
            if (a[orderByField] > b[orderByField]) return 1;
            return 0;
          }
        });
      }

      // Apply limit if needed
      if (limit !== null && limit > 0 && results.length > limit) {
        results = results.slice(0, limit);
      }
    }

    return results;
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    return [];
  }
}

// Get all documents from a collection
export async function getAllDocuments(collectionName: string): Promise<any[]> {
  try {
    console.log(`Getting all documents from ${collectionName}`);
    const querySnapshot = await getDocs(collection(database, collectionName));

    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return results;
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    return [];
  }
}

// Process document data to handle timestamps and other Firestore-specific data types
export function processDocumentData(doc: DocumentData): any {
  const data = { ...doc };

  // Convert all timestamp fields to Date objects
  for (const key in data) {
    if (
      data[key] instanceof Timestamp ||
      (data[key] && typeof data[key] === 'object' && 'seconds' in data[key])
    ) {
      data[key] = convertTimestampToDate(data[key]);
    }
  }

  return data;
}
