# CS5520-Final Project
## Team Members 
Carlos Semeho Edorh

Yiyang Wang 
## App Name 
Local Buzz 
## App Description 
Stay instantly informed about what's happening right around you with Local Buzz! This hyperlocal community bulletin board app connects you with real-time events and incidents in your neighborhood. From traffic snarls and road closures to local festivals and community gatherings, Local Buzz keeps you in the loop. Share updates, photos, and alerts with your neighbors, fostering a stronger, more informed community. Our AI-powered categorization ensures you see the most relevant information quickly, and customizable notifications keep you informed without overwhelming you. Experience the power of real-time local connection – download Local Buzz today! 


`----------------------------------------------------------------`
# Work Updates for branch (public-content-for-guess-users) Carlos
`----------------------------------------------------------------`

1. add Firebase services documentation; outline core utilities and project progress
2. Firebase Helper file for database transactions
3. add Firebase Database and User services for initialization, management, and user profile handling
4. add public content header, post card, and posts list components for displaying public posts with weather integration
5. add compact weather widget for displaying current conditions in a minimal format

<!-- Overlapping on Team Existing Changes/Updates -->
6. add database initialization function to layout component app\_layout.tsx  ie.`initializeDatabase()`
7. refactor HomeScreen component to integrate PublicContentHeader and PublicPostsList,
   Commented/Moved unused elements to (<MyWeather />)

`--------------------------------------------------`
# Work Updates for branch (post-details-page) Carlos
`--------------------------------------------------`

1. Create the Dynamic Route File
Created a new file called `app/post/[id].tsx`. This creates a dynamic route where `[id]` will be replaced with the actual post ID in the URL, allowing for individual post viewing.

2. Modify Post Card Navigation
Updated the `handlePostPress` function in `PublicPostsList.tsx` to navigate to the detail view when a post is tapped, using Expo Router's navigation with the post ID as a parameter.

<!-- Overlapping on Team Existing Changes/Updates -->
# None


`--------------------------------------------------`
# Work Updates for branch (create-new-post) Carlos
`--------------------------------------------------`

1. Implement Post Creation Form
   Created a comprehensive post creation form with fields for title, content, and category selection, along with camera integration for photos and automatic location capture.

   <!-- Please Note -->

`I am skipping the image URI link during the post creation because of firestore billing issues i am trying to recolve`


2. Add Form Validation and Error Handling
   Implemented proper validation for form fields and error handling for post creation, ensuring users receive clear feedback during the submission process.

3. Configure Post Creation in Firebase
   Set up the connection to Firestore for saving new posts with proper data structure, allowing authenticated users to contribute content to the community feed.

4. Implemented Auto-Refresh on Navigation
   Added functionality to automatically refresh the posts list when navigating back from post creation, ensuring newly created content appears immediately.


`--------------------------------------------------`
# Work Updates for branch (edit-delete-like-verify-share-post-functionalities) Carlos
`--------------------------------------------------`

1. Added post interaction capabilities including like, verify, share, edit, and delete functionality, enhancing user engagement with content.

2. Created conditional UI elements that display edit and delete options only to the post author, implementing proper authorization checks using the AuthContext.

3. Added verification feature allowing users to confirm the accuracy of posts, increasing community trust and content reliability.

4. Added native share functionality enabling users to easily share post content with others through device-native sharing options.

5. Implemented security checks to ensure only post authors can modify or delete their content, maintaining data integrity.