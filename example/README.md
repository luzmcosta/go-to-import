# Go to Import Extension - Multi-Language Demo

This directory contains example files demonstrating how the Go to Import extension works with TypeScript, JSX, and Python files.

## Files Overview

### JavaScript/TypeScript Demo Files
- **`test-file.js`** - JavaScript file with various import types (React, CSS, JSON, components)
- **`test-file.tsx`** - TypeScript/TSX file demonstrating advanced TypeScript imports
- **`components/Modal.tsx`** - TypeScript React component with multiple import types
- **`components/Button.jsx`** - JSX component for comparison

### Python Demo Files
- **`py/test-file.py`** - Comprehensive Python import demonstration
- **`py/test.py`** - Alternative Python demo with different patterns
- **`py/sibling_module.py`** - Python utilities and classes
- **`py/python_utils.py`** - Cross-language analysis utilities
- **`py/__init__.py`** - Package initialization with re-exports

### Utility Files
- **`utils/helpers.js`** - JavaScript utility functions
- **`utils/typescript-helpers.ts`** - TypeScript utility functions with interfaces and types
- **`styles.css`** - Main stylesheet with @import statements
- **`base.css`** - Base styles including modal styles
- **`config.json`** - Sample JSON configuration file

## Testing the Extension

1. Open any of the demo files in VS Code
2. Try navigating to imports using these methods:
   - **Cmd+Click** (Mac) / **Ctrl+Click** (Windows/Linux) on import paths
   - **Cmd+Shift+G** (Mac) / **Ctrl+Shift+G** (Windows/Linux)
   - Right-click → "Jump to Import File"
   - Command Palette → "Jump to Import File"
   - Status bar "🔗 Go to Import" button

## Import Types Demonstrated

### JavaScript/JSX Imports (`test-file.js`)
- React imports (default and named)
- CSS imports
- JSON imports
- Local component imports (JSX and TSX)
- Dynamic imports
- CommonJS requires

### TypeScript/TSX Imports (`test-file.tsx`)
- React with TypeScript types
- TypeScript interface imports
- Type-only imports
- Const assertion imports
- Re-exports
- Complex utility imports

### Python Imports (`py/test-file.py`, `py/test.py`)
- Standard library imports (os, sys, pathlib, datetime, typing)
- Relative imports within packages
- Import aliases and multiple imports
- Conditional imports with try/except
- Class and function imports
- Package imports with `__init__.py`

### Component Imports (`Modal.tsx`)
- Cross-file component imports
- JavaScript utility imports from TypeScript
- TypeScript utility imports
- CSS imports from components
- Interface and type imports

## Language-Specific Features

### Python Examples Highlight:
- ✅ Package structure with `__init__.py`
- ✅ Relative imports (`.` and `..`)
- ✅ Standard library imports
- ✅ Type hints with `typing` module
- ✅ Dataclasses and modern Python features
- ✅ Import aliases and conditional imports
- ✅ Cross-module class and function usage

### TypeScript Examples Highlight:
- ✅ Interface and type imports
- ✅ Type-only imports
- ✅ Const assertions
- ✅ Generic types and utility types
- ✅ Re-exports and barrel exports
- ✅ Mixed JavaScript/TypeScript imports

### JavaScript Examples Highlight:
- ✅ ES6 modules and CommonJS
- ✅ Dynamic imports for code splitting
- ✅ Asset imports (CSS, JSON)
- ✅ Component imports across file types

## Features Highlighted

- ✅ Multi-language projects (Python, JavaScript, TypeScript)
- ✅ Mixed file type imports (py ↔ js/ts)
- ✅ Package and module structures
- ✅ Relative and absolute imports
- ✅ Type-safe imports with TypeScript
- ✅ CSS and asset imports
- ✅ JSON configuration imports
- ✅ Dynamic imports and conditional imports
- ✅ Re-exports and barrel patterns
- ✅ Nested directory structures

## Running the Demos

### Python Demos
```bash
# Run the main Python demo
cd py
python test-file.py

# Run the alternative demo
python test.py

# Run the package demo
python -c "from py import quick_demo; quick_demo()"
```

### JavaScript/TypeScript Demos
Open the files in VS Code and use the extension to navigate between imports.

## Tips

- If Cmd+Click creates multiple cursors instead of navigating, change `"editor.multiCursorModifier"` to `"altKey"` in VS Code settings
- The extension works with relative and absolute paths
- Supports various file extensions: `.py`, `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.json`
- Python relative imports work best when files are in proper package structure
- Cross-language navigation helps understand project dependencies
