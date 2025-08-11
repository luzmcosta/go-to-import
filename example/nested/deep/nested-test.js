// Deep nested file test - should traverse up to find example/vite.config.js
//
// 📁 CURRENT LOCATION: example/nested/deep/nested-test.js
// 🔍 SEARCH PATH:
//   1. example/nested/deep/ (check for config files)
//   2. example/nested/ (check for config files)
//   3. example/ (FOUND: vite.config.js) ✅
//
// The extension should traverse up and find example/vite.config.js
// Then resolve paths relative to that config file location.

import { useSettingStore } from '@/stores/setting.js'    // → example/src/stores/setting.js
import { deepNested } from '@/utils/helpers.js'          // → example/src/utils/helpers.js
import rootFile from '@root/package.json'                // → ../../../package.json

console.log('Testing deep nested directory traversal...');
