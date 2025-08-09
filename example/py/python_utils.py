# Python utilities for cross-language import demonstration
"""
This module provides Python utilities that complement the JavaScript helpers,
demonstrating how the Go to Import extension works across different languages.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict


@dataclass
class FileInfo:
    """Information about a file in the project."""
    name: str
    path: str
    extension: str
    size_bytes: int
    last_modified: datetime
    is_importable: bool = False


class ProjectAnalyzer:
    """Analyzes project structure for import relationships."""

    IMPORTABLE_EXTENSIONS = {
        '.py': 'Python',
        '.js': 'JavaScript',
        '.jsx': 'JSX',
        '.ts': 'TypeScript',
        '.tsx': 'TSX',
        '.json': 'JSON',
        '.css': 'CSS'
    }

    def __init__(self, project_root: Union[str, Path]):
        self.project_root = Path(project_root)
        self.files: List[FileInfo] = []
        self.scan_project()

    def scan_project(self):
        """Scan the project directory for files."""
        self.files = []

        for file_path in self.project_root.rglob('*'):
            if file_path.is_file() and not self._should_ignore(file_path):
                info = self._create_file_info(file_path)
                self.files.append(info)

    def _should_ignore(self, file_path: Path) -> bool:
        """Check if file should be ignored."""
        ignore_patterns = [
            '*.pyc', '__pycache__', '.git', 'node_modules',
            '.DS_Store', '*.vsix', '*.log'
        ]

        for pattern in ignore_patterns:
            if file_path.match(pattern) or any(part.startswith('.') for part in file_path.parts[:-1]):
                return True
        return False

    def _create_file_info(self, file_path: Path) -> FileInfo:
        """Create FileInfo object for a file."""
        relative_path = file_path.relative_to(self.project_root)
        stats = file_path.stat()

        return FileInfo(
            name=file_path.name,
            path=str(relative_path),
            extension=file_path.suffix,
            size_bytes=stats.st_size,
            last_modified=datetime.fromtimestamp(stats.st_mtime),
            is_importable=file_path.suffix in self.IMPORTABLE_EXTENSIONS
        )

    def get_importable_files(self) -> List[FileInfo]:
        """Get all files that can be imported."""
        return [f for f in self.files if f.is_importable]

    def get_files_by_language(self) -> Dict[str, List[FileInfo]]:
        """Group files by programming language."""
        by_language = {}

        for file_info in self.get_importable_files():
            language = self.IMPORTABLE_EXTENSIONS.get(file_info.extension, 'Other')
            if language not in by_language:
                by_language[language] = []
            by_language[language].append(file_info)

        return by_language

    def find_import_targets(self, file_path: str) -> List[str]:
        """Find potential import targets for a given file."""
        current_file = Path(self.project_root / file_path)
        if not current_file.exists():
            return []

        targets = []
        current_dir = current_file.parent

        # Same directory imports
        for file_info in self.files:
            target_path = Path(self.project_root / file_info.path)
            if target_path.parent == current_dir and target_path != current_file:
                if file_info.is_importable:
                    targets.append(f"./{file_info.name}")

        # Parent directory imports
        if current_dir != self.project_root:
            parent_files = [f for f in self.files if Path(self.project_root / f.path).parent == current_dir.parent]
            for file_info in parent_files:
                if file_info.is_importable:
                    targets.append(f"../{file_info.name}")

        return targets


class ImportExtractor:
    """Extracts import statements from source files."""

    # Regex patterns for different import styles
    PYTHON_IMPORT_PATTERNS = [
        r'^\s*import\s+([a-zA-Z_][a-zA-Z0-9_.]*)',
        r'^\s*from\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+import',
        r'^\s*from\s+(\.[a-zA-Z_][a-zA-Z0-9_.]*)\s+import',  # Relative imports
    ]

    JAVASCRIPT_IMPORT_PATTERNS = [
        r'^\s*import.*from\s+[\'"]([^\'"]+)[\'"]',
        r'^\s*import\s+[\'"]([^\'"]+)[\'"]',
        r'^\s*const.*=\s*require\([\'"]([^\'"]+)[\'"]\)',
    ]

    def extract_imports_from_file(self, file_path: Union[str, Path]) -> List[str]:
        """Extract import statements from a file."""
        file_path = Path(file_path)

        if not file_path.exists():
            return []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            return []

        if file_path.suffix == '.py':
            return self._extract_python_imports(content)
        elif file_path.suffix in ['.js', '.jsx', '.ts', '.tsx']:
            return self._extract_javascript_imports(content)

        return []

    def _extract_python_imports(self, content: str) -> List[str]:
        """Extract Python import statements."""
        imports = []
        lines = content.split('\n')

        for line in lines:
            for pattern in self.PYTHON_IMPORT_PATTERNS:
                match = re.match(pattern, line.strip())
                if match:
                    imports.append(match.group(1))
                    break

        return imports

    def _extract_javascript_imports(self, content: str) -> List[str]:
        """Extract JavaScript/TypeScript import statements."""
        imports = []
        lines = content.split('\n')

        for line in lines:
            for pattern in self.JAVASCRIPT_IMPORT_PATTERNS:
                match = re.search(pattern, line.strip())
                if match:
                    imports.append(match.group(1))
                    break

        return imports


def analyze_cross_language_imports(project_root: str = '.') -> Dict[str, Any]:
    """Analyze imports across different languages in the project."""
    analyzer = ProjectAnalyzer(project_root)
    extractor = ImportExtractor()

    analysis = {
        'project_root': str(analyzer.project_root),
        'total_files': len(analyzer.files),
        'importable_files': len(analyzer.get_importable_files()),
        'by_language': {},
        'import_relationships': {}
    }

    # Analyze files by language
    by_language = analyzer.get_files_by_language()
    for language, files in by_language.items():
        analysis['by_language'][language] = {
            'count': len(files),
            'files': [f.name for f in files[:5]]  # First 5 files
        }

    # Analyze import relationships
    for file_info in analyzer.get_importable_files()[:10]:  # Limit to first 10 files
        file_path = analyzer.project_root / file_info.path
        imports = extractor.extract_imports_from_file(file_path)

        if imports:
            analysis['import_relationships'][file_info.path] = imports[:5]  # First 5 imports

    return analysis


def generate_import_examples() -> Dict[str, List[str]]:
    """Generate examples of different import patterns."""
    return {
        'python': [
            'import os',
            'from pathlib import Path',
            'from . import sibling_module',
            'from ..parent import module',
            'import json as config_parser',
        ],
        'javascript': [
            "import React from 'react'",
            "import { useState } from 'react'",
            "import './styles.css'",
            "import config from './config.json'",
            "const utils = require('./utils')",
        ],
        'typescript': [
            "import { Component } from 'react'",
            "import type { User } from './types'",
            "import * as utils from '../utils'",
            "import('./dynamic-module')",
        ]
    }


def save_analysis_report(analysis: Dict[str, Any], output_path: str = 'import_analysis.json'):
    """Save import analysis to a JSON file."""
    try:
        with open(output_path, 'w') as f:
            json.dump(analysis, f, indent=2, default=str)
        return True
    except Exception as e:
        print(f"Error saving analysis: {e}")
        return False


def main():
    """Main function for running import analysis."""
    print("🔍 Cross-Language Import Analysis")
    print("=" * 40)

    # Run analysis
    analysis = analyze_cross_language_imports('.')

    print(f"Project Root: {analysis['project_root']}")
    print(f"Total Files: {analysis['total_files']}")
    print(f"Importable Files: {analysis['importable_files']}")

    print("\nFiles by Language:")
    for language, info in analysis['by_language'].items():
        print(f"  {language}: {info['count']} files")
        if info['files']:
            print(f"    Examples: {', '.join(info['files'])}")

    print("\nImport Relationships:")
    for file_path, imports in analysis['import_relationships'].items():
        print(f"  {file_path}:")
        for imp in imports:
            print(f"    → {imp}")

    # Save report
    if save_analysis_report(analysis):
        print(f"\n📄 Analysis saved to import_analysis.json")

    print("\nImport Pattern Examples:")
    examples = generate_import_examples()
    for language, patterns in examples.items():
        print(f"  {language.title()}:")
        for pattern in patterns:
            print(f"    {pattern}")


if __name__ == "__main__":
    main()
