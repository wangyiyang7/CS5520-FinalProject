// For Node.js environment (npm scripts)
const fs = require('fs');
const path = require('path');

// Function for use during npm install (Node.js environment)
function cleanupPlaygroundNode() {
  const playgroundPath = path.join(__dirname, '..', 'playground');

  if (fs.existsSync(playgroundPath)) {
    console.log('Removing playground folder after npm install...');
    try {
      fs.rmSync(playgroundPath, { recursive: true, force: true });
      console.log('Playground folder removed successfully.');
    } catch (error) {
      console.error('Error removing playground folder:', error);
    }
  }
}

// If this script is being executed directly (not imported)
if (require.main === module) {
  cleanupPlaygroundNode();
}

// For React Native environment (app startup)
// This part will be ignored in Node.js context but used when imported in React Native
if (typeof module !== 'undefined' && module.exports) {
  try {
    module.exports.cleanupPlaygroundReactNative = async () => {
      // This code will only execute in the React Native environment
      // Import statements don't work in the Node.js part of the script
      const FileSystem = require('expo-file-system');
      const { Platform } = require('react-native');

      try {
        if (Platform.OS === 'web') {
          console.log('Playground folder deletion not supported on web');
          return false;
        }

        console.log('Checking for playground folder...');

        // Get the document directory path
        const documentDir = FileSystem.documentDirectory;
        // Navigate to project root (adjust path as needed)
        const projectRoot = documentDir?.replace('Documents/', '');

        if (projectRoot) {
          const playgroundPath = `${projectRoot}playground`;

          // Check if the directory exists
          const info = await FileSystem.getInfoAsync(playgroundPath);

          if (info.exists && info.isDirectory) {
            console.log('Removing playground folder...');
            await FileSystem.deleteAsync(playgroundPath, { idempotent: true });
            console.log('Playground folder removed successfully.');
            return true;
          } else {
            console.log('Playground folder not found');
            return true; // Return true as there's no folder to delete
          }
        }

        return false;
      } catch (error) {
        console.error('Error deleting playground folder:', error);
        return false;
      }
    };
  } catch (error) {
    // This will catch errors if FileSystem or react-native can't be imported
    // (which would happen in a Node.js environment)
    console.log('React Native imports not available in this environment');
  }
}
