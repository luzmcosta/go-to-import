# Python package for Go to Import Extension Demo
"""
This package demonstrates various Python import patterns for testing
the Go to Import extension functionality.

Modules:
- sibling_module: Core utilities and classes
- test_file: Main demonstration file
- test: Alternative demo with different patterns
- python_utils: Cross-language analysis utilities
"""

from .sibling_module import (
    DataProcessor,
    UserManager,
    format_file_path,
    load_json_config,
    calculate_statistics,
    SUPPORTED_FILE_TYPES,
    DEFAULT_CONFIG
)

from .python_utils import (
    ProjectAnalyzer,
    ImportExtractor,
    analyze_cross_language_imports,
    generate_import_examples
)

# Package metadata
__version__ = "1.0.0"
__author__ = "Go to Import Extension Demo"
__description__ = "Python import demonstration package"

# Convenience imports for testing
def quick_demo():
    """Run a quick demonstration of the package functionality."""
    print(f"📦 Python Demo Package v{__version__}")
    print(f"   Description: {__description__}")

    # Quick processor demo
    processor = DataProcessor("QuickDemo")
    sample_data = ["apple", "banana", "cherry"]
    processed = processor.process_list(sample_data)
    print(f"   Processed {len(processed)} items")

    # Quick user manager demo
    user_manager = UserManager()
    user_manager.add_user("Demo User", "demo@example.com")
    print(f"   Created user manager with {len(user_manager.users)} users")

    return {
        "processor": processor,
        "user_manager": user_manager,
        "supported_types": SUPPORTED_FILE_TYPES
    }

# Re-export key constants
__all__ = [
    "DataProcessor",
    "UserManager",
    "ProjectAnalyzer",
    "ImportExtractor",
    "quick_demo",
    "SUPPORTED_FILE_TYPES",
    "DEFAULT_CONFIG"
]
