# Sibling Module - Python utilities for Go to Import Extension Demo
"""
This module demonstrates various Python programming patterns and serves as
an import target for testing the Go to Import extension.
"""

import os
import json
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from pathlib import Path

# Import from the JavaScript helpers (cross-language demo)
# Note: This would require a bridge in a real application


class DataProcessor:
    """A class for processing various data types."""

    def __init__(self, name: str = "DefaultProcessor"):
        self.name = name
        self.created_at = datetime.now()

    @staticmethod
    def process_list(data: List[Any]) -> List[Dict[str, Any]]:
        """Process a list of items into a standardized format."""
        return [
            {
                "id": i,
                "value": item,
                "type": type(item).__name__,
                "processed": True
            }
            for i, item in enumerate(data)
        ]

    @classmethod
    def from_config(cls, config_path: str) -> 'DataProcessor':
        """Create a DataProcessor instance from a config file."""
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
            return cls(config.get("name", "ConfigProcessor"))
        return cls()

    def validate_data(self, data: Any) -> bool:
        """Validate if data is processable."""
        return data is not None and len(str(data)) > 0


class UserManager:
    """Manages user data and operations."""

    def __init__(self):
        self.users: List[Dict[str, Any]] = []

    def add_user(self, name: str, email: str, age: Optional[int] = None) -> Dict[str, Any]:
        """Add a new user."""
        user = {
            "id": len(self.users) + 1,
            "name": name,
            "email": email,
            "age": age,
            "created_at": datetime.now().isoformat(),
            "is_active": True
        }
        self.users.append(user)
        return user

    def get_active_users(self) -> List[Dict[str, Any]]:
        """Get all active users."""
        return [user for user in self.users if user.get("is_active", False)]

    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find a user by email address."""
        for user in self.users:
            if user.get("email") == email:
                return user
        return None


def format_file_path(file_path: Union[str, Path]) -> str:
    """Format a file path for display."""
    path = Path(file_path)
    return f"{path.parent}/{path.name} ({'exists' if path.exists() else 'missing'})"


def load_json_config(config_path: str, default: Dict[str, Any] = None) -> Dict[str, Any]:
    """Load JSON configuration with fallback to default."""
    if default is None:
        default = {}

    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load config from {config_path}: {e}")
        return default


def calculate_statistics(numbers: List[Union[int, float]]) -> Dict[str, float]:
    """Calculate basic statistics for a list of numbers."""
    if not numbers:
        return {"count": 0, "sum": 0, "average": 0, "min": 0, "max": 0}

    return {
        "count": len(numbers),
        "sum": sum(numbers),
        "average": sum(numbers) / len(numbers),
        "min": min(numbers),
        "max": max(numbers)
    }


# Constants for demonstration
SUPPORTED_FILE_TYPES = [".py", ".js", ".jsx", ".ts", ".tsx", ".css", ".json"]
DEFAULT_CONFIG = {
    "app_name": "Go to Import Extension Demo",
    "version": "1.0.0",
    "debug": True,
    "max_imports": 100
}

# Module-level initialization
print(f"Sibling module loaded: {__name__}")

if __name__ == "__main__":
    # Demo usage when run directly
    processor = DataProcessor("DemoProcessor")
    print(f"Created processor: {processor.name}")

    sample_data = [1, "hello", [1, 2, 3], {"key": "value"}]
    processed = processor.process_list(sample_data)
    print(f"Processed {len(processed)} items")

    user_manager = UserManager()
    user_manager.add_user("Alice Smith", "alice@example.com", 30)
    user_manager.add_user("Bob Johnson", "bob@example.com", 25)

    print(f"Active users: {len(user_manager.get_active_users())}")
    print(f"Statistics demo: {calculate_statistics([1, 2, 3, 4, 5])}")
