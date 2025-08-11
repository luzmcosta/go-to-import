const fs = require('fs');
const path = require('path');

// Read the test file
const testFilePath = path.join(__dirname, 'example', 'test-store.js');
const testContent = fs.readFileSync(testFilePath, 'utf8');

console.log('Testing regex patterns against test-store.js\n');
console.log('File content length:', testContent.length, 'characters\n');

// The regex patterns from the extension
const importPatterns = [
    // JavaScript/TypeScript import statements (improved with multiline support)
    /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/gms,
    /import\s+['"`]([^'"`]+)['"`]/gm,
    /require\(['"`]([^'"`]+)['"`]\)/gm,

    // Named and default imports (more comprehensive)
    /import\s*\{[^}]*\}\s*from\s*['"`]([^'"`]+)['"`]/gms,
    /import\s+\w+\s*,?\s*\{[^}]*\}\s*from\s*['"`]([^'"`]+)['"`]/gms,
    /import\s+\w+\s+from\s+['"`]([^'"`]+)['"`]/gm,

    // Export from statements
    /export\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/gms,
    /export\s*\{[^}]*\}\s*from\s*['"`]([^'"`]+)['"`]/gms,

    // Python import statements (more specific to avoid JS conflicts)
    /^from\s+([^\s'"`]+)\s+import/gm,
    /^import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)/gm,

    // CSS/SCSS imports
    /@import\s+['"`]([^'"`]+)['"`]/gm,

    // Dynamic imports
    /import\(['"`]([^'"`]+)['"`]\)/gm,
];

const patternNames = [
    'General import with from',
    'Direct import',
    'Require statement',
    'Named imports with braces',
    'Mixed default and named imports',
    'Default import only',
    'Export from statements (general)',
    'Export from statements (named)',
    'Python from import',
    'Python import',
    'CSS/SCSS import',
    'Dynamic import'
];

let totalMatches = 0;
const allMatches = [];

importPatterns.forEach((pattern, index) => {
    console.log(`\n=== Pattern ${index + 1}: ${patternNames[index]} ===`);
    console.log('Regex:', pattern.toString());

    pattern.lastIndex = 0; // Reset regex state
    let match;
    let matchCount = 0;

    while ((match = pattern.exec(testContent)) !== null && matchCount < 100) {
        matchCount++;
        totalMatches++;
        const importPath = match[1];
        const fullMatch = match[0];
        const position = match.index;

        // Get line number
        const beforeMatch = testContent.substring(0, position);
        const lineNumber = beforeMatch.split('\n').length;

        console.log(`  Match ${matchCount}:`);
        console.log(`    Line ${lineNumber}: "${importPath}"`);
        console.log(`    Full match: "${fullMatch.replace(/\s+/g, ' ')}"`);
        console.log(`    Position: ${position}`);

        allMatches.push({
            pattern: index + 1,
            patternName: patternNames[index],
            importPath,
            fullMatch: fullMatch.replace(/\s+/g, ' '),
            line: lineNumber,
            position
        });
    }

    if (matchCount === 0) {
        console.log('  No matches found');
    }
});

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total matches found: ${totalMatches}`);
console.log(`Unique import paths:`);

const uniquePaths = [...new Set(allMatches.map(m => m.importPath))];
uniquePaths.forEach((path, index) => {
    console.log(`  ${index + 1}. "${path}"`);
});

console.log(`\n=== ALL MATCHES BY LINE ===`);
allMatches.sort((a, b) => a.line - b.line);
allMatches.forEach(match => {
    console.log(`Line ${match.line}: "${match.importPath}" (Pattern ${match.pattern}: ${match.patternName})`);
});
