const fs = require('fs');
const path = require('path');

// Function to patch content
function patchContent(content) {
  // More flexible patterns that handle variations in minified code
  
  // Patch all window.top references with flexible whitespace and variable names
  content = content.replace(/window\.top/g, 'window');
  
  // Fix any resulting double window.window cases
  content = content.replace(/window\.window/g, 'window');
  
  // Ensure isTop is always false where it appears after these patches
  content = content.replace(/this\.isTop\s*=\s*!0/g, 'this.isTop=!1');
  content = content.replace(/this\.isTop\s*=\s*true/g, 'this.isTop=false');
  
  return content;
}

// List of all possible Phaser files that might be bundled
const filesToPatch = [
  'node_modules/phaser/dist/phaser.js',
  'node_modules/phaser/dist/phaser.min.js',
  'node_modules/phaser/dist/phaser-arcade-physics.js',
  'node_modules/phaser/dist/phaser-arcade-physics.min.js',
  'node_modules/phaser/dist/phaser.esm.js',
  'node_modules/phaser/dist/phaser.esm.min.js'
];

// Patch each file if it exists
filesToPatch.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Patching ${filePath}...`);
    let content = fs.readFileSync(fullPath, 'utf8');
    content = patchContent(content);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Patched ${filePath}`);
  }
});

// Also patch source files for good measure
const sourceFiles = [
  'node_modules/phaser/src/input/mouse/MouseManager.js',
  'node_modules/phaser/src/input/touch/TouchManager.js'
];

sourceFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Patching ${filePath}...`);
    let content = fs.readFileSync(fullPath, 'utf8');
    content = patchContent(content);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Patched ${filePath}`);
  }
});

console.log('\nAll patches complete. Please delete your dist folder and rebuild.');