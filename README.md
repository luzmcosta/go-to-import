# Go to Import

**Navigate to files instantly by clicking on import paths!**

[![Version](https://img.shields.io/visual-studio-marketplace/v/luzmcosta.go-to-import)](https://marketplace.visualstudio.com/items?itemName=luzmcosta.go-to-import)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/luzmcosta.go-to-import)](https://marketplace.visualstudio.com/items?itemName=luzmcosta.go-to-import)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/luzmcosta.go-to-import)](https://marketplace.visualstudio.com/items?itemName=luzmcosta.go-to-import)

Go to Import makes file paths in import statements clickable, allowing you to quickly navigate to referenced files with multiple convenient methods.

## ✨ Features

- **🖱️ One-click navigation** to imported files via Cmd+Click (configurable)
- **⌨️ Keyboard shortcuts** for quick access (Cmd+Shift+G)
- **📱 Multiple access methods** - context menu, status bar, command palette
- **🌍 Multi-language support** for JavaScript, TypeScript, Python, CSS, and more
- **🧠 Smart path resolution** for relative and absolute paths
- **🔍 Automatic file extension detection**
- **🎯 Framework-friendly** - works with React, Vue, Angular, and more
- **🔒 Security-first** - comprehensive security measures built-in

## 🚀 Quick Start

### Method 1: Click to Navigate
1. Open any file containing import statements
2. Hold **Cmd** (Mac) or **Ctrl** (Windows/Linux) and hover over a file path
3. Click the highlighted path to jump directly to that file

### Method 2: Keyboard Shortcut
1. Place cursor on or near an import path
2. Press **Cmd+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux)
3. If multiple imports exist, select from the quick-pick menu

### Method 3: Context Menu
1. Right-click on any import path
2. Select "Jump to Import File" from the context menu

### Method 4: Status Bar
1. Look for the "🔗 Go to Import" button in the status bar (appears in supported files)
2. Click to access jump functionality

## 📋 Supported Import Patterns

### JavaScript/TypeScript
```javascript
import React from 'react';
import { Component } from './component';
import utils from '../utils/helpers';
require('./module');
import('./dynamic-module');
```

### Python
```python
import os
from pathlib import Path
from .local import module
```

### CSS/SCSS
```css
@import './styles.css';
@import '../fonts/fonts.scss';
```

## 🔧 Supported File Types

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Python (`.py`)
- CSS/SCSS/LESS (`.css`, `.scss`, `.less`)
- JSON (`.json`)
- Vue (`.vue`)
- Svelte (`.svelte`)

## 📁 Path Resolution

The extension intelligently resolves:
- ✅ Relative paths (`./`, `../`)
- ✅ Absolute paths from workspace root
- ✅ Common file extensions automatically
- ✅ Index files in directories
- ✅ Files without extensions

## � Configuration

This extension provides several configuration options to customize your experience:

### Settings

Open VS Code Settings (Cmd+, or Ctrl+,) and search for "go to import":

- **`go-to-import.enableStatusBar`** (default: `true`)
  - Show/hide the "Go to Import" button in the status bar

- **`go-to-import.showHelpNotification`** (default: `true`)
  - Show/hide the helpful notification about Cmd+Click conflicts on macOS

### Custom Keybindings

You can customize the keyboard shortcut for jumping to imports:

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Search for "Preferences: Open Keyboard Shortcuts"
3. Search for "Jump to Import File"
4. Modify the keybinding to your preference

**Default keybindings:**
- macOS: `Cmd+Shift+G`
- Windows/Linux: `Ctrl+Shift+G`

### Customizing Click Behavior

To change the Cmd+Click behavior system-wide:

1. **Change Multi-Cursor Modifier (Recommended):**
   ```json
   {
     "editor.multiCursorModifier": "altKey"
   }
   ```
   This makes Alt+Click create multiple cursors and frees up Cmd+Click for links.

2. **Custom Keybindings in keybindings.json:**
   ```json
   [
     {
       "key": "cmd+alt+g",
       "command": "go-to-import.jumpToImport",
       "when": "editorTextFocus"
     }
   ]
   ```

## �🔒 Security

This extension implements comprehensive security measures:

- **Workspace Trust**: Only operates in trusted workspaces
- **Path Validation**: Prevents path traversal and validates file access
- **File Type Restrictions**: Blocks access to executable and sensitive files
- **Boundary Enforcement**: Restricts access to workspace files only

For detailed security information, see [SECURITY.md](SECURITY.md).

## 🎯 Requirements

- Visual Studio Code 1.74.0 or higher
- No additional dependencies required

## 📝 Release Notes

### 0.0.3 - Enhanced Navigation & Customization
- **🔧 Multiple access methods** - Keyboard shortcuts, context menu, status bar
- **⚙️ Configurable settings** - Customize status bar, notifications, and keybindings
- **🍎 macOS optimization** - Smart detection and guidance for Cmd+Click conflicts
- **🎯 Improved UX** - Platform-specific tooltips and one-time helpful notifications
- **📱 Status bar integration** - Quick access button for supported file types

### 0.0.2 - Security & Stability
- Enhanced security measures and path validation
- Improved error handling and user feedback
- Better workspace trust integration

### 0.0.1 - Initial Release
- Support for JavaScript/TypeScript imports
- Support for Python imports
- Support for CSS imports
- Intelligent path resolution
- Multi-language detection

## 🐛 Known Issues & Troubleshooting

### Cmd-Click creates multiple cursors instead of jumping to file (macOS)

If Cmd-Click is creating multiple cursors instead of jumping to the file, this is due to VS Code's multi-cursor modifier setting conflicting with the DocumentLinkProvider.

**Solutions:**

1. **Change the multi-cursor modifier (Recommended):**
   - Open VS Code Settings (`Cmd+,`)
   - Search for "multi cursor modifier"
   - Change `editor.multiCursorModifier` from `commandKey` to `altKey`
   - Now use Alt+Click for multi-cursor and Cmd+Click for jumping to files

2. **Use alternative methods:**
   - **Keyboard**: Press `Cmd+Shift+G`
   - **Context menu**: Right-click on an import path → "Jump to Import File"
   - **Status bar**: Click the "🔗 Go to Import" button
   - **Command Palette**: `Cmd+Shift+P` → "Jump to Import File"

3. **Use Ctrl+Click instead:**
   - Hold `Ctrl+Click` instead of `Cmd+Click` to follow the link

### Other Known Issues

- Complex import patterns may not be detected
- Node modules imports are not resolved (by design for security)
- Very large files (>1MB) are skipped for performance

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 🐛 **Report bugs** - [Create an issue](https://github.com/luzmcosta/go-to-import/issues)
- 💡 **Suggest features** - [Start a discussion](https://github.com/luzmcosta/go-to-import/discussions)
- 🔧 **Submit pull requests** - See our [contribution guidelines](.github/CONTRIBUTING.md)
- ⭐ **Star the repo** if you find it useful!

## 📄 License

This extension is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with ❤️ using the [VS Code Extension API](https://code.visualstudio.com/api)
- Inspired by the need for faster navigation in modern development workflows
- Thanks to all contributors and users who provide feedback!

---

**Enjoying Go to Import?** [Leave a review](https://marketplace.visualstudio.com/items?itemName=luzmcosta.go-to-import&ssr=false#review-details) and help others discover it! ⭐
