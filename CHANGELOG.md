# Change Log

All notable changes to the "go-to-import" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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

## [0.0.2] - Previous Release

### Added
- Initial release
- Support for JavaScript/TypeScript imports
- Support for Python imports
- Support for CSS imports
- Intelligent path resolution
- Multi-language detection

## [Unreleased]

- Initial release
