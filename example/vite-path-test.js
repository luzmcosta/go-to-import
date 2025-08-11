// Test to verify that vite config path resolution works correctly
// This file is in the example/ directory, and the vite.config.js is also here
// The vite config has:
// '@': fileURLToPath(new URL('./src', import.meta.url))
// '@root': fileURLToPath(new URL('../', import.meta.url))

// These should resolve correctly because the vite config is in the same directory:
import { useSettingStore } from '@/stores/setting.js'  // Should resolve to: example/src/stores/setting.js
import { useUserStore } from '@/stores/user'           // Should resolve to: example/src/stores/user.js
import { FireAuth } from '@/firebase/fireauth.js'      // Should resolve to: example/src/firebase/fireauth.js

// This should resolve to the parent directory (vscode-extension root):
import { something } from '@root/package.json'         // Should resolve to: ../package.json

// Test the path resolution by opening Developer Console and watching the logs
// You should see messages like:
// "Go to Import: Loaded Vite alias '@/' -> '/full/path/to/example/src' from /full/path/to/example/vite.configa.js"
