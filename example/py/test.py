# 🐍 Python Import Patterns Demo for Go to Import Extension
"""
This file demonstrates various Python import patterns and how they work
with the Go to Import extension. Click on any import path to navigate!
"""

# Standard library imports - different styles
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from collections import namedtuple, OrderedDict
from functools import wraps, partial
from itertools import chain, combinations
from contextlib import contextmanager

# Import with alias
import sqlite3 as db
from typing import Dict, List, Optional, Union, Callable, Any, Type
from dataclasses import dataclass, field

# Conditional imports
try:
    import tomllib  # Python 3.11+
except ImportError:
    try:
        import tomli as tomllib  # Fallback for older Python
    except ImportError:
        tomllib = None

# Local relative imports
from . import sibling_module as sibling
from .sibling_module import DataProcessor, UserManager, SUPPORTED_FILE_TYPES

# Try to import from JavaScript utilities (cross-language demo)
# Note: In a real scenario, you might use a Python-JavaScript bridge
parent_path = Path(__file__).parent.parent
if (parent_path / "utils" / "helpers.js").exists():
    print("JavaScript helper file found - would need bridge for actual import")

# Multiple imports on one line
from datetime import date, time, timezone, timedelta

# Wildcard import (not recommended but valid)
# from sibling_module import *  # Commented out for best practices


User = namedtuple('User', ['id', 'name', 'email', 'active'])


@dataclass
class ImportExample:
    """Example of import usage patterns."""
    module_name: str
    import_style: str
    usage_example: str
    is_relative: bool = False
    notes: List[str] = field(default_factory=list)


class PythonImportDemo:
    """Demonstrates various Python import patterns."""

    def __init__(self):
        self.examples: List[ImportExample] = []
        self.setup_examples()

    def setup_examples(self):
        """Set up import examples."""
        self.examples = [
            ImportExample(
                module_name="os",
                import_style="import os",
                usage_example="os.path.join('a', 'b')",
                notes=["Standard library", "Full module import"]
            ),
            ImportExample(
                module_name="pathlib.Path",
                import_style="from pathlib import Path",
                usage_example="Path(__file__).parent",
                notes=["Specific import", "Modern path handling"]
            ),
            ImportExample(
                module_name="typing",
                import_style="from typing import Dict, List",
                usage_example="def func(data: Dict[str, List[int]])",
                notes=["Type hints", "Multiple imports"]
            ),
            ImportExample(
                module_name="sibling_module",
                import_style="from . import sibling_module",
                usage_example="sibling_module.DataProcessor()",
                is_relative=True,
                notes=["Relative import", "Same package"]
            ),
            ImportExample(
                module_name="sqlite3 as db",
                import_style="import sqlite3 as db",
                usage_example="db.connect(':memory:')",
                notes=["Import with alias", "Shorter name"]
            )
        ]

    @contextmanager
    def timer_context(self, operation_name: str):
        """Context manager for timing operations."""
        start_time = datetime.now()
        print(f"⏱️  Starting {operation_name}...")
        try:
            yield
        finally:
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            print(f"✅ {operation_name} completed in {duration:.3f}s")

    def demonstrate_stdlib_usage(self):
        """Demonstrate usage of standard library imports."""
        print("\n📚 Standard Library Import Demonstrations:")

        # os module usage
        current_dir = os.getcwd()
        print(f"  Current directory (os): {current_dir}")

        # pathlib usage
        current_path = Path.cwd()
        print(f"  Current directory (pathlib): {current_path}")

        # datetime usage
        now = datetime.now()
        formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
        print(f"  Current time: {formatted_date}")

        # collections usage
        counter = OrderedDict([('a', 1), ('b', 2), ('c', 3)])
        print(f"  OrderedDict example: {dict(counter)}")

        # JSON usage
        sample_data = {"name": "Python Demo", "version": 1.0, "active": True}
        json_str = json.dumps(sample_data, indent=2)
        print(f"  JSON serialization:\n{json_str}")

    def demonstrate_local_imports(self):
        """Demonstrate usage of local imports."""
        print("\n🏠 Local Import Demonstrations:")

        # Use DataProcessor from sibling module
        processor = DataProcessor("TestProcessor")
        sample_data = ["apple", "banana", "cherry", 123, True]
        processed = processor.process_list(sample_data)
        print(f"  Processed {len(processed)} items with DataProcessor")

        # Use UserManager
        user_manager = UserManager()
        user_manager.add_user("Test User", "test@example.com", 25)
        active_users = user_manager.get_active_users()
        print(f"  Created user manager with {len(active_users)} active users")

        # Use constants from sibling module
        print(f"  Supported file types: {SUPPORTED_FILE_TYPES}")

        # Use imported namedtuple
        demo_user = User(1, "Demo User", "demo@example.com", True)
        print(f"  Namedtuple user: {demo_user.name} ({demo_user.email})")

    def demonstrate_typing_usage(self):
        """Demonstrate type hint usage."""
        print("\n🏷️  Type Hint Demonstrations:")

        def process_user_data(users: List[Dict[str, Any]]) -> Dict[str, int]:
            """Process user data and return statistics."""
            stats = {
                "total_users": len(users),
                "active_users": sum(1 for u in users if u.get("active", False)),
                "average_age": 0
            }

            ages = [u.get("age") for u in users if u.get("age")]
            if ages:
                stats["average_age"] = int(sum(ages) / len(ages))

            return stats

        sample_users = [
            {"name": "Alice", "age": 30, "active": True},
            {"name": "Bob", "age": 25, "active": False},
            {"name": "Carol", "age": 35, "active": True}
        ]

        stats = process_user_data(sample_users)
        print(f"  User statistics: {stats}")

        # Optional type usage
        def find_user(name: str, users: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
            """Find user by name."""
            for user in users:
                if user.get("name") == name:
                    return user
            return None

        found_user = find_user("Alice", sample_users)
        print(f"  Found user: {found_user['name'] if found_user else 'None'}")

    def analyze_imports(self):
        """Analyze and display import information."""
        print("\n🔍 Import Analysis:")

        for example in self.examples:
            relative_indicator = "📁" if example.is_relative else "🌐"
            print(f"  {relative_indicator} {example.module_name}")
            print(f"      Style: {example.import_style}")
            print(f"      Usage: {example.usage_example}")
            if example.notes:
                print(f"      Notes: {', '.join(example.notes)}")
            print()

    def check_optional_imports(self):
        """Check status of optional imports."""
        print("\n🔧 Optional Import Status:")

        # Check tomllib availability
        if tomllib:
            print("  ✅ TOML support available")
            try:
                # Demo TOML parsing if available
                sample_toml = b"""
[package]
name = "go-to-import-demo"
version = "1.0.0"
description = "Demo package"
"""
                if hasattr(tomllib, 'loads'):
                    parsed = tomllib.loads(sample_toml.decode())
                    print(f"      Sample TOML parsed: {parsed['package']['name']}")
            except Exception as e:
                print(f"      TOML parsing error: {e}")
        else:
            print("  ❌ TOML support not available")

        # Check for other optional modules
        optional_modules = ['requests', 'numpy', 'pandas', 'matplotlib']
        for module_name in optional_modules:
            try:
                __import__(module_name)
                print(f"  ✅ {module_name} available")
            except ImportError:
                print(f"  📦 {module_name} not installed (optional)")

    def run_demo(self):
        """Run the complete import demonstration."""
        print("=" * 70)
        print("🐍 Python Import Patterns Demo")
        print("   Click on any import statement above to navigate with the extension!")
        print("=" * 70)

        with self.timer_context("Complete Import Demo"):
            self.demonstrate_stdlib_usage()
            self.demonstrate_local_imports()
            self.demonstrate_typing_usage()
            self.analyze_imports()
            self.check_optional_imports()

        print("\n" + "=" * 70)
        print("🔗 Navigation Tips:")
        print("   • Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) on import paths")
        print("   • Right-click → 'Jump to Import File'")
        print("   • Command Palette → 'Jump to Import File'")
        print("   • Status bar '🔗 Go to Import' button")
        print("=" * 70)


def functional_demo():
    """Demonstrate functional programming with imports."""
    print("\n⚡ Functional Programming Demo:")

    # Using functools
    @wraps
    def log_calls(func):
        """Decorator to log function calls."""
        def wrapper(*args, **kwargs):
            print(f"    Calling {func.__name__} with args: {args[:2]}...")
            return func(*args, **kwargs)
        return wrapper

    # Using partial
    multiply_by_two = partial(lambda x, y: x * y, 2)
    result = multiply_by_two(5)
    print(f"  Partial function result: {result}")

    # Using itertools
    numbers = [1, 2, 3, 4, 5]
    pairs = list(combinations(numbers, 2))
    print(f"  Combinations of {numbers[:3]}... : {pairs[:3]}...")

    chained = list(chain([1, 2], [3, 4], [5, 6]))
    print(f"  Chained iterables: {chained}")


def main():
    """Main function to run the Python import demo."""
    # Create and run the demo
    demo = PythonImportDemo()
    demo.run_demo()

    # Additional functional demo
    functional_demo()

    # Final message
    print(f"\n🎯 Demo completed at {datetime.now().strftime('%H:%M:%S')}")
    print("   All import statements above are clickable with the Go to Import extension!")


if __name__ == "__main__":
    main()
