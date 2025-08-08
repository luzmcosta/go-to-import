# Sample Python file to test the Go to Import extension

import os
import sys
from pathlib import Path
from utils.helpers import process_data
from .local_module import LocalClass
import json

from './test.py'

# Relative imports
from ..parent_module import ParentClass
from . import sibling_module

def main():
    print("Testing Python imports with Go to Import extension")
    print("Click on any import statement above!")

if __name__ == "__main__":
    main()
