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
