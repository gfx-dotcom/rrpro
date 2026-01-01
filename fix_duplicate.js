const fs = require('fs');

// Read file
const content = fs.readFileSync('app.js', 'utf-8');
const lines = content.split('\n');

// Keep lines 0 to 4303 and 4437 to end
const before = lines.slice(0, 4304); // 0 to 4303 inclusive
const after = lines.slice(4437); // 4437 to end

const newContent = [...before, ...after].join('\n');

// Write back
fs.writeFileSync('app.js', newContent, 'utf-8');

console.log('✅ Fixed! Removed duplicate lines 4304-4436');
console.log(`Original: ${lines.length} lines`);
console.log(`Fixed: ${before.length + after.length} lines`);
