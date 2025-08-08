# 🚀 Go to Import Extension Demo
# Try these methods to navigate to imported files:
#
# Method 1: Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) on any import path
# Method 2: Press Cmd+Shift+G (Mac) / Ctrl+Shift+G (Windows/Linux)
# Method 3: Right-click on import path → "Jump to Import File"
# Method 4: Click the "🔗 Go to Import" button in the status bar
# Method 5: Command Palette → "Jump to Import File"
#
# 💡 Tip: If Cmd+Click creates multiple cursors, change "editor.multiCursorModifier" to "altKey" in settings

import os
import sys
from pathlib import Path
from utils.helpers import process_data
from .local_module import LocalClass
import json

import test

# Relative imports
from ..parent_module import ParentClass
from . import sibling_module

def main():
    print("Testing Python imports with Go to Import extension")
    print("Click on any import statement above!")

if __name__ == "__main__":
    main()
