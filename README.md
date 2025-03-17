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

