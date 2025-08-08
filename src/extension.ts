// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * DocumentLinkProvider that detects import statements and makes file paths clickable
 */
class ImportLinkProvider implements vscode.DocumentLinkProvider {

	/**
	 * Regular expressions to match different import statement patterns
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

	provideDocumentLinks(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.DocumentLink[]> {
		const links: vscode.DocumentLink[] = [];
		const text = document.getText();

		for (const pattern of this.importPatterns) {
			pattern.lastIndex = 0; // Reset regex state
			let match;

			while ((match = pattern.exec(text)) !== null) {
				const importPath = match[1];
				const matchStart = match.index + match[0].indexOf(importPath);
				const matchEnd = matchStart + importPath.length;

				const startPos = document.positionAt(matchStart);
				const endPos = document.positionAt(matchEnd);
				const range = new vscode.Range(startPos, endPos);

				const resolvedPath = this.resolveImportPath(document, importPath);
				if (resolvedPath) {
					const link = new vscode.DocumentLink(range, vscode.Uri.file(resolvedPath));
					links.push(link);
				}
			}
		}

		return links;
	}

	/**
	 * Resolves the import path to an absolute file path
	 */
	private resolveImportPath(document: vscode.TextDocument, importPath: string): string | null {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return null;
		}

		const documentDir = path.dirname(document.uri.fsPath);
		let resolvedPath: string;

		// Handle relative paths
		if (importPath.startsWith('./') || importPath.startsWith('../')) {
			resolvedPath = path.resolve(documentDir, importPath);
		}
		// Handle absolute paths from workspace root
		else if (importPath.startsWith('/')) {
			resolvedPath = path.join(workspaceFolder.uri.fsPath, importPath);
		}
		// Handle node_modules or other relative imports without explicit ./
		else if (!path.isAbsolute(importPath)) {
			// First try relative to current file
			resolvedPath = path.resolve(documentDir, importPath);
			if (!this.fileExists(resolvedPath)) {
				// Try common extensions
				const withExtensions = this.tryCommonExtensions(resolvedPath);
				if (withExtensions) {
					resolvedPath = withExtensions;
				} else {
					// Try node_modules or workspace relative
					resolvedPath = path.join(workspaceFolder.uri.fsPath, importPath);
				}
			}
		}
		// Already absolute path
		else {
			resolvedPath = importPath;
		}

		// Try common file extensions if no extension provided
		if (!path.extname(resolvedPath)) {
			const withExtension = this.tryCommonExtensions(resolvedPath);
			if (withExtension) {
				resolvedPath = withExtension;
			}
		}

		// Check if file exists
		return this.fileExists(resolvedPath) ? resolvedPath : null;
	}

	/**
	 * Try common file extensions for the given path
	 */
	private tryCommonExtensions(basePath: string): string | null {
		const extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.css', '.scss', '.less', '.json'];

		for (const ext of extensions) {
			const pathWithExt = basePath + ext;
			if (this.fileExists(pathWithExt)) {
				return pathWithExt;
			}
		}

		// Try index files in directories
		if (this.directoryExists(basePath)) {
			for (const ext of extensions) {
				const indexPath = path.join(basePath, 'index' + ext);
				if (this.fileExists(indexPath)) {
					return indexPath;
				}
			}
		}

		return null;
	}

	/**
	 * Check if file exists
	 */
	private fileExists(filePath: string): boolean {
		try {
			return fs.statSync(filePath).isFile();
		} catch {
			return false;
		}
	}

	/**
	 * Check if directory exists
	 */
	private directoryExists(dirPath: string): boolean {
		try {
			return fs.statSync(dirPath).isDirectory();
		} catch {
			return false;
		}
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Go to Import extension is now active!');

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
			{ language },
			linkProvider
		);
		context.subscriptions.push(disposable);
	}

	// Keep the hello world command for testing
	const helloWorldDisposable = vscode.commands.registerCommand('go-to-import.helloWorld', () => {
		vscode.window.showInformationMessage('Go to Import extension is working! Try clicking on an import path.');
	});

	context.subscriptions.push(helloWorldDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
