const fs = require('fs').promises;
const path = require('path');

// Mock VS Code workspace APIs
const mockVscode = {
    workspace: {
        fs: {
            readFile: async (uri) => {
                const content = await fs.readFile(uri.fsPath, 'utf8');
                return Buffer.from(content);
            }
        }
    },
    Uri: {
        file: (filePath) => ({ fsPath: filePath })
    }
};

// Mock the extension class methods
class MockGoToImportProvider {
    constructor() {
        this.workspaceRoot = path.join(__dirname, 'example');
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async tryCommonExtensions(basePath) {
        const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json'];
        for (const ext of extensions) {
            const testPath = basePath + ext;
            if (await this.fileExists(testPath)) {
                return testPath;
            }
        }
        return null;
    }

    async isPathAlias(importPath) {
        return importPath.startsWith('@/') ||
               importPath.startsWith('~/') ||
               importPath.startsWith('src/');
    }

    async loadFromTsConfig(workspaceRoot, aliases) {
        const tsconfigPath = path.join(workspaceRoot, 'tsconfig.json');
        try {
            if (await this.fileExists(tsconfigPath)) {
                const content = await fs.readFile(tsconfigPath, 'utf8');
                const config = JSON.parse(content);

                if (config.compilerOptions?.paths) {
                    for (const [alias, targets] of Object.entries(config.compilerOptions.paths)) {
                        if (Array.isArray(targets) && targets.length > 0) {
                            const cleanAlias = alias.replace('/*', '/');
                            const cleanTarget = targets[0].replace('/*', '');
                            const absoluteTarget = path.resolve(workspaceRoot, cleanTarget);
                            aliases.set(cleanAlias, absoluteTarget);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Error loading tsconfig.json:', error.message);
        }
    }

    async loadFromJsConfig(workspaceRoot, aliases) {
        // Similar to tsconfig
    }

    async loadFromViteConfig(workspaceRoot, aliases) {
        const viteConfigs = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'];

        // Search for vite config files in workspace root and subdirectories
        const searchPaths = [
            workspaceRoot,
            path.join(workspaceRoot, 'example'),
        ];

        for (const searchPath of searchPaths) {
            for (const configFile of viteConfigs) {
                const configPath = path.join(searchPath, configFile);
                try {
                    if (await this.fileExists(configPath)) {
                        const content = await fs.readFile(configPath, 'utf8');

                        // The directory containing the vite config (this is the base for relative paths)
                        const configDir = path.dirname(configPath);

                        // Parse Vite-style aliases with fileURLToPath(new URL(...))
                        const urlAliasMatches = content.matchAll(/['"`]([^'"`]+)['"`]\s*:\s*fileURLToPath\(new\s+URL\(\s*['"`]([^'"`]+)['"`]/g);
                        for (const match of urlAliasMatches) {
                            const alias = match[1];
                            const relativeTarget = match[2];

                            // Convert relative path to absolute, relative to the config file's directory
                            let absoluteTarget;
                            if (relativeTarget.startsWith('./')) {
                                absoluteTarget = path.resolve(configDir, relativeTarget.substring(2));
                            } else if (relativeTarget.startsWith('../')) {
                                absoluteTarget = path.resolve(configDir, relativeTarget);
                            } else {
                                absoluteTarget = path.resolve(configDir, relativeTarget);
                            }

                            // Ensure alias ends with / for proper matching
                            const aliasKey = alias.endsWith('/') ? alias : alias + '/';
                            aliases.set(aliasKey, absoluteTarget);

                            console.log(`Loaded Vite alias "${aliasKey}" -> "${absoluteTarget}" from ${configPath}`);
                        }
                    }

                    // Simple regex-based parsing for other common alias patterns
                    const simpleAliasMatches = content.matchAll(/['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/g);
                    for (const match of simpleAliasMatches) {
                        const alias = match[1];
                        const target = match[2];

                        // Skip if we already processed this as a URL-based alias
                        const aliasKey = alias.endsWith('/') ? alias : alias + '/';
                        if (!aliases.has(aliasKey)) {
                            const absoluteTarget = path.resolve(configDir, target);
                            aliases.set(aliasKey, absoluteTarget);
                            console.log(`Loaded simple alias "${aliasKey}" -> "${absoluteTarget}" from ${configPath}`);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error loading ${configPath}:`, error.message);
            }
        }
    }

    async loadFromWebpackConfig(workspaceRoot, aliases) {
        // Similar pattern
    }
        // Similar pattern
    }

    async loadPathAliasesFromConfig(workspaceRoot) {
        const aliases = new Map();

        await Promise.all([
            this.loadFromTsConfig(workspaceRoot, aliases),
            this.loadFromViteConfig(workspaceRoot, aliases),
            this.loadFromWebpackConfig(workspaceRoot, aliases)
        ]);

        return aliases;
    }

    async resolvePathAlias(importPath, workspaceRoot) {
        // First try to load aliases from config files
        const configAliases = await this.loadPathAliasesFromConfig(workspaceRoot);

        for (const [alias, target] of configAliases) {
            if (importPath.startsWith(alias)) {
                const relativePath = importPath.substring(alias.length);
                return path.join(target, relativePath);
            }
        }

        // Fallback to common defaults if no config found
        if (importPath.startsWith('@/')) {
            // Try src/ first, then workspace root
            const srcPath = path.join(workspaceRoot, 'src', importPath.substring(2));
            if (await this.fileExists(srcPath) || await this.tryCommonExtensions(srcPath)) {
                return srcPath;
            }
            // Fallback to workspace root for the example
            return path.join(workspaceRoot, importPath.substring(2));
        }

        if (importPath.startsWith('~/')) {
            return path.join(workspaceRoot, importPath.substring(2));
        }

        if (importPath.startsWith('src/')) {
            return path.join(workspaceRoot, importPath);
        }

        return path.join(workspaceRoot, importPath);
    }

    async testResolveImportPath(importPath) {
        const workspaceRoot = this.workspaceRoot;
        let resolvedPath;

        try {
            // Handle path aliases first
            if (await this.isPathAlias(importPath)) {
                resolvedPath = await this.resolvePathAlias(importPath, workspaceRoot);
            } else {
                // For this test, assume everything is workspace relative
                resolvedPath = path.join(workspaceRoot, importPath);
            }

            // Try common file extensions if no extension provided
            if (!path.extname(resolvedPath)) {
                const withExtension = await this.tryCommonExtensions(resolvedPath);
                if (withExtension) {
                    resolvedPath = withExtension;
                }
            }

            // Check if file exists
            return (await this.fileExists(resolvedPath)) ? resolvedPath : null;
        } catch (error) {
            console.warn('Error resolving path:', error.message);
            return null;
        }
    }
}

// Test the path resolution
async function testPathResolution() {
    const provider = new MockGoToImportProvider();

    const testPaths = [
        '@/firebase/fireauth.js',
        '@/firebase/firestore.js',
        '@/utils/error.js',
        'src/stores/setting.js',
        '@/stores/user',
        '@/stores/api',
        '@/utils/env.js',
        '@root/example/stores/api.js'
    ];

    console.log('Testing path resolution...\n');
    console.log('Workspace root:', provider.workspaceRoot, '\n');

    for (const testPath of testPaths) {
        console.log(`Testing: "${testPath}"`);
        const resolved = await provider.testResolveImportPath(testPath);

        if (resolved) {
            console.log(`  ✅ Resolved to: ${resolved}`);
            console.log(`  📁 File exists: ${await provider.fileExists(resolved)}`);
        } else {
            console.log(`  ❌ Could not resolve`);
        }
        console.log('');
    }
}

testPathResolution().catch(console.error);
