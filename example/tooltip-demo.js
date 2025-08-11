// Test file to demonstrate enhanced tooltips and visual feedback
// Hover over each import path to see different tooltip styles:

// ✅ SUCCESS TOOLTIPS (files that exist):
import { useSettingStore } from '@/stores/setting.js'  // ✅ Found in src/stores/setting.js
import { useUserStore } from '@/stores/user'           // ✅ Found in src/stores/user.js (extension added)
import { FireAuth } from '@/firebase/fireauth.js'      // ✅ Found in src/firebase/fireauth.js
import { getDocument } from '@/firebase/firestore.js'  // ✅ Found in src/firebase/firestore.js

// 📦 LIBRARY TOOLTIPS (NPM packages):
import { computed } from 'vue'                         // 📦 NPM Package detected
import { defineStore } from 'pinia'                    // 📦 NPM Package detected
import React from 'react'                              // 📦 NPM Package detected
import { format } from 'date-fns'                      // 📦 NPM Package detected

// ❌ ERROR TOOLTIPS (files that don't exist):
import { missing } from '@/utils/missing.js'          // ❌ File not found (with search paths)
import { notFound } from '@/components/NotFound'      // ❌ File not found (with search paths)
import { invalid } from './does-not-exist.js'        // ❌ File not found (with search paths)

// 🔍 DIFFERENT ALIAS TYPES:
import { fromRoot } from '@root/example/stores/api.js' // Testing @root alias
import { relative } from './relative-import.js'       // Testing relative import
import { absolute } from '/absolute/path.js'          // Testing absolute path

/**
 * TOOLTIP EXAMPLES:
 *
 * ✅ SUCCESS TOOLTIP:
 * "✅ File Found: setting.js
 *  📍 src/stores/setting.js
 *  💡 Cmd+Click to open"
 *
 * 📦 LIBRARY TOOLTIP:
 * "📦 NPM Package: vue
 *  ℹ️ This appears to be a library import"
 *
 * ❌ ERROR TOOLTIP:
 * "❌ File Not Found: @/utils/missing.js
 *  🔍 Searched:
 *  • src/utils/missing.js
 *  • src/utils/missing.js.js
 *  • src/utils/missing.js.ts
 *  • utils/missing.js
 *  💡 Check if file exists"
 */
