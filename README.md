# Go to Import

**Navigate to files instantly by clicking on import paths!**

Go to Import makes file paths in import statements clickable, allowing you to quickly navigate to referenced files with a simple Ctrl+Click (Cmd+Click on Mac).

## ✨ Features

- **One-click navigation** to imported files
- **Multi-language support** for JavaScript, TypeScript, Python, CSS, and more
- **Smart path resolution** for relative and absolute paths
- **Automatic file extension detection**
- **Works with popular frameworks** like React, Vue, Angular

## 🚀 Usage

1. Open any file containing import statements
2. Hold **Ctrl** (or **Cmd** on Mac) and hover over a file path
3. Click the highlighted path to jump directly to that file

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

## 🔒 Security

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

### 0.0.1

- Initial release
- Support for JavaScript/TypeScript imports
- Support for Python imports
- Support for CSS imports
- Intelligent path resolution
- Multi-language detection

## 🐛 Known Issues

- Complex import patterns may not be detected
- Node modules imports are not resolved (by design)

## 🤝 Contributing

Found a bug or want to contribute? Please report issues or submit pull requests.

## 📄 License

This extension is licensed under the MIT License.

## README

This is the README for your extension. After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
