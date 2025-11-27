import os
import sys

# Ensure the app package is importable when running pytest from the
# project root (india-tour-safety-api).
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
