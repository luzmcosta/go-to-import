// Comprehensive test for subdirectory vite.config.js path resolution
// This test validates that vite config files in subdirectories work correctly

// 📁 DIRECTORY STRUCTURE TEST:
//
// vscode-extension/                  <- workspace root
// ├── package.json                   <- workspace files
// ├── src/extension.ts               <- extension source
// └── example/                       <- subdirectory with its own vite config
//     ├── vite.config.js             <- THIS config should be found and used
//     ├── src/                       <- files that aliases should resolve to
//     │   ├── stores/
//     │   └── firebase/
//     └── vite-path-test.js          <- this file
//
// The vite.config.js in example/ defines:
// '@': points to './src' (relative to example/)
// '@root': points to '../' (relative to example/)

// 🎯 THESE SHOULD WORK (using example/vite.config.js):

// @/ should resolve to example/src/ (relative to the vite config location)
import { useSettingStore } from '@/stores/setting.js'    // → example/src/stores/setting.js
import { useUserStore } from '@/stores/user.js'          // → example/src/stores/user.js
import { FireAuth } from '@/firebase/fireauth.js'        // → example/src/firebase/fireauth.js
import { getDocument } from '@/firebase/firestore.js'    // → example/src/firebase/firestore.js

// @root/ should resolve to vscode-extension/ (parent of example/)
import packageInfo from '@root/package.json'             // → ../package.json
import readme from '@root/README.md'                     // → ../README.md

// 🔍 WHAT'S BEING TESTED:
//
// 1. Extension finds vite.config.js in example/ subdirectory (not just workspace root)
// 2. Paths are resolved relative to the CONFIG FILE location, not workspace root
// 3. '@' alias resolves to example/src/ (because config is in example/)
// 4. '@root' alias resolves to parent directory (vscode-extension/)
//
// 💡 HOVER TOOLTIPS SHOULD SHOW:
// ✅ "🔗 Path Alias: Jump to setting.js (example/src/stores/setting.js)"
// ✅ "🔗 Path Alias: Jump to package.json (package.json)"

console.log('Testing subdirectory vite config path resolution...');

// Additional test cases for edge scenarios:
import { api } from '@/stores/api.js'                    // Should find in example/src/stores/
import { helpers } from '@/utils/env.js'                 // Should find in example/src/utils/

// These should show proper error tooltips if files don't exist:
import { missing } from '@/utils/missing.js'             // ❌ Should show searched paths including example/src/utils/
import { notFound } from '@root/missing-file.js'         // ❌ Should show searched paths in parent directory
