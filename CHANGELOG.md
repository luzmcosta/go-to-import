# Change Log

All notable changes to the "go-to-import" extension will be documented in this file.

## [0.0.5] - 2025-08-08 - ES Module Support & Enhanced Examples

### Added
- **Examples**: Comprehensive multi-language example files in `example/` directory
  - Extended JavaScript/JSX examples with implicit file extensions
  - TypeScript/TSX examples with type-safe imports and interfaces
  - Python examples with relative imports and package structure
  - CSS/SCSS examples with @import statements
  - Comprehensive README with testing instructions for all examples
- **Development**: ES module support via `package.json` `"type": "module"`
- **Build**: Updated build configuration for improved module resolution

### Changed
- **Documentation**: Restructured README with improved clarity and organization
- **Configuration**: Renamed `eslint.config.mjs` to `eslint.config.js`
- **Build**: Updated TypeScript configuration for better type safety
- **Build**: Switched to ES module import syntax in build scripts

### Removed
- **Documentation**: Redundant information in README sections

## [0.0.4] - 2025-08-08 - Enhanced Navigation & Customization

### Added
- **UX**: Multiple access methods for navigation
  - Keyboard shortcut: `Cmd+Shift+G` (Mac) / `Ctrl+Shift+G` (Windows/Linux)
  - Context menu: Right-click → "Jump to Import File"
  - Status bar: Clickable "Go to Import" button
  - Command palette: "Jump to Import File" command
- **Configuration**: New extension settings
  - `go-to-import.enableStatusBar`: Toggle status bar button
  - `go-to-import.showHelpNotification`: Toggle macOS conflict notifications
- **macOS**: Smart detection of Cmd+Click conflicts with multi-cursor
- **UX**: One-time helpful notification with direct settings access
- **UX**: Platform-specific tooltips showing correct modifier keys
- **Navigation**: Quick-pick menu when cursor not on import path
- **Navigation**: Cursor position detection for precise jumping

### Changed
- **UX**: Improved user guidance for Cmd+Click conflicts on macOS
- **UX**: Status bar button only appears in supported file types
- **UX**: Enhanced tooltips with platform-specific instructions
- **Documentation**: Comprehensive README with troubleshooting guide
- **Documentation**: Added configuration and customization sections

### Fixed
- **macOS**: Provides clear solutions for Cmd+Click creating multiple cursors
- **UX**: Better error messages and user feedback
- **Navigation**: More reliable cursor position detection

## [0.0.3] - 2025-08-08 - Security Update

### Added
- **Security**: Workspace trust requirement - extension now only operates in trusted workspaces
- **Security**: Comprehensive path validation to prevent path traversal attacks
- **Security**: File access controls with workspace boundary enforcement
- **Security**: File type restrictions to block executable and sensitive files
- **Security**: Input sanitization with path length and character validation
- **Security**: Enhanced error handling to prevent information disclosure
- **Security**: Security-focused test suite
- **Documentation**: Complete security policy and documentation

### Changed
- **Security**: Document link provider now restricted to file:// scheme only
- **Security**: Maximum document size limit (1MB) to prevent DoS attacks
- **Security**: Limited regex match count to prevent infinite loops
- **Security**: Enhanced logging with security considerations

### Security
- Prevents path traversal attacks (`../../../etc/passwd`)
- Blocks access to sensitive directories (`.git`, `.env`, `node_modules/.bin`)
- Restricts file types (no executables: `.exe`, `.sh`, `.bat`, etc.)
- Validates workspace boundaries for all file access
- Implements proper error handling without information disclosure

## [0.0.2] - Initial Release

### Changed
- Updated package version

## [0.0.1] - Initial Release

### Added
- Initial release
- Support for JavaScript/TypeScript imports
- Support for Python imports
- Support for CSS imports
- Intelligent path resolution
- Multi-language detection
