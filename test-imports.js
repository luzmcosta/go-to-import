// Test the specific imports from test-store.js with actual VS Code workspace context
const path = require('path');

// Test imports from test-store.js
const testImports = [
    'pinia',                          // Library import (should not resolve to local file)
    'vue',                           // Library import (should not resolve to local file)
    '@/firebase/fireauth.js',        // Should resolve to src/firebase/fireauth.js
    '@/firebase/firestore.js',       // Should resolve to src/firebase/firestore.js
    '@/utils/error.js',              // Should resolve to src/utils/error.js
    'src/stores/setting.js',         // Direct src path
    '@/stores/user',                 // Should resolve to src/stores/user.js
    '@/stores/api',                  // Should resolve to src/stores/api.js
    '@/utils/env.js',                // Should resolve to src/utils/env.js
    '@root/example/stores/api.js'    // Should resolve to ../example/stores/api.js
];

console.log('Testing path resolution for test-store.js imports...\n');

testImports.forEach((importPath, index) => {
    console.log(`${index + 1}. "${importPath}"`);

    if (importPath === 'pinia' || importPath === 'vue') {
        console.log('   → Library import (no local file expected)\n');
        return;
    }

    const workspaceRoot = '/Users/luzmcosta/github/vscode-extension/example';

    if (importPath.startsWith('@/')) {
        const aliasPath = importPath.substring(2); // Remove '@/'
        const srcPath = path.join(workspaceRoot, 'src', aliasPath);
        console.log(`   → Should resolve to: ${srcPath}`);

        // Check if .js extension needs to be added
        if (!path.extname(importPath)) {
            console.log(`   → With .js extension: ${srcPath}.js`);
        }
    } else if (importPath.startsWith('@root/')) {
        const aliasPath = importPath.substring(6); // Remove '@root/'
        const rootPath = path.join(workspaceRoot, '..', aliasPath);
        console.log(`   → Should resolve to: ${rootPath}`);
    } else if (importPath.startsWith('src/')) {
        const srcPath = path.join(workspaceRoot, importPath);
        console.log(`   → Should resolve to: ${srcPath}`);
    }

    console.log('');
});

console.log('Expected file structure:');
console.log('example/');
console.log('  src/');
console.log('    firebase/');
console.log('      fireauth.js ✓');
console.log('      firestore.js ✓');
console.log('    stores/');
console.log('      setting.js ✓');
console.log('      user.js ✓');
console.log('      api.js ✓');
console.log('    utils/');
console.log('      error.js ✓');
console.log('      env.js ✓');
console.log('  stores/');
console.log('    api.js ✓ (for @root alias test)');
