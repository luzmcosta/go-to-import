# Security Policy

## Overview

The Go to Import extension implements multiple security measures to protect users from potential security vulnerabilities when navigating import statements.

## Security Features

### 1. Workspace Trust Requirements
- Extension only operates in trusted workspaces
- Automatically disables in untrusted environments
- Shows warning messages when disabled for security reasons

### 2. Path Validation
- **Path Length Limits**: Prevents DoS attacks with maximum path length of 500 characters
- **Null Byte Protection**: Blocks paths containing null bytes (`\0`)
- **Traversal Depth Limits**: Restricts path traversal (`../`) to maximum 10 levels
- **Character Validation**: Blocks dangerous characters: `<>"|?*`

### 3. File Access Control
- **Workspace Boundary Enforcement**: Only allows access to files within the workspace
- **Scheme Validation**: Only processes `file://` scheme documents
- **Sensitive Directory Blocking**: Prevents access to:
  - `.git` directories
  - `.env` files
  - `node_modules/.bin` executables
  - `.vscode-test` directories
  - Coverage and build output folders

### 4. File Type Restrictions
- **Executable Blocking**: Prevents access to potentially dangerous file types:
  - `.exe`, `.bat`, `.cmd`, `.com`, `.scr`, `.pif`
  - `.sh`, `.bash`, `.zsh`, `.ps1`, `.vbs`, `.jar`

### 5. Input Sanitization
- **Document Size Limits**: Processes documents up to 1MB to prevent DoS
- **Match Limits**: Limits regex matches to prevent infinite loops
- **Path Normalization**: Uses `path.normalize()` for consistent path handling

### 6. Error Handling
- **Safe Error Logging**: Logs errors without exposing sensitive information
- **Graceful Degradation**: Fails safely when security violations are detected
- **No Information Disclosure**: Prevents error messages from revealing system details

## Supported File Access Patterns

### Allowed
- ✅ Relative paths within workspace (`./`, `../`)
- ✅ Node modules imports (`node_modules/`)
- ✅ Common development file types (`.js`, `.ts`, `.py`, `.css`, etc.)
- ✅ Index files in directories

### Blocked
- ❌ Absolute system paths (`/etc/`, `C:\Windows\`)
- ❌ Executable files (`.exe`, `.sh`, etc.)
- ❌ Paths with null bytes or dangerous characters
- ❌ Excessive path traversal attacks
- ❌ Access to sensitive directories (`.git`, `.env`)

## Security Testing

The extension includes comprehensive security tests covering:
- Path validation edge cases
- File access boundary enforcement
- Dangerous file type detection
- Path traversal attack prevention

## Reporting Security Issues

If you discover a security vulnerability, please report it by:

1. **Do NOT** create a public GitHub issue
2. Email the maintainer directly at the repository contact
3. Include detailed steps to reproduce the issue
4. Allow reasonable time for response and fix

## Security Best Practices for Users

1. **Use Trusted Workspaces**: Only enable the extension in workspaces you trust
2. **Review Import Paths**: Be cautious of clicking on suspicious import paths
3. **Keep Extension Updated**: Install security updates promptly
4. **Report Issues**: Report any suspicious behavior immediately

## Security Changelog

### Version 0.0.3 (Security Update)
- Added workspace trust requirement
- Implemented comprehensive path validation
- Added file access control mechanisms
- Enhanced error handling and logging
- Added security test coverage

## Dependencies Security

The extension uses minimal dependencies to reduce attack surface:
- Core Node.js modules (`path`, `fs`)
- VS Code API only
- No external network requests
- No third-party dependencies at runtime

## Threat Model

### Threats Mitigated
1. **Path Traversal Attacks**: Prevented by path validation and workspace boundaries
2. **File System DoS**: Mitigated by size and match limits
3. **Information Disclosure**: Prevented by safe error handling
4. **Unauthorized File Access**: Blocked by access controls

### Limitations
- Cannot prevent all social engineering attacks
- Relies on VS Code's workspace trust mechanism
- Local file system access is inherently required for functionality
