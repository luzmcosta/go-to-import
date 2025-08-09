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
	 * Limited to safe patterns to prevent code injection
	 */
	private readonly importPatterns = [
		// JavaScript/TypeScript import statements
		/import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g,
		/import\s+['"`]([^'"`]+)['"`]/g,
		/require\(['"`]([^'"`]+)['"`]\)/g,

		// Python import statements
		/from\s+([^\s]+)\s+import/g,
		/import\s+([^\s,]+)/g,

		// CSS/SCSS imports
		/@import\s+['"`]([^'"`]+)['"`]/g,

		// Dynamic imports
		/import\(['"`]([^'"`]+)['"`]\)/g,
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
					// Add tooltip with platform-specific instructions
					const isMac = process.platform === 'darwin';
					const modifier = isMac ? 'Cmd' : 'Ctrl';
					link.tooltip = `Jump to ${path.basename(resolvedPath)} (${modifier}+Click, or right-click for context menu)`;
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
			// Handle relative paths
			if (importPath.startsWith('./') || importPath.startsWith('../')) {
				resolvedPath = path.resolve(documentDir, importPath);
			}
			// Handle absolute paths from workspace root
			else if (importPath.startsWith('/')) {
				resolvedPath = path.join(workspaceRoot, importPath);
			}
			// Handle node_modules or other relative imports without explicit ./
			else if (!path.isAbsolute(importPath)) {
				// First try relative to current file
				resolvedPath = path.resolve(documentDir, importPath);
				if (!(await this.fileExists(resolvedPath))) {
					// Try common extensions
					const withExtensions = await this.tryCommonExtensions(resolvedPath);
					if (withExtensions) {
						resolvedPath = withExtensions;
					} else {
						// Try node_modules or workspace relative
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

	for (const language of languages) {
		const disposable = vscode.languages.registerDocumentLinkProvider(
			{ language, scheme: 'file' }, // Only register for file scheme
			linkProvider
		);
		context.subscriptions.push(disposable);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
