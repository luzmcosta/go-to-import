// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

/**
 * DocumentLinkProvider that detects import statements and makes file paths clickable
 * Implements security measures to prevent path traversal and unauthorized file access
 */
class ImportLinkProvider implements vscode.DocumentLinkProvider {

	/**
	 * Regular expressions to match different import statement patterns
	 * Enhanced with multiline support and better pattern matching
	 * Limited to safe patterns to prevent code injection
	 */
	private readonly importPatterns = [
		// JavaScript/TypeScript import statements (multiline support)
		/import\s+[\s\S]*?\s+from\s+['"`]([^'"`]+)['"`]/gms,
		/import\s+['"`]([^'"`]+)['"`]/gms,
		/require\(['"`]([^'"`]+)['"`]\)/gms,

		// Python import statements
		/from\s+([^\s]+)\s+import/gms,
		/import\s+([^\s,]+)/gms,

		// CSS/SCSS imports
		/@import\s+['"`]([^'"`]+)['"`]/gms,

		// Dynamic imports
		/import\(['"`]([^'"`]+)['"`]\)/gms,

		// Export statements
		/export\s+[\s\S]*?\s+from\s+['"`]([^'"`]+)['"`]/gms,
	];

	/**
	 * Maximum path length to prevent DoS attacks
	 */
	private readonly MAX_PATH_LENGTH = 500;

	/**
	 * Maximum traversal depth to prevent path traversal attacks
	 */
	private readonly MAX_TRAVERSAL_DEPTH = 10;

	async provideDocumentLinks(
		document: vscode.TextDocument,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_token: vscode.CancellationToken
	): Promise<vscode.DocumentLink[]> {
		// Security check: Only operate on trusted workspaces
		if (!vscode.workspace.isTrusted) {
			return [];
		}

		// Security check: Only process files within the workspace
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return [];
		}

		// Security check: Only process file:// scheme documents
		if (document.uri.scheme !== 'file') {
			return [];
		}

		const links: vscode.DocumentLink[] = [];
		const text = document.getText();

		// Security check: Limit document size to prevent DoS
		if (text.length > 1024 * 1024) { // 1MB limit
			console.warn('Go to Import: Document too large, skipping link detection');
			return [];
		}

		for (const pattern of this.importPatterns) {
			pattern.lastIndex = 0; // Reset regex state
			let match;
			let matchCount = 0;

			while ((match = pattern.exec(text)) !== null && matchCount < 1000) { // Limit matches
				matchCount++;
				const importPath = match[1];

				// Security validation of import path
				if (!this.isValidImportPath(importPath)) {
					continue;
				}

				const matchStart = match.index + match[0].indexOf(importPath);
				const matchEnd = matchStart + importPath.length;

				const startPos = document.positionAt(matchStart);
				const endPos = document.positionAt(matchEnd);
				const range = new vscode.Range(startPos, endPos);

				const resolvedPath = await this.resolveImportPath(document, importPath);
				if (resolvedPath) {
					const link = new vscode.DocumentLink(range, vscode.Uri.file(resolvedPath));

					// Enhanced tooltip with file status and type
					const isMac = process.platform === 'darwin';
					const modifier = isMac ? 'Cmd' : 'Ctrl';
					const fileName = path.basename(resolvedPath);

					// Determine import type for tooltip
					let importType = '';
					let statusEmoji = '';

					if (resolvedPath.includes('node_modules')) {
						importType = ' (NPM package)';
						statusEmoji = '📦 ';
					} else if (importPath.startsWith('@') || importPath.startsWith('~')) {
						importType = ' (Path alias)';
						statusEmoji = '🔗 ';
					} else if (importPath.startsWith('./') || importPath.startsWith('../')) {
						importType = ' (Relative path)';
						statusEmoji = '📁 ';
					} else {
						importType = ' (Local file)';
						statusEmoji = '📄 ';
					}

					// Check if it's a directory
					const isDirectory = await this.directoryExists(resolvedPath);
					if (isDirectory) {
						statusEmoji = '📂 ';
						importType = ' (Directory)';
					}

					link.tooltip = `${statusEmoji}Jump to ${fileName}${importType} (${modifier}+Click)`;
					links.push(link);
				}
			}
		}

		return links;
	}

	/**
	 * Validates import path to prevent security issues
	 */
	private isValidImportPath(importPath: string): boolean {
		// Security check: Path length validation
		if (importPath.length > this.MAX_PATH_LENGTH) {
			return false;
		}

		// Security check: No null bytes
		if (importPath.includes('\0')) {
			return false;
		}

		// Security check: Limit path traversal depth
		const traversalMatches = importPath.match(/\.\./g);
		if (traversalMatches && traversalMatches.length > this.MAX_TRAVERSAL_DEPTH) {
			return false;
		}

		// Security check: No absolute paths outside workspace (except for node_modules)
		if (path.isAbsolute(importPath) && !importPath.includes('node_modules')) {
			return false;
		}

		// Security check: Block dangerous characters and patterns
		const dangerousPatterns = [
			/[<>"|?*]/,  // Invalid filename characters
			/^\s*$/,     // Empty or whitespace only
			/\.\.\//,    // Consecutive path traversal (additional check)
		];

		for (const pattern of dangerousPatterns) {
			if (pattern.test(importPath)) {
				return false;
			}
		}

		// Security check: Block known dangerous paths
		const forbiddenPaths = [
			'/etc/',
			'/usr/',
			'/bin/',
			'/sbin/',
			'/proc/',
			'/sys/',
			'C:\\Windows\\',
			'C:\\System',
		];

		const lowerPath = importPath.toLowerCase();
		for (const forbidden of forbiddenPaths) {
			if (lowerPath.startsWith(forbidden.toLowerCase())) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Resolves library imports to node_modules files if enabled
	 */
	private async resolveLibraryPath(workspaceRoot: string, importPath: string): Promise<string | null> {
		const config = vscode.workspace.getConfiguration('go-to-import');
		const enableLibraryNavigation = config.get('enableLibraryNavigation', false);

		if (!enableLibraryNavigation) {
			return null;
		}

		// Only resolve library imports (no relative paths)
		if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('/')) {
			return null;
		}

		// Handle scoped packages (@org/package)
		const packageName = importPath.startsWith('@')
			? importPath.split('/').slice(0, 2).join('/')
			: importPath.split('/')[0];

		const nodeModulesPath = path.join(workspaceRoot, 'node_modules', packageName);

		try {
			// Check if package exists
			if (!(await this.directoryExists(nodeModulesPath))) {
				return null;
			}

			// Try to find package.json
			const packageJsonPath = path.join(nodeModulesPath, 'package.json');
			if (await this.fileExists(packageJsonPath)) {
				const packageJsonContent = await fsPromises.readFile(packageJsonPath, 'utf8');
				const packageInfo = JSON.parse(packageJsonContent);

				// Try main field, then index files
				if (packageInfo.main) {
					const mainPath = path.join(nodeModulesPath, packageInfo.main);
					if (await this.fileExists(mainPath)) {
						return mainPath;
					}
				}
			}

			// Try common entry points
			const entryPoints = ['index.js', 'index.ts', 'index.jsx', 'index.tsx', 'lib/index.js', 'dist/index.js'];
			for (const entry of entryPoints) {
				const entryPath = path.join(nodeModulesPath, entry);
				if (await this.fileExists(entryPath)) {
					return entryPath;
				}
			}

			// If no specific file found, return the package directory
			return nodeModulesPath;
		} catch (error) {
			console.warn('Go to Import: Error resolving library path:', error instanceof Error ? error.message : 'Unknown error');
			return null;
		}
	}

	/**
	 * Resolves path aliases from vite.config.js, tsconfig.json, or webpack config
	 */
	private async resolvePathAlias(workspaceRoot: string, importPath: string, documentPath?: string): Promise<string | null> {
		// Check for common path alias patterns
		if (!importPath.startsWith('@') && !importPath.startsWith('~') && !importPath.startsWith('src/')) {
			return null;
		}

		try {
			// Start from the document directory and traverse up to find config files
			const searchStartDir = documentPath ? path.dirname(documentPath) : workspaceRoot;

			// Try to find vite config files by traversing up directories
			const viteConfig = await this.findConfigFileUp(searchStartDir, workspaceRoot, [
				'vite.config.js',
				'vite.config.ts',
				'vite.config.mjs',
				'vitest.config.js',
				'vitest.config.ts'
			]);

			if (viteConfig) {
				const alias = await this.parseViteConfig(viteConfig, importPath);
				if (alias) return alias;
			}

			// Try to find TypeScript config files
			const tsConfig = await this.findConfigFileUp(searchStartDir, workspaceRoot, [
				'tsconfig.json',
				'jsconfig.json'
			]);

			if (tsConfig) {
				const alias = await this.parseTsConfig(tsConfig, importPath);
				if (alias) return alias;
			}

			// Try to find webpack config files
			const webpackConfig = await this.findConfigFileUp(searchStartDir, workspaceRoot, [
				'webpack.config.js',
				'webpack.config.ts',
				'webpack.config.babel.js',
				'craco.config.js'
			]);

			if (webpackConfig) {
				const alias = await this.parseWebpackConfig(webpackConfig, importPath);
				if (alias) return alias;
			}

			// Fallback common patterns
			if (importPath.startsWith('@/')) {
				const srcPath = path.join(workspaceRoot, 'src', importPath.slice(2));
				if (await this.fileExists(srcPath) || await this.directoryExists(srcPath)) {
					return srcPath;
				}
			}

			if (importPath.startsWith('~/')) {
				const rootPath = path.join(workspaceRoot, importPath.slice(2));
				if (await this.fileExists(rootPath) || await this.directoryExists(rootPath)) {
					return rootPath;
				}
			}

			if (importPath.startsWith('src/')) {
				const srcPath = path.join(workspaceRoot, importPath);
				if (await this.fileExists(srcPath) || await this.directoryExists(srcPath)) {
					return srcPath;
				}
			}

		} catch (error) {
			console.warn('Go to Import: Error resolving path alias:', error instanceof Error ? error.message : 'Unknown error');
		}

		return null;
	}

	/**
	 * Find a config file by traversing up directories from startDir to maxDir
	 */
	private async findConfigFileUp(startDir: string, maxDir: string, configFiles: string[]): Promise<string | null> {
		let currentDir = path.resolve(startDir);
		const normalizedMaxDir = path.resolve(maxDir);

		// Ensure we don't traverse above the workspace root
		while (currentDir.startsWith(normalizedMaxDir) && currentDir.length >= normalizedMaxDir.length) {
			for (const configFile of configFiles) {
				const configPath = path.join(currentDir, configFile);
				if (await this.fileExists(configPath)) {
					console.log(`Go to Import: Found config file: ${configPath}`);
					return configPath;
				}
			}

			const parentDir = path.dirname(currentDir);
			// Break if we've reached the root or can't go up further
			if (parentDir === currentDir) {
				break;
			}
			currentDir = parentDir;
		}

		return null;
	}

	/**
	 * Parse webpack config for path aliases
	 */
	private async parseWebpackConfig(configPath: string, importPath: string): Promise<string | null> {
		try {
			const configContent = await fsPromises.readFile(configPath, 'utf8');
			const configDir = path.dirname(configPath);

			// Simple regex to extract resolve.alias definitions
			const aliasMatches = configContent.match(/resolve\s*:\s*{[^}]*alias\s*:\s*{([^}]+)}/s) ||
							   configContent.match(/alias\s*:\s*{([^}]+)}/s);
			if (!aliasMatches) return null;

			const aliasContent = aliasMatches[1];

			// Extract alias definitions
			const aliasRegex = /['"`]?([^'"`:\s]+)['"`]?\s*:\s*['"`]([^'"`]+)['"`]/g;
			let match;

			while ((match = aliasRegex.exec(aliasContent)) !== null) {
				const [, alias, aliasPath] = match;
				if (importPath.startsWith(alias)) {
					const resolvedPath = importPath.replace(alias, aliasPath);
					return path.resolve(configDir, resolvedPath);
				}
			}
		} catch (error) {
			console.warn('Go to Import: Error parsing webpack config:', error instanceof Error ? error.message : 'Unknown error');
		}
		return null;
	}

	/**
	 * Parse vite.config.js for path aliases
	 */
	private async parseViteConfig(configPath: string, importPath: string): Promise<string | null> {
		try {
			const configContent = await fsPromises.readFile(configPath, 'utf8');
			const configDir = path.dirname(configPath);

			// Enhanced regex to extract alias definitions from vite config
			const aliasMatches = configContent.match(/alias\s*:\s*{([^}]+)}/s);
			if (!aliasMatches) return null;

			const aliasContent = aliasMatches[1];

			// Handle different alias syntax patterns:
			// 1. Simple quoted strings: '@': './src'
			// 2. fileURLToPath syntax: '@': fileURLToPath(new URL('./src', import.meta.url))
			// 3. path.resolve syntax: '@': path.resolve(__dirname, 'src')

			const patterns = [
				// Pattern 1: fileURLToPath(new URL('path', import.meta.url))
				/['"`]?([^'"`:\s]+)['"`]?\s*:\s*fileURLToPath\s*\(\s*new\s+URL\s*\(\s*['"`]([^'"`]+)['"`]/g,

				// Pattern 2: Simple quoted strings
				/['"`]?([^'"`:\s]+)['"`]?\s*:\s*['"`]([^'"`]+)['"`]/g,

				// Pattern 3: path.resolve or other function calls
				/['"`]?([^'"`:\s]+)['"`]?\s*:\s*path\.resolve\s*\([^,]+,\s*['"`]([^'"`]+)['"`]/g
			];

			for (const aliasRegex of patterns) {
				aliasRegex.lastIndex = 0; // Reset regex state
				let match;

				while ((match = aliasRegex.exec(aliasContent)) !== null) {
					const [, alias, aliasPath] = match;
					if (importPath.startsWith(alias)) {
						const resolvedPath = importPath.replace(alias, aliasPath);
						// Make path relative to config file directory
						const finalPath = path.resolve(configDir, resolvedPath);

						// Debug logging to verify subdirectory config is being used
						console.log(`Go to Import: Resolved alias '${alias}' -> '${aliasPath}' from config: ${configPath}`);
						console.log(`Go to Import: Final resolved path: ${finalPath}`);

						return finalPath;
					}
				}
			}
		} catch (error) {
			console.warn('Go to Import: Error parsing vite config:', error instanceof Error ? error.message : 'Unknown error');
		}
		return null;
	}	/**
	 * Parse tsconfig.json for path aliases
	 */
	private async parseTsConfig(configPath: string, importPath: string): Promise<string | null> {
		try {
			const configContent = await fsPromises.readFile(configPath, 'utf8');
			const configDir = path.dirname(configPath);

			// Remove comments and parse JSON
			const cleanedContent = configContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
			const config = JSON.parse(cleanedContent);

			const paths = config?.compilerOptions?.paths;
			if (!paths) return null;

			for (const [pattern, mappings] of Object.entries(paths)) {
				if (Array.isArray(mappings) && mappings.length > 0) {
					// Convert TypeScript path pattern to regex
					const regexPattern = pattern.replace(/\*/g, '(.*)');
					const regex = new RegExp(`^${regexPattern}$`);
					const match = importPath.match(regex);

					if (match) {
						const mapping = mappings[0].replace(/\*/g, match[1] || '');
						const baseUrl = config?.compilerOptions?.baseUrl || '.';
						return path.resolve(configDir, baseUrl, mapping);
					}
				}
			}
		} catch (error) {
			console.warn('Go to Import: Error parsing tsconfig:', error instanceof Error ? error.message : 'Unknown error');
		}
		return null;
	}

	/**
	 * Resolves the import path to an absolute file path
	 */
	private async resolveImportPath(document: vscode.TextDocument, importPath: string): Promise<string | null> {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return null;
		}

		const documentDir = path.dirname(document.uri.fsPath);
		const workspaceRoot = workspaceFolder.uri.fsPath;
		let resolvedPath: string;

		try {
			// First try path aliases (vite, webpack, tsconfig) - start search from document location
			const aliasPath = await this.resolvePathAlias(workspaceRoot, importPath, document.uri.fsPath);
			if (aliasPath) {
				resolvedPath = aliasPath;
			}
			// Handle relative paths
			else if (importPath.startsWith('./') || importPath.startsWith('../')) {
				resolvedPath = path.resolve(documentDir, importPath);
			}
			// Handle absolute paths from workspace root
			else if (importPath.startsWith('/')) {
				resolvedPath = path.join(workspaceRoot, importPath);
			}
			// Handle library imports (npm packages)
			else if (!path.isAbsolute(importPath)) {
				// Try library path first
				const libraryPath = await this.resolveLibraryPath(workspaceRoot, importPath);
				if (libraryPath) {
					return libraryPath; // Return early for library paths
				}

				// Try relative to current file
				resolvedPath = path.resolve(documentDir, importPath);
				if (!(await this.fileExists(resolvedPath))) {
					// Try common extensions
					const withExtensions = await this.tryCommonExtensions(resolvedPath);
					if (withExtensions) {
						resolvedPath = withExtensions;
					} else {
						// Try workspace relative
						resolvedPath = path.join(workspaceRoot, importPath);
					}
				}
			}
			// Already absolute path
			else {
				resolvedPath = importPath;
			}

			// Security check: Ensure resolved path is within workspace or node_modules
			const normalizedPath = path.normalize(resolvedPath);
			const normalizedWorkspace = path.normalize(workspaceRoot);

			if (!normalizedPath.startsWith(normalizedWorkspace)) {
				// Allow node_modules access from parent directories
				const nodeModulesPattern = /node_modules/;
				if (!nodeModulesPattern.test(normalizedPath)) {
					console.warn(`Go to Import: Path outside workspace blocked: ${normalizedPath}`);
					return null;
				}
			}

			// Try common file extensions if no extension provided
			if (!path.extname(resolvedPath)) {
				const withExtension = await this.tryCommonExtensions(resolvedPath);
				if (withExtension) {
					resolvedPath = withExtension;
				}
			}

			// Security check: Final validation before returning
			if (!this.isFileAccessAllowed(resolvedPath, workspaceRoot)) {
				return null;
			}

			// Check if file exists
			return (await this.fileExists(resolvedPath)) ? resolvedPath : null;
		} catch (error) {
			// Log error for debugging but don't expose details
			console.warn('Go to Import: Error resolving path:', error instanceof Error ? error.message : 'Unknown error');
			return null;
		}
	}

	/**
	 * Validates if file access is allowed for security purposes
	 */
	private isFileAccessAllowed(filePath: string, workspaceRoot: string): boolean {
		try {
			const normalizedPath = path.normalize(filePath);
			const normalizedWorkspace = path.normalize(workspaceRoot);

			// Security check: Ensure path is within workspace
			if (!normalizedPath.startsWith(normalizedWorkspace)) {
				// Allow node_modules access
				if (normalizedPath.includes('node_modules')) {
					return true;
				}
				return false;
			}

			// Security check: Block access to sensitive directories
			const sensitiveDirectories = [
				'.git',
				'.env',
				'node_modules/.bin',
				'.vscode-test',
				'.nyc_output',
				'coverage',
			];

			for (const sensitive of sensitiveDirectories) {
				if (normalizedPath.includes(path.sep + sensitive + path.sep) ||
					normalizedPath.endsWith(path.sep + sensitive)) {
					return false;
				}
			}

			// Security check: Block executable files
			const dangerousExtensions = [
				'.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
				'.sh', '.bash', '.zsh', '.ps1', '.vbs', '.jar'
			];

			const fileExtension = path.extname(normalizedPath).toLowerCase();
			if (dangerousExtensions.includes(fileExtension)) {
				return false;
			}

			return true;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// If there's any error in validation, deny access
			return false;
		}
	}

	/**
	 * Try common file extensions for the given path
	 */
	private async tryCommonExtensions(basePath: string): Promise<string | null> {
		const extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.css', '.scss', '.less', '.json'];

		for (const ext of extensions) {
			const pathWithExt = basePath + ext;
			if (await this.fileExists(pathWithExt)) {
				return pathWithExt;
			}
		}

		// Try index files in directories
		if (await this.directoryExists(basePath)) {
			for (const ext of extensions) {
				const indexPath = path.join(basePath, 'index' + ext);
				if (await this.fileExists(indexPath)) {
					return indexPath;
				}
			}
		}

		return null;
	}

	/**
	 * Check if file exists with proper error handling
	 */
	private async fileExists(filePath: string): Promise<boolean> {
		try {
			// Additional security check before file system access
			if (!filePath || typeof filePath !== 'string') {
				return false;
			}

			const stat = await fsPromises.stat(filePath);
			return stat.isFile();
		} catch (error) {
			// Don't log ENOENT errors as they're expected, but log others for debugging
			if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
				console.warn('Go to Import: File access error:', error.message);
			}
			return false;
		}
	}

	/**
	 * Check if directory exists with proper error handling
	 */
	private async directoryExists(dirPath: string): Promise<boolean> {
		try {
			// Additional security check before file system access
			if (!dirPath || typeof dirPath !== 'string') {
				return false;
			}

			const stat = await fsPromises.stat(dirPath);
			return stat.isDirectory();
		} catch (error) {
			// Don't log ENOENT errors as they're expected, but log others for debugging
			if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
				console.warn('Go to Import: Directory access error:', error.message);
			}
			return false;
		}
	}
}

/**
 * HoverProvider that shows detailed information about import paths
 * Provides rich visual feedback for both successful and failed import resolutions
 */
class ImportHoverProvider implements vscode.HoverProvider {
	private linkProvider = new ImportLinkProvider();

	async provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_token: vscode.CancellationToken
	): Promise<vscode.Hover | null> {
		// Security check: Only operate on trusted workspaces
		if (!vscode.workspace.isTrusted) {
			return null;
		}

		// Security check: Only process files within the workspace
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return null;
		}

		// Security check: Only process file:// scheme documents
		if (document.uri.scheme !== 'file') {
			return null;
		}

		// Find import path at cursor position
		const importInfo = this.getImportAtPosition(document, position);
		if (!importInfo) {
			return null;
		}

		const { importPath, range } = importInfo;

		// Generate detailed hover information
		const hoverContent = await this.generateHoverContent(document, importPath);
		if (!hoverContent) {
			return null;
		}

		return new vscode.Hover(hoverContent, range);
	}

	/**
	 * Extract import path at the given position
	 */
	private getImportAtPosition(document: vscode.TextDocument, position: vscode.Position): { importPath: string; range: vscode.Range } | null {
		const line = document.lineAt(position.line);
		const text = line.text;

		// Check all import patterns
		const patterns = [
			/import\s+[\s\S]*?\s+from\s+['"`]([^'"`]+)['"`]/g,
			/import\s+['"`]([^'"`]+)['"`]/g,
			/require\(['"`]([^'"`]+)['"`]\)/g,
			/@import\s+['"`]([^'"`]+)['"`]/g,
			/import\(['"`]([^'"`]+)['"`]\)/g,
			/export\s+[\s\S]*?\s+from\s+['"`]([^'"`]+)['"`]/g,
			/from\s+([^\s]+)\s+import/g,
			/import\s+([^\s,]+)/g,
		];

		for (const pattern of patterns) {
			pattern.lastIndex = 0;
			let match;

			while ((match = pattern.exec(text)) !== null) {
				const importPath = match[1];
				const matchStart = match.index + match[0].indexOf(importPath);
				const matchEnd = matchStart + importPath.length;

				// Check if cursor is within the import path
				if (position.character >= matchStart && position.character <= matchEnd) {
					const startPos = new vscode.Position(position.line, matchStart);
					const endPos = new vscode.Position(position.line, matchEnd);
					const range = new vscode.Range(startPos, endPos);

					return { importPath, range };
				}
			}
		}

		return null;
	}

	/**
	 * Generate rich hover content for the import path
	 */
	private async generateHoverContent(document: vscode.TextDocument, importPath: string): Promise<vscode.MarkdownString | null> {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return null;
		}

		const workspaceRoot = workspaceFolder.uri.fsPath;
		const documentDir = path.dirname(document.uri.fsPath);
		const isMac = process.platform === 'darwin';
		const modifier = isMac ? 'Cmd' : 'Ctrl';

		// Try to resolve the import path
		const resolvedPath = await this.linkProvider['resolveImportPath'](document, importPath);

		const markdown = new vscode.MarkdownString();
		markdown.isTrusted = true;

		if (resolvedPath) {
			// SUCCESS CASE
			const fileName = path.basename(resolvedPath);
			const relativePath = path.relative(workspaceRoot, resolvedPath);
			const isDirectory = await this.linkProvider['directoryExists'](resolvedPath);

			let emoji = '📄';
			let typeDescription = 'File';

			if (isDirectory) {
				emoji = '📂';
				typeDescription = 'Directory';
			} else if (resolvedPath.includes('node_modules')) {
				emoji = '📦';
				typeDescription = 'NPM Package';
			} else if (importPath.startsWith('@') || importPath.startsWith('~')) {
				emoji = '🔗';
				typeDescription = 'Path Alias';
			} else if (importPath.startsWith('./') || importPath.startsWith('../')) {
				emoji = '📁';
				typeDescription = 'Relative Import';
			}

			markdown.appendMarkdown(`### ${emoji} ${typeDescription} Found\n\n`);
			markdown.appendMarkdown(`**File:** \`${fileName}\`\n\n`);
			markdown.appendMarkdown(`**Path:** \`${relativePath}\`\n\n`);
			markdown.appendMarkdown(`💡 **${modifier}+Click** to open\n\n`);

			// Add additional context for libraries
			if (resolvedPath.includes('node_modules')) {
				const config = vscode.workspace.getConfiguration('go-to-import');
				const enableLibraryNavigation = config.get('enableLibraryNavigation', false);

				if (enableLibraryNavigation) {
					markdown.appendMarkdown(`ℹ️ Library navigation is **enabled**\n\n`);
				} else {
					markdown.appendMarkdown(`⚠️ Library navigation is **disabled** - enable in settings to navigate to packages\n\n`);
				}
			}

		} else {
			// ERROR CASE - show what paths were attempted
			markdown.appendMarkdown(`### ❌ File Not Found\n\n`);
			markdown.appendMarkdown(`**Import:** \`${importPath}\`\n\n`);
			markdown.appendMarkdown(`🔍 **Searched paths:**\n\n`);

			// Generate list of attempted paths
			const attemptedPaths = await this.generateAttemptedPaths(workspaceRoot, documentDir, importPath);

			for (const attemptedPath of attemptedPaths) {
				const relativePath = path.relative(workspaceRoot, attemptedPath);
				markdown.appendMarkdown(`• \`${relativePath}\`\n`);
			}

			markdown.appendMarkdown(`\n💡 **Suggestions:**\n`);
			markdown.appendMarkdown(`• Check if the file exists\n`);
			markdown.appendMarkdown(`• Verify the import path is correct\n`);
			markdown.appendMarkdown(`• Check path aliases in vite.config.js or tsconfig.json\n`);

			// Check if it might be a library import
			if (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/')) {
				markdown.appendMarkdown(`• This might be an NPM package - enable library navigation in settings\n`);
			}
		}

		return markdown;
	}

	/**
	 * Generate list of paths that would be attempted during resolution
	 */
	private async generateAttemptedPaths(workspaceRoot: string, documentDir: string, importPath: string): Promise<string[]> {
		const paths: string[] = [];
		const extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.css', '.scss', '.less', '.json'];

		// Handle different import types
		if (importPath.startsWith('./') || importPath.startsWith('../')) {
			// Relative paths
			const basePath = path.resolve(documentDir, importPath);
			paths.push(basePath);

			// Try with extensions
			for (const ext of extensions) {
				paths.push(basePath + ext);
			}

			// Try index files in directory
			for (const ext of extensions) {
				paths.push(path.join(basePath, 'index' + ext));
			}

		} else if (importPath.startsWith('/')) {
			// Absolute paths from workspace root
			const basePath = path.join(workspaceRoot, importPath);
			paths.push(basePath);

			for (const ext of extensions) {
				paths.push(basePath + ext);
			}

		} else if (importPath.startsWith('@') || importPath.startsWith('~')) {
			// Path aliases
			paths.push(path.join(workspaceRoot, 'src', importPath.slice(2)));
			paths.push(path.join(workspaceRoot, importPath.slice(2)));

			// Try with extensions
			const srcPath = path.join(workspaceRoot, 'src', importPath.slice(2));
			for (const ext of extensions) {
				paths.push(srcPath + ext);
			}

		} else {
			// Library or relative without ./
			const relativePath = path.resolve(documentDir, importPath);
			const workspacePath = path.join(workspaceRoot, importPath);
			const nodeModulesPath = path.join(workspaceRoot, 'node_modules', importPath);

			paths.push(relativePath);
			paths.push(workspacePath);
			paths.push(nodeModulesPath);

			// Try with extensions
			for (const ext of extensions) {
				paths.push(relativePath + ext);
				paths.push(workspacePath + ext);
			}
		}

		return paths;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Go to Import extension is now active!');

	// Security check: Only activate in trusted workspaces
	if (!vscode.workspace.isTrusted) {
		console.warn('Go to Import: Extension disabled in untrusted workspace');
		vscode.window.showWarningMessage('Go to Import extension is disabled in untrusted workspaces for security reasons.');
		return;
	}

	// Show helpful message about Cmd-Click on macOS
	if (process.platform === 'darwin') {
		const config = vscode.workspace.getConfiguration('editor');
		const goToImportConfig = vscode.workspace.getConfiguration('go-to-import');
		const multiCursorModifier = config.get('multiCursorModifier');
		const showHelpNotification = goToImportConfig.get('showHelpNotification', true);

		if (multiCursorModifier === 'ctrlCmd' && showHelpNotification) {
			console.log('Go to Import: Detected Cmd+Click may conflict with multi-cursor. Consider changing editor.multiCursorModifier to "altKey"');

			// Show one-time notification with helpful tip
			const hasShownTip = context.globalState.get('go-to-import.hasShownCmdClickTip', false);
			if (!hasShownTip) {
				vscode.window.showInformationMessage(
					'Go to Import: If Cmd+Click creates multiple cursors instead of jumping to files, try changing "editor.multiCursorModifier" to "altKey" in settings, or use Cmd+Shift+G.',
					'Open Settings',
					'Don\'t show again'
				).then(choice => {
					if (choice === 'Open Settings') {
						vscode.commands.executeCommand('workbench.action.openSettings', 'editor.multiCursorModifier');
					}
					context.globalState.update('go-to-import.hasShownCmdClickTip', true);
				});
			}
		}
	}

	// Register workspace trust change handler
	const trustChangeDisposable = vscode.workspace.onDidGrantWorkspaceTrust(() => {
		vscode.window.showInformationMessage('Go to Import extension is now active in trusted workspace!');
		// Re-register providers when workspace becomes trusted
		registerLinkProviders(context);
	});
	context.subscriptions.push(trustChangeDisposable);

	// Register the document link providers
	registerLinkProviders(context);

	// Keep the hello world command for testing
	const helloWorldDisposable = vscode.commands.registerCommand('go-to-import.helloWorld', () => {
		vscode.window.showInformationMessage('Go to Import extension is working! Try clicking on an import path.');
	});

	context.subscriptions.push(helloWorldDisposable);

	// Register jump to import command
	const jumpToImportDisposable = vscode.commands.registerCommand('go-to-import.jumpToImport', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor');
			return;
		}

		const document = editor.document;
		const position = editor.selection.active;
		const linkProvider = new ImportLinkProvider();

		// Get all document links
		const links = await linkProvider.provideDocumentLinks(document, new vscode.CancellationTokenSource().token);
		if (!links || links.length === 0) {
			vscode.window.showInformationMessage('No import links found in this document');
			return;
		}

		// Find link at cursor position
		const linkAtPosition = links.find(link => link.range.contains(position));

		if (linkAtPosition && linkAtPosition.target) {
			// Open the target file
			try {
				const doc = await vscode.workspace.openTextDocument(linkAtPosition.target);
				await vscode.window.showTextDocument(doc);
			} catch (error) {
				vscode.window.showErrorMessage(`Could not open file: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		} else {
			// Show quick pick with all available imports
			const items = links
				.filter(link => link.target)
				.map(link => ({
					label: path.basename(link.target!.fsPath),
					description: link.target!.fsPath,
					detail: document.getText(link.range),
					target: link.target!
				}));

			if (items.length === 0) {
				vscode.window.showInformationMessage('No valid import links found');
				return;
			}

			const selected = await vscode.window.showQuickPick(items, {
				placeHolder: 'Select an import to jump to',
				matchOnDescription: true,
				matchOnDetail: true
			});

			if (selected) {
				try {
					const doc = await vscode.workspace.openTextDocument(selected.target);
					await vscode.window.showTextDocument(doc);
				} catch (error) {
					vscode.window.showErrorMessage(`Could not open file: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}
		}
	});

	context.subscriptions.push(jumpToImportDisposable);

	// Create status bar item for quick access
	const goToImportConfig = vscode.workspace.getConfiguration('go-to-import');
	const enableStatusBar = goToImportConfig.get('enableStatusBar', true);

	if (enableStatusBar) {
		const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		statusBarItem.command = 'go-to-import.jumpToImport';
		statusBarItem.text = '$(link) Go to Import';
		statusBarItem.tooltip = 'Jump to Import File (Cmd+Shift+G)';

		// Show status bar item only when in supported files
		const updateStatusBar = () => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const supportedLanguages = [
					'javascript', 'typescript', 'javascriptreact', 'typescriptreact',
					'python', 'css', 'scss', 'less', 'json', 'vue', 'svelte'
				];
				if (supportedLanguages.includes(editor.document.languageId)) {
					statusBarItem.show();
				} else {
					statusBarItem.hide();
				}
			} else {
				statusBarItem.hide();
			}
		};

		// Update status bar when active editor changes
		vscode.window.onDidChangeActiveTextEditor(updateStatusBar);
		updateStatusBar(); // Initial update

		context.subscriptions.push(statusBarItem);
	}
}

/**
 * Register document link providers for supported languages
 */
function registerLinkProviders(context: vscode.ExtensionContext) {
	// Register the document link provider for various languages
	const languages = [
		'javascript',
		'typescript',
		'javascriptreact',
		'typescriptreact',
		'python',
		'css',
		'scss',
		'less',
		'json',
		'vue',
		'svelte'
	];

	const linkProvider = new ImportLinkProvider();
	const hoverProvider = new ImportHoverProvider();

	for (const language of languages) {
		// Register document link provider
		const linkDisposable = vscode.languages.registerDocumentLinkProvider(
			{ language, scheme: 'file' }, // Only register for file scheme
			linkProvider
		);
		context.subscriptions.push(linkDisposable);

		// Register hover provider for rich visual feedback
		const hoverDisposable = vscode.languages.registerHoverProvider(
			{ language, scheme: 'file' },
			hoverProvider
		);
		context.subscriptions.push(hoverDisposable);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
