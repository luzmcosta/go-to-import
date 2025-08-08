# Contributing to Go to Import

Thank you for your interest in contributing to Go to Import! 🎉

## 🐛 Reporting Issues

- **Search existing issues** first to avoid duplicates
- **Use the issue template** when creating new issues
- **Provide clear reproduction steps** and examples
- **Include your VS Code version** and operating system

## 💡 Suggesting Features

- **Check existing discussions** for similar ideas
- **Explain the use case** and why it would be valuable
- **Consider backward compatibility** and security implications

## 🔧 Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/luzmcosta/go-to-import.git
   cd go-to-import
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run watch
   ```

4. **Test the extension**
   - Press `F5` to open a new Extension Development Host window
   - Open the `example/` folder in the new window
   - Test the extension functionality

## 🧪 Testing

```bash
# Run all tests
npm test

# Run security tests
npm run test:security

# Lint code
npm run lint

# Type checking
npm run check-types
```

## 📝 Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, focused commits
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass** and code follows our style guide
6. **Submit a pull request** with a clear description

## 🔒 Security Considerations

This extension handles file system access, so security is paramount:

- **Validate all file paths** and prevent path traversal
- **Respect workspace boundaries**
- **Follow the principle of least privilege**
- **Test security implications** of changes
- **Report security issues privately** to the maintainers

## 📋 Code Style

- Follow the existing TypeScript/ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and testable

## 🏷️ Commit Messages

Use clear, descriptive commit messages:

```
feat: add status bar integration for quick access
fix: resolve Cmd+Click conflict on macOS
docs: update README with troubleshooting guide
test: add security validation tests
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤔 Questions?

Feel free to [open a discussion](https://github.com/luzmcosta/go-to-import/discussions) if you have questions!
