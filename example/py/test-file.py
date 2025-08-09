# 🚀 Go to Import Extension Demo - Python Edition
# Try these methods to navigate to imported files:
#
# Method 1: Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) on any import path
# Method 2: Press Cmd+Shift+G (Mac) / Ctrl+Shift+G (Windows/Linux)
# Method 3: Right-click on import path → "Jump to Import File"
# Method 4: Click the "🔗 Go to Import" button in the status bar
# Method 5: Command Palette → "Jump to Import File"
#
# 💡 Tip: If Cmd+Click creates multiple cursors, change "editor.multiCursorModifier" to "altKey" in settings

# Standard library imports
import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union, Tuple
from collections import defaultdict, Counter
from dataclasses import dataclass
from enum import Enum

# Third-party imports (for demonstration - may not be installed)
try:
    import requests # type: ignore
    import numpy as np # type: ignore
    HAS_THIRD_PARTY = True
except ImportError:
    HAS_THIRD_PARTY = False

# Local imports - relative imports within the same package
from . import sibling_module
from .sibling_module import DataProcessor, UserManager, format_file_path, DEFAULT_CONFIG

# Cross-language imports (conceptual - accessing JavaScript config)
import sys
sys.path.append('..')
try:
    # This demonstrates importing from parent directory
    from utils.helpers import processData as js_process_data # type: ignore
except ImportError:
    js_process_data = None

# Import JSON configuration
CONFIG_PATH = "../config.json"


@dataclass
class ImportDemo:
    """Data class demonstrating import testing."""
    name: str
    import_type: str
    file_path: str
    is_available: bool = True
    description: str = ""


class ImportType(Enum):
    """Enumeration of different import types."""
    STANDARD = "standard"
    THIRD_PARTY = "third_party"
    LOCAL = "local"
    RELATIVE = "relative"
    CONDITIONAL = "conditional"


def load_configuration() -> Dict[str, Any]:
    """Load configuration from JSON file."""
    try:
        config_path = Path(__file__).parent / CONFIG_PATH
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load config: {e}")

    return DEFAULT_CONFIG.copy()


def demonstrate_imports() -> List[ImportDemo]:
    """Demonstrate various types of imports."""
    demos = [
        ImportDemo(
            name="Standard Library",
            import_type=ImportType.STANDARD.value,
            file_path="os, sys, json, pathlib, datetime",
            description="Built-in Python modules"
        ),
        ImportDemo(
            name="Typing Support",
            import_type=ImportType.STANDARD.value,
            file_path="typing module",
            description="Type hints for better code documentation"
        ),
        ImportDemo(
            name="Sibling Module",
            import_type=ImportType.RELATIVE.value,
            file_path="./sibling_module.py",
            description="Local module in the same directory"
        ),
        ImportDemo(
            name="Third-party Libraries",
            import_type=ImportType.THIRD_PARTY.value,
            file_path="requests, numpy",
            is_available=HAS_THIRD_PARTY,
            description="External packages (may not be installed)"
        ),
        ImportDemo(
            name="JavaScript Config",
            import_type=ImportType.CONDITIONAL.value,
            file_path="../config.json",
            is_available=js_process_data is not None,
            description="Cross-language configuration access"
        )
    ]

    return demos


async def async_demo_function():
    """Demonstrate async imports and functionality."""
    print("🔄 Running async demo...")
    await asyncio.sleep(0.1)  # Simulate async work
    return "Async operation completed"


def process_with_imported_modules():
    """Use imported modules to process data."""
    # Use local imports
    processor = DataProcessor("PythonDemo")
    user_manager = UserManager()

    # Add some demo users
    users_data = [
        ("Alice Johnson", "alice@demo.com", 28),
        ("Bob Smith", "bob@demo.com", 32),
        ("Carol Davis", "carol@demo.com", 26)
    ]

    for name, email, age in users_data:
        user_manager.add_user(name, email, age)

    # Process sample data
    sample_data = [1, 2, 3, "hello", "world", [1, 2], {"key": "value"}]
    processed_data = processor.process_list(sample_data)

    # Get statistics
    numbers = [user["age"] for user in user_manager.users if user.get("age")]
    stats = sibling_module.calculate_statistics(numbers)

    return {
        "processed_items": len(processed_data),
        "active_users": len(user_manager.get_active_users()),
        "age_statistics": stats,
        "processor_name": processor.name
    }


def analyze_file_structure():
    """Analyze the current file structure for import demonstration."""
    current_dir = Path(__file__).parent
    parent_dir = current_dir.parent

    structure = {
        "current_directory": str(current_dir),
        "python_files": [],
        "javascript_files": [],
        "other_files": []
    }

    # Analyze current directory
    for file_path in current_dir.iterdir():
        if file_path.is_file():
            if file_path.suffix == ".py":
                structure["python_files"].append(file_path.name)
            elif file_path.suffix in [".js", ".jsx", ".ts", ".tsx"]:
                structure["javascript_files"].append(file_path.name)
            else:
                structure["other_files"].append(file_path.name)

    # Check for config files in parent
    config_file = parent_dir / "config.json"
    if config_file.exists():
        structure["config_available"] = True
        structure["config_path"] = str(config_file)

    return structure


def main():
    """Main function demonstrating Python imports for the Go to Import extension."""
    print("=" * 60)
    print("🐍 Python Import Demo for Go to Import Extension")
    print("=" * 60)

    # Load configuration
    config = load_configuration()
    print(f"📄 Loaded config: {config.get('app_name', 'Unknown')}")

    # Demonstrate imports
    import_demos = demonstrate_imports()
    print(f"\n📦 Import Types Demonstrated ({len(import_demos)}):")
    for demo in import_demos:
        status = "✅" if demo.is_available else "❌"
        print(f"  {status} {demo.name} ({demo.import_type})")
        print(f"      Path: {demo.file_path}")
        print(f"      Description: {demo.description}")

    # Process data with imported modules
    print("\n🔄 Processing data with imported modules...")
    results = process_with_imported_modules()
    for key, value in results.items():
        print(f"  {key}: {value}")

    # Analyze file structure
    print("\n📁 File Structure Analysis:")
    structure = analyze_file_structure()
    for key, value in structure.items():
        if isinstance(value, list):
            print(f"  {key}: {len(value)} files")
            for item in value[:3]:  # Show first 3
                print(f"    - {item}")
            if len(value) > 3:
                print(f"    ... and {len(value) - 3} more")
        else:
            print(f"  {key}: {value}")

    # Async demo
    print("\n⚡ Running async demo...")
    try:
        result = asyncio.run(async_demo_function())
        print(f"  Result: {result}")
    except Exception as e:
        print(f"  Error: {e}")

    # Third-party demo
    if HAS_THIRD_PARTY:
        print("\n🌐 Third-party libraries available:")
        print("  - requests: for HTTP requests")
        print("  - numpy: for numerical computing")
    else:
        print("\n📦 Third-party libraries not installed (demonstration only)")

    print("\n" + "=" * 60)
    print("🔗 Click on any import statement above to navigate!")
    print("   Try: Cmd+Click (Mac) or Ctrl+Click (Windows/Linux)")
    print("=" * 60)


if __name__ == "__main__":
    main()
